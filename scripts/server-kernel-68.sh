#!/usr/bin/env bash
# Moves the VM from the 7.0 HWE kernel to Ubuntu 24.04's GA 6.8 line.
#
# Why: every published MongoDB release (8.0.32, 8.2, 9.0.1) refuses to start on
# Linux 6.19 or newer and exits with a fatal log line — SERVER-121912. This box
# shipped with 7.0.0-gcp from the rolling HWE branch. 6.8 is the kernel Ubuntu
# 24.04 LTS ships by default and supports with security updates until 2029, so
# this is a move onto the distribution's own baseline, not onto something
# abandoned.
#
# Safety: the new kernel is selected with `grub-reboot`, which is one-shot. If
# 6.8 fails to boot for any reason, the next reset comes back up on 7.0 with
# nothing to undo. Making it permanent is a separate, later step
# (server-kernel-68-commit.sh) run only after the box is confirmed healthy.
set -euo pipefail

KVER="6.8.0-1067-gcp"

echo "==> currently running: $(uname -r)"

echo "==> install ${KVER}"
if dpkg -l | grep -q "linux-image-${KVER}"; then
  echo "    already installed"
else
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    "linux-image-${KVER}" "linux-modules-${KVER}" "linux-modules-extra-${KVER}" >/dev/null
  echo "    installed"
fi

echo "==> teach grub to remember a choice"
# grub-reboot needs a saved default to write into; the stock config pins entry 0.
sudo sed -i 's/^GRUB_DEFAULT=.*/GRUB_DEFAULT=saved/' /etc/default/grub
grep -q '^GRUB_DEFAULT=saved' /etc/default/grub || echo 'GRUB_DEFAULT=saved' | sudo tee -a /etc/default/grub >/dev/null
sudo update-grub 2>/dev/null

echo "==> locate the menu entry"
# grub.cfg is root-only, so take one sudo-read copy rather than sudo-ing each
# pattern match.
sudo cat /boot/grub/grub.cfg > /tmp/grub.cfg.copy
SUB_ID="$(grep -oP "gnulinux-${KVER}-advanced-[0-9a-f-]+" /tmp/grub.cfg.copy | head -1)"
ROOT_MENU="$(grep -oP "gnulinux-advanced-[0-9a-f-]+" /tmp/grub.cfg.copy | head -1)"
rm -f /tmp/grub.cfg.copy
[ -n "$SUB_ID" ] || { echo "    ABORT: no grub entry for ${KVER}"; exit 1; }
ENTRY="${ROOT_MENU}>${SUB_ID}"
echo "    ${ENTRY}"

echo "==> arm a one-time boot into it"
sudo grub-reboot "$ENTRY"
echo "    armed — this applies to the next boot only"

echo "==> rebooting in 5s"
# Detached so this SSH session can exit cleanly instead of being killed mid-command.
sudo systemd-run --on-active=5 --timer-property=AccuracySec=1s systemctl reboot >/dev/null
echo "    scheduled"
