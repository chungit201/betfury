#!/usr/bin/env bash
# Puts nginx in front of the Next.js process and obtains a Let's Encrypt
# certificate.
#
# certbot uses the HTTP-01 challenge, which needs the domain to reach THIS
# machine directly on port 80. If the DNS record is proxied (Cloudflare's
# orange cloud), the challenge lands on the proxy instead and issuance fails —
# the script reports that rather than leaving a half-configured vhost.
set -euo pipefail

DOMAIN="inuslots.xyz"
PORT=3000
EXPECTED_IP="136.110.47.118"

echo "==> nginx vhost"
sudo tee /etc/nginx/sites-available/inuslots >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Next already fingerprints its own assets, so let it set cache headers.
    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/inuslots /etc/nginx/sites-enabled/inuslots
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "    vhost active"

echo "==> does ${DOMAIN} reach this machine directly?"
RESOLVED="$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1 || true)"
echo "    resolves to: ${RESOLVED:-nothing}"
echo "    this VM is:  ${EXPECTED_IP}"

if [ "$RESOLVED" != "$EXPECTED_IP" ]; then
  echo
  echo "    SKIPPING certbot: the domain does not point straight at this VM."
  echo "    Serving plain HTTP for now."
  exit 0
fi

echo "==> certbot"
sudo apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo "    certificate installed"
