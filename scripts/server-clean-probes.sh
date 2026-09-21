#!/usr/bin/env bash
# Removes the accounts scripts/check-auth-api.mjs creates.
#
# That check has to hit the real endpoints against the real database to be
# worth anything, so running it against production leaves accounts behind.
# Every address it uses starts with `probe-`; this deletes exactly those.
set -euo pipefail

URI="$(sudo grep -oP '(?<=^MONGODB_URI=).*' /etc/inuslots/env)"

mongosh --quiet "$URI" --eval '
  const probes = db.users.find({ email: /^probe-/ }, { email: 1, status: 1 }).toArray();
  if (!probes.length) {
    print("no probe accounts");
  } else {
    probes.forEach(p => print("  removing " + p.email + " (" + p.status + ")"));
    print("deleted " + db.users.deleteMany({ email: /^probe-/ }).deletedCount);
  }
  print("remaining: " + db.users.countDocuments({}) + " account(s)");
'
