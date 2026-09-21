#!/usr/bin/env bash
# Clones (or updates) the app, builds it, and runs it under pm2.
#
# Re-runnable: a second invocation fetches, rebuilds and reloads in place.
set -euo pipefail

REPO="https://github.com/chungit201/betfury.git"
APP_DIR="/srv/inuslots"
STORE="/var/lib/inuslots/whitelist.json"
SITE_URL="https://inuslots.xyz"
PORT=3000

echo "==> fetch source"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --quiet origin
  git -C "$APP_DIR" reset --hard origin/main --quiet
else
  git clone --quiet --depth 1 "$REPO" "$APP_DIR"
fi
echo "    $(git -C "$APP_DIR" log --oneline -1)"

cd "$APP_DIR"

echo "==> install"
npm ci --omit=dev --silent 2>/dev/null || npm install --silent

echo "==> build"
# Next needs the dev dependencies to compile, so install them for the build and
# leave them in place — pruning them saves ~200MB but makes the next deploy
# reinstall everything.
npm install --silent
SITE_URL="$SITE_URL" npm run build

echo "==> run under pm2"
pm2 delete inuslots >/dev/null 2>&1 || true
SITE_URL="$SITE_URL" WHITELIST_STORE="$STORE" PORT="$PORT" \
  pm2 start npm --name inuslots -- start
pm2 save >/dev/null

echo
pm2 list
echo
echo "==> local smoke test"
sleep 4
curl -s -o /dev/null -w "  GET /            -> %{http_code}\n" "http://127.0.0.1:$PORT/"
curl -s -o /dev/null -w "  GET /about-inus  -> %{http_code}\n" "http://127.0.0.1:$PORT/about-inus"
