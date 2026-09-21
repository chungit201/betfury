#!/usr/bin/env bash
# Installs MongoDB for the accounts database and writes the app's secrets.
#
# Release line is 9.0, not the 8.0 you get by following the usual install page.
# This VM runs kernel 7.0.0-gcp, and MongoDB 8.0.x refuses to start on anything
# from 6.19 up (SERVER-121912) — it exits immediately with a fatal log line. The
# alternative was downgrading the box to a 6.8 kernel, which trades a supported
# kernel for a supported database and is the wrong way round.
#
# Two things this box needs that a default install does not give you:
#
#  - Swap. The VM has 1960MB and shipped with none. WiredTiger's default cache
#    plus Next.js leaves very little headroom, and with no swap the kernel's
#    answer to a spike is to kill one of them.
#
#  - A capped cache. wiredTigerCacheSizeGB is pinned to 0.25 rather than left to
#    the default, which would claim far more of a box that is mostly running a
#    web server.
#
# Mongo listens on 127.0.0.1 only and requires authentication. Nothing about it
# is reachable from outside the VM, which is why there is no TLS on it.
#
# Re-runnable: existing swap, a working install and existing secrets are all
# left alone. It also repairs a half-finished run — if the credentials in
# /etc/inuslots/env do not authenticate, the user is (re)created.
set -euo pipefail

MONGO_LINE="9.0"
# packaging@mongodb.com, the key that signs the noble/mongodb-org/9.0 InRelease.
KEY_FPR="B3B42B6C39E5CDDEC0A27E3CF366D55B602E502D"
KEYRING="/usr/share/keyrings/mongodb-server-${MONGO_LINE}.gpg"
DB_NAME="inuslots"
DB_USER="inuslots_app"
ENV_DIR="/etc/inuslots"
ENV_FILE="${ENV_DIR}/env"

echo "==> swap"
if swapon --show | grep -q .; then
  echo "    already present, leaving it"
else
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  echo "    2G swapfile created and added to fstab"
fi

echo "==> mongodb ${MONGO_LINE}"
INSTALLED="$(mongod --version 2>/dev/null | head -1 || true)"
if echo "$INSTALLED" | grep -q "v${MONGO_LINE}"; then
  echo "    already installed: ${INSTALLED}"
else
  if [ -n "$INSTALLED" ]; then
    echo "    replacing ${INSTALLED}"
    sudo systemctl stop mongod >/dev/null 2>&1 || true
    sudo apt-get remove -y -qq mongodb-org mongodb-org-server mongodb-org-mongos \
      mongodb-org-tools mongodb-org-database-tools-extra mongodb-mongosh >/dev/null 2>&1 || true
    sudo rm -f /etc/apt/sources.list.d/mongodb-org-*.list
  fi
  # dirmngr is what gpg shells out to for keyserver traffic, and it is not part
  # of a minimal image. root also has no ~/.gnupg until something creates it.
  sudo apt-get install -y -qq gnupg dirmngr curl >/dev/null
  sudo install -d -m 700 /root/.gnupg
  # MongoDB only publishes server-8.0.asc at the documented URL; the 8.2 and 9.0
  # repos are signed by a key that is not served there at all. Pulling it from a
  # keyserver by full fingerprint is both the only route and a stricter check
  # than trusting whatever a URL happens to return.
  sudo rm -f "$KEYRING"
  sudo gpg --no-default-keyring --keyring "$KEYRING" \
    --keyserver hkps://keyserver.ubuntu.com --recv-keys "$KEY_FPR"
  sudo gpg --no-default-keyring --keyring "$KEYRING" --fingerprint "$KEY_FPR" >/dev/null
  echo "deb [ arch=amd64,arm64 signed-by=${KEYRING} ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/${MONGO_LINE} multiverse" \
    | sudo tee "/etc/apt/sources.list.d/mongodb-org-${MONGO_LINE}.list" >/dev/null
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq mongodb-org >/dev/null
  echo "    installed: $(mongod --version | head -1)"
fi

echo "==> secrets"
sudo mkdir -p "$ENV_DIR"
if sudo test -f "$ENV_FILE"; then
  echo "    ${ENV_FILE} exists, reusing the secrets already in it"
