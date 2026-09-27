/**
 * Dev helper: print the section names and every question stem of a data module,
 * so new questions can be written without duplicating existing ones.
 *
 * Usage: node scripts/.list.js scripts/data/general_aptitude.js
 */
const fs = require("fs");
const file = process.argv[2];
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

let section = null;
const counts = new Map();
for (const l of lines) {
  const sm = l.match(/^  "([^"]+)": \[/);
  if (sm) {
    section = sm[1];
    counts.set(section, 0);
    console.log(`\n=== ${section} ===`);
    continue;
  }
  const qm = l.match(/^      q: "(.*)",$/);
  if (qm && section) {
    counts.set(section, counts.get(section) + 1);
    console.log(`${String(counts.get(section)).padStart(2)}. ${qm[1]}`);
  }
}

console.log(`\ntotal: ${[...counts.values()].reduce((a, b) => a + b, 0)} questions`);
for (const [k, v] of counts) console.log(`  ${k}: ${v}`);
