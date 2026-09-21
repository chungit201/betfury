#!/usr/bin/env bash
# Prepares a fresh Ubuntu 24.04 VM to serve the Next.js app.
#
# Run once. Safe to re-run: every step is idempotent.
set -euo pipefail

APP_USER="${SUDO_USER:-$USER}"
APP_DIR="/srv/inuslots"
STORE_DIR="/var/lib/inuslots"

echo "==> system packages"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq curl git nginx ca-certificates gnupg >/dev/null

echo "==> node 24"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1)" != "v24" ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - >/dev/null
  sudo apt-get install -y -qq nodejs >/dev/null
fi

echo "==> pm2"
command -v pm2 >/dev/null 2>&1 || sudo npm install -g pm2 --silent >/dev/null

echo "==> app + data directories"
sudo mkdir -p "$APP_DIR" "$STORE_DIR"
sudo chown -R "$APP_USER":"$APP_USER" "$APP_DIR" "$STORE_DIR"

echo
echo "node   $(node -v)"
echo "npm    $(npm -v)"
echo "pm2    $(pm2 -v | tail -1)"
echo "nginx  $(nginx -v 2>&1)"
echo "git    $(git --version)"
echo "app    $APP_DIR (owner $APP_USER)"
echo "store  $STORE_DIR"
