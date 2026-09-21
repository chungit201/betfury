#!/usr/bin/env bash
# Clones (or updates) the app, builds it, and runs it under pm2.
#
# Re-runnable: a second invocation fetches, rebuilds and reloads in place.
#
# Secrets come from /etc/inuslots/env (written by server-mongodb.sh, 0600
# root-only) rather than being listed here, so this script can live in a public
# repository. That file is the only thing standing between the repo and the
# database password, so it is read with sudo and handed straight to pm2 without
# ever being echoed.
set -euo pipefail

REPO="https://github.com/chungit201/betfury.git"
APP_DIR="/srv/inuslots"
ENV_FILE="/etc/inuslots/env"

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

echo "==> environment"
[ -r "$ENV_FILE" ] || sudo test -r "$ENV_FILE" || {
  echo "    ABORT: ${ENV_FILE} is missing. Run scripts/server-mongodb.sh first."
  exit 1
}
# Loaded into this shell only, and only for as long as it runs.
set -a
# shellcheck disable=SC1090
source <(sudo cat "$ENV_FILE" | grep -v '^#')
set +a
PORT="${PORT:-3000}"
for required in MONGODB_URI SESSION_SECRET ADMIN_TOKEN SITE_URL; do
  [ -n "${!required:-}" ] || { echo "    ABORT: ${required} is not in ${ENV_FILE}"; exit 1; }
done
echo "    loaded $(sudo grep -c '^[A-Z]' "$ENV_FILE") variables, site ${SITE_URL}, port ${PORT}"

echo "==> build"
# Next needs the dev dependencies to compile, so install them for the build and
# leave them in place — pruning them saves ~200MB but makes the next deploy
# reinstall everything.
npm install --silent
npm run build

echo "==> run under pm2"
pm2 delete inuslots >/dev/null 2>&1 || true
# --update-env is not enough here because the process is being recreated, but
# it is harmless and makes the intent obvious: pm2 should take this shell's
# environment, which is the one that just sourced the secrets.
pm2 start npm --name inuslots --update-env -- start
pm2 save >/dev/null

echo
pm2 list
echo
echo "==> local smoke test"
sleep 5
curl -s -o /dev/null -w "  GET  /                    -> %{http_code}\n" "http://127.0.0.1:$PORT/"
curl -s -o /dev/null -w "  GET  /about-inus          -> %{http_code}\n" "http://127.0.0.1:$PORT/about-inus"
# 401 is the pass here: it proves the route is live and the token check works.
curl -s -o /dev/null -w "  GET  /api/admin/users     -> %{http_code} (401 expected)\n" "http://127.0.0.1:$PORT/api/admin/users"
# And this proves the app can actually reach MongoDB, which nothing above does.
echo "  GET  /api/admin/users     -> $(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" "http://127.0.0.1:$PORT/api/admin/users?limit=1" | head -c 120)"
