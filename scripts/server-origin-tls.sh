#!/usr/bin/env bash
# Opens port 443 on the origin with a self-signed certificate.
#
# Why this is the right interim step: the domain sits behind Cloudflare with
# SSL mode "Full", which means Cloudflare connects to the origin over HTTPS.
# nginx only listened on 80, so that connection was refused and every HTTPS
# request came back as a Cloudflare 521.
#
# "Full" validates that TLS is present but not that the certificate chains to a
# public CA, so a self-signed certificate satisfies it and encrypts the
# Cloudflare-to-origin hop. "Full (strict)" does check the chain — for that,
# replace the files below with a Cloudflare Origin Certificate.
#
# This is not a publicly trusted certificate. Visitors never see it; they only
# ever talk to Cloudflare.
set -euo pipefail

DOMAIN="inuslots.xyz"
PORT=3000
CERT_DIR="/etc/ssl/inuslots"

echo "==> self-signed origin certificate"
sudo mkdir -p "$CERT_DIR"
if [ ! -f "$CERT_DIR/origin.crt" ]; then
  sudo openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
    -keyout "$CERT_DIR/origin.key" -out "$CERT_DIR/origin.crt" \
    -subj "/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN}" 2>/dev/null
  sudo chmod 600 "$CERT_DIR/origin.key"
  echo "    created, valid 10 years"
else
  echo "    already present, reusing"
fi

echo "==> nginx vhost with 443"
sudo tee /etc/nginx/sites-available/inuslots >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Cloudflare terminates TLS for visitors. When it forwards over plain HTTP
    # this block still serves them rather than bouncing into a redirect loop.
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

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     ${CERT_DIR}/origin.crt;
    ssl_certificate_key ${CERT_DIR}/origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/inuslots /etc/nginx/sites-enabled/inuslots
sudo nginx -t
sudo systemctl reload nginx

echo "==> listening"
sudo ss -lntp | grep -E ':80 |:443 ' | awk '{print "    "$4}'

echo "==> local checks"
curl -s -o /dev/null -w "    http  origin -> %{http_code}\n" -H "Host: ${DOMAIN}" http://127.0.0.1/
curl -sk -o /dev/null -w "    https origin -> %{http_code}\n" -H "Host: ${DOMAIN}" https://127.0.0.1/
