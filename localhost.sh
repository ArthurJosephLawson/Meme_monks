#!/usr/bin/env bash
# localhost.sh — start the Meme Monks local development server.
set -euo pipefail

cd "$(dirname "$0")"

echo "=== MEME MONKS // LOCAL DEV SERVER ==="
echo "Starting Next.js dev server..."
echo "URL: http://localhost:3000 (Ctrl+C to stop)"
echo

npm run dev
