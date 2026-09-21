// Sanity-checks the live-bets table data: a row's payout must equal its stake
// times its multiplier. Worth asserting because the amounts were converted from
// VND to USD in bulk, and a bad conversion would show up as rows whose numbers
// quietly stop adding up.
import fs from "node:fs";

const src = fs.readFileSync("src/data/bets-data.ts", "utf8");
const rows = src.match(/\{[^{}]*?\}/g) ?? [];

let checked = 0;
const bad = [];

for (const row of rows) {
  const amount = row.match(/"amount": "\$([\d,.]+)"/);
  const payout = row.match(/"payout": "\$([\d,.]+)"/);
  const multiplier = row.match(/"multiplier": "x([\d.]+)"/);
  if (!amount || !payout || !multiplier) continue;

  // A lost bet still displays the multiplier it would have paid, with a payout
  // of zero — that is in the captured data, not a conversion error.
  if (!/"win": true/.test(row)) continue;

  checked++;
  const num = (s) => Number(s.replace(/,/g, ""));
  const expected = num(amount[1]) * Number(multiplier[1]);
  const actual = num(payout[1]);
  // A cent of rounding drift is expected; anything larger is a real mismatch.
  if (Math.abs(expected - actual) > 0.02) {
    bad.push(`$${amount[1]} x${multiplier[1]} = ${expected.toFixed(2)}, but payout is $${payout[1]}`);
  }
}

console.log(`payout = amount x multiplier holds for ${checked - bad.length}/${checked} rows`);
for (const b of bad) console.log(`  ${b}`);
process.exitCode = bad.length ? 1 : 0;
