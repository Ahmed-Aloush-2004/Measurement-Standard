/**
 * Dev helper: list the question text of every section in a data module, so a
 * second batch can be authored without colliding with the first.
 *
 * questions.content is the natural key used by the generated SQL's NOT EXISTS
 * guard, so two batches that share a question string are not two questions --
 * the second one is silently skipped on insert.
 *
 * Usage: node scripts/.list-questions.js <data module>
 */
const fs = require("fs");
const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");
const lines = src.split(/\r?\n/);

let section = null;
const bySection = new Map();
for (const line of lines) {
  const sm = line.match(/^ {2}"(.+)": \[$/);
  if (sm) {
    section = sm[1];
    bySection.set(section, []);
    continue;
  }
  const qm = line.match(/^ {6}q: "(.*)",$/);
  if (qm && section) bySection.get(section).push(qm[1]);
}

for (const [name, list] of bySection) {
  console.log(`\n=== ${name} (${list.length}) ===`);
  for (const q of list) console.log("  " + q);
}
