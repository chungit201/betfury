#!/usr/bin/env bash
# Makes the 6.8 kernel the permanent default.
#
# server-kernel-68.sh selected it with `grub-reboot`, which is deliberately
# one-shot so a kernel that would not boot could not strand the VM. That safety
# net is also a trap: left alone, the very next reboot goes back to 7.0 and
# mongod stops starting again. Run this only once the box is confirmed healthy
# on 6.8.
#
# Two further pieces:
#
#  - The rolling `linux-*-gcp` metapackages are held. They track the newest HWE
#    line, so an unattended upgrade would quietly reinstall 7.x.
#
#  - The 6.8 metapackage is installed in their place where one exists, so the
#    kernel still receives security updates within its own line rather than
#    being frozen at today's build.
set -euo pipefail

KVER="6.8.0-1067-gcp"

echo "==> running kernel"
uname -r
if [ "$(uname -r)" != "$KVER" ]; then
  echo "    ABORT: expected ${KVER}. Do not make this permanent from the wrong kernel."
  exit 1
fi

echo "==> set it as the saved grub default"
sudo cat /boot/grub/grub.cfg > /tmp/grub.cfg.copy
SUB_ID="$(grep -oP "gnulinux-${KVER}-advanced-[0-9a-f-]+" /tmp/grub.cfg.copy | head -1)"
ROOT_MENU="$(grep -oP "gnulinux-advanced-[0-9a-f-]+" /tmp/grub.cfg.copy | head -1)"
rm -f /tmp/grub.cfg.copy
[ -n "$SUB_ID" ] || { echo "    ABORT: no grub entry for ${KVER}"; exit 1; }
sudo grub-set-default "${ROOT_MENU}>${SUB_ID}"
echo "    ${ROOT_MENU}>${SUB_ID}"

echo "==> keep the 6.8 line updated"
if apt-cache show linux-image-gcp-6.8 >/dev/null 2>&1; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq linux-image-gcp-6.8 linux-headers-gcp-6.8 >/dev/null
  echo "    installed linux-image-gcp-6.8 metapackage"
else
  echo "    no 6.8 metapackage published; the kernel stays pinned at ${KVER}"
fi

echo "==> hold the rolling HWE metapackages"
sudo apt-mark hold linux-gcp linux-image-gcp linux-headers-gcp 2>/dev/null | sed 's/^/    /'

echo "==> verify"
echo "    saved default: $(sudo grub-editenv list | grep saved_entry || echo '(none)')"
echo "    held:          $(apt-mark showhold | tr '\n' ' ')"
echo "    mongod:        $(systemctl is-active mongod) / $(systemctl is-enabled mongod)"
echo "    mongod version: $(mongod --version | head -1)"
