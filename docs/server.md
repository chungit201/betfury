# Server runbook

Everything needed to get back into the box and change something.

## SSH

```bash
gcloud compute ssh inuslots-web --zone=asia-southeast1-a --project=auro-finance
```

On this Windows machine `gcloud` is **not on PATH**. Use the full path:

```powershell
& "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" compute ssh inuslots-web --zone=asia-southeast1-a --project=auro-finance
```

Running it from Git Bash fails with `Python was not found` — the shim resolves
to the Microsoft Store alias. Use PowerShell.

### Running more than one command

`--command="a && b"` gets mangled by the Windows shell as soon as it contains
quotes, `$`, or newlines. Copy a script up and run that instead:

```powershell
& "...\gcloud.cmd" compute scp .\scripts\thing.sh inuslots-web:/tmp/thing.sh --zone=asia-southeast1-a --project=auro-finance
& "...\gcloud.cmd" compute ssh inuslots-web --zone=asia-southeast1-a --project=auro-finance --command="sed -i 's/\r$//' /tmp/thing.sh; bash /tmp/thing.sh"
```

The `sed` strips CRLF line endings, which bash rejects with
`$'\r': command not found`. `/tmp` is cleared on reboot, so re-copy after one.

### Adding someone's SSH key

OS Login is **enabled** on this instance, so `~/.ssh/authorized_keys` and the
instance's `ssh-keys` metadata are both ignored — anything written there is
wiped by the guest agent. Keys go on the Google account's OS Login profile:

```powershell
& "...\gcloud.cmd" compute os-login ssh-keys add --key-file=key.pub --project=auro-finance
& "...\gcloud.cmd" compute os-login describe-profile --project=auro-finance   # verify
```

`--key="ssh-ed25519 AAAA... comment"` inline does not work; use `--key-file`.
Everyone who adds a key logs in as the same POSIX user, `admin_auro_finance`.

## What is on the box

| | |
|---|---|
| Project / VM | `auro-finance` / `inuslots-web`, `asia-southeast1-a`, e2-small |
| Static IP | 136.110.47.118 |
| Domain | inuslots.xyz, proxied by Cloudflare, SSL mode **Full** |
| OS | Ubuntu 24.04.5 |
| Kernel | **pinned to 6.8.0-1067-gcp** — see below |
| Runtime | Node 24.21, pm2 7.0.4, nginx 1.24, MongoDB 9.0.1 |
| App | `/srv/inuslots`, tracking `origin/main`, pm2 process `inuslots` on :3000 |
| Secrets | `/etc/inuslots/env` (0600, root) — not in git |
| Database | `mongodb://127.0.0.1:27017/inuslots`, loopback only, auth required |

## Deploy

```powershell
& "...\gcloud.cmd" compute ssh inuslots-web --zone=asia-southeast1-a --project=auro-finance --command="bash /srv/inuslots/scripts/server-deploy.sh"
```

Fetches, resets to `origin/main`, installs, builds, restarts pm2, smoke tests.
Safe to re-run. If the script itself changed in the commit you are deploying,
`git -C /srv/inuslots fetch --quiet origin && git -C /srv/inuslots reset --hard origin/main` first.

## Approving accounts

Registration puts an account in `pending`. It cannot log in until you approve
it — attempting to gets a 403 and the dialog says the account is under review.

SSH in, then:

```bash
cd /srv/inuslots
sudo -E node scripts/admin-users.mjs                      # who is waiting
sudo -E node scripts/admin-users.mjs approve a@b.com
sudo -E node scripts/admin-users.mjs reject  a@b.com
sudo -E node scripts/admin-users.mjs list approved
sudo -E node scripts/admin-users.mjs approve-all          # asks first
```

`sudo` is needed to read `ADMIN_TOKEN` out of `/etc/inuslots/env`; `-E` keeps
your environment so the script still finds node.

Rejecting is not just a label — it kills any live session on that account's
very next request, because `/api/auth/me` re-reads `status` from the database
instead of trusting the cookie.

Poking at the database directly, if you ever need to:

```bash
mongosh "$(sudo grep -oP '(?<=^MONGODB_URI=).*' /etc/inuslots/env)"
> db.users.countDocuments({ status: "pending" })
> db.users.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).limit(10)
```

