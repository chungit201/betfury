#!/usr/bin/env bash
# Obtains a publicly trusted Let's Encrypt certificate for the origin.
#
# An earlier version of this step refused to run because the domain resolves to
# Cloudflare rather than to this VM. That check was wrong: the HTTP-01 challenge
# only needs port 80 traffic for the domain to REACH this machine, and
# Cloudflare proxies it through. What it cannot survive is Cloudflare's
# "Always Use HTTPS" redirecting the challenge away — so that is what gets
# verified first.
#
# Why a real certificate rather than the self-signed one: Cloudflare is in
# "Full (strict)", which validates the chain and answers 526 for anything it
# cannot verify.
set -euo pipefail

DOMAIN="inuslots.xyz"

echo "==> can the ACME challenge path reach this origin over plain HTTP?"
sudo mkdir -p /var/www/html/.well-known/acme-challenge
echo "reachable" | sudo tee /var/www/html/.well-known/acme-challenge/probe >/dev/null

# Serve the challenge directory from the port 80 vhost.
sudo sed -i "/server_name ${DOMAIN};/a\\
\\
    location /.well-known/acme-challenge/ {\\
        root /var/www/html;\\
    }" /etc/nginx/sites-available/inuslots
sudo nginx -t >/dev/null
sudo systemctl reload nginx

PROBE="$(curl -s --max-time 20 "http://${DOMAIN}/.well-known/acme-challenge/probe" || true)"
echo "    probe returned: ${PROBE:-<empty>}"
if [ "$PROBE" != "reachable" ]; then
  echo "    ABORT: the challenge path does not reach this origin."
  echo "    Most likely Cloudflare's 'Always Use HTTPS' is redirecting it."
  exit 1
fi

echo "==> certbot"
sudo apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
sudo certbot --nginx -d "$DOMAIN" \
  --non-interactive --agree-tos --register-unsafely-without-email \
  --keep-until-expiring

echo "==> result"
sudo certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry' | sed 's/^/    /'
sudo nginx -t
sudo systemctl reload nginx
curl -sk -o /dev/null -w "    https origin -> %{http_code}\n" -H "Host: ${DOMAIN}" https://127.0.0.1/