else
  # Generated on the box, never sent anywhere.
  sudo tee "$ENV_FILE" >/dev/null <<ENV
# Written by scripts/server-mongodb.sh. Not in git, never leaves this machine.
MONGODB_URI=mongodb://${DB_USER}:$(openssl rand -hex 24)@127.0.0.1:27017/${DB_NAME}?authSource=${DB_NAME}
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_TOKEN=$(openssl rand -hex 32)
SITE_URL=https://inuslots.xyz
PORT=3000
ENV
  sudo chmod 600 "$ENV_FILE"
  echo "    ${ENV_FILE} written (0600)"
fi
URI="$(sudo grep -oP '(?<=^MONGODB_URI=).*' "$ENV_FILE")"
DB_PASS="$(sudo grep -oP "(?<=mongodb://${DB_USER}:)[^@]+" "$ENV_FILE")"

write_conf() {
  sudo tee /etc/mongod.conf >/dev/null <<CONF
storage:
  dbPath: /var/lib/mongodb
  wiredTiger:
    engineConfig:
      # Pinned rather than left to the default: this box is a web server that
      # happens to have a database on it, not the other way round.
      cacheSizeGB: 0.25

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  # Loopback only. Nothing outside this VM can reach the database at all.
  bindIp: 127.0.0.1

security:
  authorization: ${1}
CONF
}

wait_for_mongo() {
  for _ in $(seq 1 45); do
    mongosh --quiet "$1" --eval 'db.runCommand({ping:1})' >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}

echo "==> does the application user already work?"
write_conf enabled
sudo systemctl enable mongod >/dev/null 2>&1 || true
sudo systemctl restart mongod
if wait_for_mongo "$URI"; then
  echo "    yes"
else
  echo "    no — bootstrapping it"
  # The user has to exist before authorization can be enforced, so the bootstrap
  # runs with auth off and the daemon is restarted into the real config after.
  write_conf disabled
  sudo systemctl restart mongod
  wait_for_mongo "mongodb://127.0.0.1:27017/${DB_NAME}" || {
    echo "    ABORT: mongod will not start even without auth."
    sudo journalctl -u mongod -n 20 --no-pager
    exit 1
  }
  mongosh --quiet "mongodb://127.0.0.1:27017/${DB_NAME}" --eval "
    if (db.getUser('${DB_USER}')) { db.dropUser('${DB_USER}'); }
    db.createUser({
      user: '${DB_USER}',
      pwd: '${DB_PASS}',
      roles: [{ role: 'readWrite', db: '${DB_NAME}' }]
    });
  " >/dev/null
  echo "    created ${DB_USER} with readWrite on ${DB_NAME}"
  write_conf enabled
  sudo systemctl restart mongod
  wait_for_mongo "$URI" || { echo "    ABORT: credentials still do not work."; exit 1; }
fi

echo "==> verify"
echo "    version:   $(mongod --version | head -1)"
echo "    service:   $(systemctl is-active mongod) / $(systemctl is-enabled mongod)"
echo "    listening: $(sudo ss -lntp | grep 27017 | awk '{print $4}' | tr '\n' ' ')"

# Proves auth is actually enforced, not just configured. The `|| true` is load
# bearing: a refused read makes mongosh exit non-zero, and under `set -e` with
# `pipefail` that aborts the script at the exact moment the check succeeds.
ANON="$(mongosh --quiet "mongodb://127.0.0.1:27017/${DB_NAME}" --eval 'db.users.countDocuments({})' 2>&1 | tail -1 || true)"
case "$ANON" in
  *nauthorized*|*equires\ authentication*) echo "    anonymous read: correctly refused" ;;
  *) echo "    anonymous read: NOT REFUSED -> ${ANON}"; exit 1 ;;
esac

echo "    app creds: $(mongosh --quiet "$URI" --eval 'db.runCommand({ping:1}).ok === 1 ? "ok" : "failed"')"
echo "    memory:    $(free -m | awk '/^Mem:/ {print $7"MB available"}'), swap $(free -m | awk '/^Swap:/ {print $2"MB"}')"
