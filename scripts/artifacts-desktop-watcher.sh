#!/bin/zsh

# Desktop watcher script for WatchPaths launchd integration
# This script is triggered when the Desktop folder changes and finds new screenshots

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"

# Get the real home directory - launchd may not set HOME
if [ -z "$HOME" ] || [ ! -d "$HOME" ]; then
  HOME=$(dscl . -read /Users/$(whoami) NFSHomeDirectory | awk '{print $2}')
fi
export HOME

# Configuration
DEBUG_LOGGING="${ARTIFACTS_DEBUG:-0}"
LOG_FILE="/tmp/artifacts-categorize.log"
PROCESSED_FILE="/tmp/artifacts-processed.txt"
WATCH_DIR="$HOME/Desktop"

# Logging function
log() {
  echo "$1"
  if [ "$DEBUG_LOGGING" = "1" ]; then
    echo "$(date): $1" >> "$LOG_FILE"
  fi
}

log "Desktop watcher triggered, scanning for new screenshots..."

# Initialize processed file if it doesn't exist
touch "$PROCESSED_FILE"

# Clean up old entries from processed file (keep last 500 entries)
if [ $(wc -l < "$PROCESSED_FILE") -gt 500 ]; then
  tail -200 "$PROCESSED_FILE" > "$PROCESSED_FILE.tmp" && mv "$PROCESSED_FILE.tmp" "$PROCESSED_FILE"
fi

# Function to check if file was already processed
is_processed() {
  grep -qxF "$1" "$PROCESSED_FILE" 2>/dev/null
}

# Function to mark file as processed
mark_processed() {
  echo "$1" >> "$PROCESSED_FILE"
}

# Find screenshot files modified in the last minute that haven't been processed
FILE=""
while IFS= read -r candidate; do
  if [ -f "$candidate" ] && ! is_processed "$candidate"; then
    FILE="$candidate"
    log "Found new screenshot: $FILE"
    break
  fi
done < <(find "$WATCH_DIR" -maxdepth 1 \( -name "Screenshot*.png" -o -name "Screen Shot*.png" \) -mmin -5 2>/dev/null | sort -r)

if [ -z "$FILE" ]; then
  log "No new screenshots found, exiting."
  exit 0
fi

BASENAME=${FILE:t}

# Mark as processed immediately to prevent duplicate processing
mark_processed "$FILE"

# Ask for notes
NOTES=$(osascript <<EOF 2>/dev/null
try
  set dlg to display dialog "Add any notes for this screenshot (optional):" default answer "" buttons {"Cancel","OK"} default button "OK"
  if button returned of dlg is "Cancel" then
    return "__CANCEL__"
  else
    return text returned of dlg
  end if
on error
  return "__CANCEL__"
end try
EOF
)

# If user canceled, do nothing
if [ "$NOTES" = "__CANCEL__" ]; then
  log "User cancelled - skipping workflow call."
  exit 0
fi

# Find jq
JQ_PATH=$(which jq)
if [ -z "$JQ_PATH" ]; then
  for jq_loc in /usr/local/bin/jq /opt/homebrew/bin/jq /usr/bin/jq; do
    if [ -x "$jq_loc" ]; then
      JQ_PATH="$jq_loc"
      break
    fi
  done
fi

if [ -z "$JQ_PATH" ]; then
  log "ERROR: jq not found!"
  exit 1
fi

PAYLOAD=$("$JQ_PATH" -n \
  --arg image_path "$FILE" \
  --arg notes "$NOTES" \
  '{inputData: {image_path: $image_path, notes: $notes}}'
)

API_URL="http://localhost:6700/api/workflows/autoArtifactAnalysisWorkflow/start-async"

log "Processing screenshot..."

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Check response status
if [ -n "$RESPONSE" ]; then
  STATUS=$(echo "$RESPONSE" | "$JQ_PATH" -r '.status // "unknown"' 2>/dev/null)

  if [ "$STATUS" = "success" ]; then
    log "Screenshot processed successfully!"
  else
    log "Processing failed"
  fi
else
  log "No response received from API"
fi

exit 0