### Accounts collection

| field | |
|---|---|
| `email` | lowercased, uniquely indexed |
| `passwordHash` | scrypt N=2^15, parameters stored with the hash |
| `dialCode`, `phone`, `promoCode` | optional, from the Sign Up form |
| `status` | `pending` → `approved` \| `rejected` |
| `createdAt`, `reviewedAt`, `lastLoginAt` | |

## Things that will bite you

**The kernel is pinned, on purpose.** Every published MongoDB release (8.0.32,
8.2, 9.0.1) refuses to start on Linux 6.19+ and exits with a fatal log line —
[SERVER-121912](https://jira.mongodb.org/browse/SERVER-121912). The VM shipped
with 7.0.0-gcp from the rolling HWE branch, so it was moved to 6.8, which is
Ubuntu 24.04's own GA kernel and is supported until 2029. `linux-gcp`,
`linux-image-gcp` and `linux-headers-gcp` are held so an unattended upgrade
cannot quietly put 7.x back; `linux-image-gcp-6.8` keeps the 6.8 line patched.
If mongod ever stops starting, check `uname -r` first.

**Cloudflare intercepts `/.well-known/acme-challenge/`**, so certbot's HTTP-01
challenge can never complete while the domain is proxied. The origin uses a
self-signed certificate and Cloudflare is set to **Full**, not Full (strict).
Moving to strict needs a Cloudflare Origin Certificate or a DNS-01 challenge.

**pm2 needs both `save` and `startup`.** `pm2 save` only writes the process
list; `pm2 startup` installs the systemd unit that replays it. Both are done
(`scripts/server-boot-persist.sh`) and survived the kernel reboot.

**`/api/admin/` is denied by nginx.** The endpoint checks its bearer token
anyway, but its only client is `admin-users.mjs` talking to `127.0.0.1:3000`,
which does not go through nginx. If the CLI ever starts returning 403 instead
of 401, something is pointing it at the public hostname.

**Secrets live only in `/etc/inuslots/env`.** They are not in git and not in
the pm2 dump; `server-deploy.sh` sources the file and hands the values to pm2.
If the app starts answering 500 on every account route after a manual
`pm2 restart`, it is because a bare restart does not re-read that file — deploy
properly, or `pm2 restart inuslots --update-env` from a shell that sourced it.

## Scripts

All are re-runnable and live in `scripts/`.

| Script | What it does |
|---|---|
| `server-provision.sh` | Node, pm2, nginx on a fresh box |
| `server-deploy.sh` | Fetch, build, restart, smoke test |
| `server-nginx.sh` | nginx vhost |
| `server-origin-tls.sh` | Self-signed origin cert so Cloudflare Full works |
| `server-certbot.sh` | Let's Encrypt — aborts cleanly, see above |
| `server-boot-persist.sh` | pm2 systemd unit |
| `server-mongodb.sh` | MongoDB 9.0, swap, secrets, app DB user |
| `server-kernel-68.sh` | Install 6.8 and arm a one-shot boot into it |
| `server-kernel-68-commit.sh` | Make 6.8 permanent once confirmed healthy |
| `server-clean-probes.sh` | Delete the `probe-` accounts the checks create |
| `admin-users.mjs` | Review queue: list, approve, reject |

## Checks

Run from anywhere against a URL; the last two create `probe-` accounts.

```bash
node scripts/check-auth-api.mjs   https://inuslots.xyz   # 26 HTTP assertions
node scripts/check-auth-modal.mjs https://inuslots.xyz   # 26 browser assertions
node scripts/check-settings-menu.mjs https://inuslots.xyz
node scripts/check-modals.mjs     https://inuslots.xyz
node scripts/check-sliders.mjs    https://inuslots.xyz
```

`check-auth-api.mjs` needs `ADMIN_TOKEN` to cover approval onwards; without it
those assertions are skipped rather than failed. Easiest is to run it on the VM:

```bash
ADMIN_TOKEN="$(sudo grep -oP '(?<=^ADMIN_TOKEN=).*' /etc/inuslots/env)" \
  node scripts/check-auth-api.mjs http://127.0.0.1:3000
```
