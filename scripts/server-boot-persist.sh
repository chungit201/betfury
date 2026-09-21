#!/usr/bin/env bash
# Makes the app come back on its own after a reboot.
#
# `pm2 save` only writes the process list to disk. Without `pm2 startup` there
# is no systemd unit to replay it, so a VM restart — GCP maintenance, a crash,
# a manual reboot — would leave the site down until someone noticed.
set -euo pipefail

sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null
pm2 save >/dev/null

echo "unit:    pm2-$USER"
echo "enabled: $(systemctl is-enabled "pm2-$USER" 2>&1 | head -1)"
echo "active:  $(systemctl is-active "pm2-$USER" 2>&1 | head -1)"
echo "mongod:  $(systemctl is-enabled mongod 2>&1 | head -1)"
