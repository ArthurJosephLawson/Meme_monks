#!/usr/bin/env bash
# dev_console.sh — Meme Monks developer console (no npm / Node required).
# Publishes a meme to the running site via its /api/memes endpoint.
# Requires: curl, base64, python3 (for safe JSON encoding).

set -euo pipefail

API_URL="${MEME_MONKS_API_URL:-http://localhost:3000}"
DEV_KEY="5cr1pt@m0nks"

echo "=== MEME MONKS // DEV CONSOLE ==="

read -r -s -p "Dev passkey: " PASSKEY
echo
if [[ "$PASSKEY" != "$DEV_KEY" ]]; then
  echo "ACCESS DENIED — publish aborted."
  exit 1
fi
echo "PASSKEY ACCEPTED — gathering meme details."

read -r -p "Uploader username (creator handle): " USERNAME
read -r -p "Actual meme (image file path, or leave empty for title-only): " MEME_PATH
read -r -p "Caption for the meme: " CAPTION
read -r -p "Enable comments on this meme? (y/N): " COMMENTS_ANS
if [[ "$COMMENTS_ANS" =~ ^[Yy] ]]; then COMMENTS_ENABLED="true"; else COMMENTS_ENABLED="false"; fi

IMAGE=""
if [[ -n "$MEME_PATH" ]]; then
  if [[ ! -f "$MEME_PATH" ]]; then
    echo "Meme file not found: $MEME_PATH"
    exit 1
  fi
  EXT="${MEME_PATH##*.}"
  EXT_LOWER="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"
  case "$EXT_LOWER" in
    jpg|jpeg) MIME="image/jpeg" ;;
    png) MIME="image/png" ;;
    gif) MIME="image/gif" ;;
    webp) MIME="image/webp" ;;
    *) echo "Unsupported image extension: .$EXT_LOWER"; exit 1 ;;
  esac
  B64="$(base64 -w 0 "$MEME_PATH")"
  IMAGE="data:${MIME};base64,${B64}"
fi

TITLE="$CAPTION"
if [[ -z "$TITLE" ]]; then TITLE="$MEME_PATH"; fi
if [[ -z "$TITLE" ]]; then
  echo "Meme title/caption cannot be empty — publish aborted."
  exit 1
fi

echo "Publishing meme for @$USERNAME — \"$TITLE\"..."

PAYLOAD="$(python3 - "$USERNAME" "$TITLE" "$IMAGE" "$COMMENTS_ENABLED" <<'PY'
import json, sys
username, title, image, comments = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
print(json.dumps({
    "creator": username,
    "title": title,
    "image": image,
    "commentsEnabled": comments == "true",
}))
PY
)"

RESPONSE="$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/memes" \
  -H "Content-Type: application/json" \
  -H "x-dev-key: $DEV_KEY" \
  -d "$PAYLOAD")"

HTTP_CODE="$(echo "$RESPONSE" | tail -n 1)"
BODY="$(echo "$RESPONSE" | sed '$d')"

if [[ "$HTTP_CODE" != "201" ]]; then
  echo "Publish failed (HTTP $HTTP_CODE): $BODY"
  exit 1
fi

echo "Published. Response: $BODY"
echo "Done."