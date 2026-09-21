# Forwards localhost:27017 to MongoDB on the production VM.
#
# The database binds to 127.0.0.1 on the VM and nothing outside can reach it,
# which is the point. So `npm run dev` on this machine cannot use MONGODB_URI
# from .env until this tunnel is up — the URI says 127.0.0.1 and this is what
# makes that true.
#
#   npm run tunnel      # leave it running in its own terminal
#
# It is the PRODUCTION database on the other end. Anything you register while
# this is open is a real row in the live users collection. Use probe- addresses
# and clear them afterwards with scripts/server-clean-probes.sh on the VM.

$ErrorActionPreference = "Stop"
$gcloud = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

if (-not (Test-Path $gcloud)) {
  Write-Error "gcloud not found at $gcloud"
}

$busy = Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($busy) {
  Write-Warning "Something is already listening on 127.0.0.1:27017 — a tunnel may already be open, or a local mongod is running."
}

Write-Host "Tunnelling 127.0.0.1:27017 -> inuslots-web:27017. Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "PRODUCTION database. Register with probe- addresses only." -ForegroundColor Yellow

# -N: no remote command, just the forward. Without it plink opens a shell that
# exits immediately and takes the forward with it.
& $gcloud compute ssh inuslots-web `
  --zone=asia-southeast1-a `
  --project=auro-finance `
  --ssh-flag="-L" --ssh-flag="27017:127.0.0.1:27017" `
  --ssh-flag="-N"
