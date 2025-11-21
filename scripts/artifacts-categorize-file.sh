#!/bin/zsh

FILE="$1"

echo "artifacts-categorize-file.sh called with: '$FILE'"

# 1. Ensure file exists
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "File does not exist, exiting."
  exit 0
fi

BASENAME=${FILE:t}
echo "BASENAME: $BASENAME"

# 2. Only act on screenshots
if [[ "$BASENAME" != Screenshot* && "$BASENAME" != "Screen Shot"* ]]; then
  echo "Not a screenshot, ignoring."
  exit 0
fi

# 3. Ask for notes
NOTES=$(osascript <<EOF
set dlg to display dialog "Add any notes for this screenshot (optional):" default answer "" buttons {"Cancel","OK"} default button "OK"
if button returned of dlg is "Cancel" then
  return "__CANCEL__"
else
  return text returned of dlg
end if
EOF
)

# If user canceled → do nothing
if [ "$NOTES" = "__CANCEL__" ]; then
  echo "User cancelled — skipping workflow call."
  exit 0
fi

# 4. Construct payload using jq so everything is safely escaped
PAYLOAD=$(jq -n \
  --arg image_path "$FILE" \
  --arg notes "$NOTES" \
  '{inputData: {image_path: $image_path, notes: $notes}}'
)

API_URL="http://localhost:4111/api/workflows/autoArtifactAnalysisWorkflow/start-async"

echo "CALLING MASTRA API..."
echo "Payload:"
echo "$PAYLOAD"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "RAW RESPONSE:"
echo "$RESPONSE"

exit 0
