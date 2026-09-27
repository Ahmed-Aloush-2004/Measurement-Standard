/*
 * Check that an "extra" data module adds no question that already exists.
 *
 * The generated SQL guards inserts with NOT EXISTS on `questions.content`, so a
 * repeated question string is not an error -- it is silently dropped, and the
 * section ends up short without any message. This makes that case loud.
 *
 * Usage: node scripts/.check-dupes.js <new module> <existing module> [...]
 */
const fs = require("fs");

const [, , newModule, ...existing] = process.argv;
if (!existing.length) {
  console.error("usage: node scripts/.check-dupes.js <new module> <existing module> [...]");
  process.exit(2);
}

const questionsOf = (file) => {
  const src = fs.readFileSync(file, "utf8");
  return [...src.matchAll(/^ {6}q: "(.*)",$/gm)].map((m) => m[1]);
};

const seen = new Map();
for (const file of existing) {
  for (const q of questionsOf(file)) seen.set(q, file);
}

const clashes = [];
for (const q of questionsOf(newModule)) {
  if (seen.has(q)) clashes.push(`${q}   (already in ${seen.get(q)})`);
}

if (clashes.length) {
  console.log(`FAIL  ${newModule}: ${clashes.length} question(s) already exist`);
  for (const c of clashes) console.log(`      - ${c}`);
  process.exit(1);
}
console.log(`PASS  ${newModule}: no overlap with ${existing.length} existing module(s)`);
