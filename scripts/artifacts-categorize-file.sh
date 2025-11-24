#!/bin/zsh

# Set up environment for Automator
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"
export HOME="${HOME:-/Users/$(whoami)}"

FILE="$1"

# Logging configuration - set ARTIFACTS_DEBUG=1 to enable logging
DEBUG_LOGGING="${ARTIFACTS_DEBUG:-0}"
LOG_FILE="/tmp/artifacts-categorize.log"

# Logging function
log() {
  echo "$1"
  if [ "$DEBUG_LOGGING" = "1" ]; then
    echo "$(date): $1" >> "$LOG_FILE"
  fi
}

log "artifacts-categorize-file.sh called with: '$FILE'"

# 1. Ensure file exists
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  log "File does not exist, exiting."
  exit 0
fi

BASENAME=${FILE:t}

# 2. Only act on screenshots
if [[ "$BASENAME" != Screenshot* && "$BASENAME" != "Screen Shot"* ]]; then
  log "Not a screenshot, ignoring."
  exit 0
fi

# 3. Ask for notes
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

# If user canceled → do nothing
if [ "$NOTES" = "__CANCEL__" ]; then
  log "User cancelled — skipping workflow call."
  exit 0
fi

# Empty notes are OK, continue with workflow

# Use full path to jq in case it's not in PATH
JQ_PATH=$(which jq)
if [ -z "$JQ_PATH" ]; then
  # Common jq locations
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
    log "✅ Screenshot processed successfully!"
  else
    log "❌ Processing failed"
  fi
else
  log "❌ No response received from API"
fi

exit 0
