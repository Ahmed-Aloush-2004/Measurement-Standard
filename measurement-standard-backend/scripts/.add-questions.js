/**
 * Dev helper: splice additional question objects into one section of an existing
 * data module, without hand-editing the middle of a 1000+ line file.
 *
 * The chunk files are raw question object literals -- the same shape the data
 * modules use -- one after another, e.g.
 *
 *     {
 *       q: "...",
 *       expl: "...",
 *       choices: [
 *         { t: "...", ok: false },
 *         { t: "...", ok: true },
 *         { t: "...", ok: false },
 *         { t: "...", ok: false },
 *       ],
 *     },
 *
 * They are inserted immediately before the target section's closing `  ],`, so
 * the section grows while keeping the file's existing indentation and ordering.
 * Re-running with a chunk whose questions are already present is a no-op, so the
 * whole expand-then-verify loop is safe to repeat.
 *
 * Usage: node scripts/.add-questions.js <dataModule> <sectionName> <chunk...>
 */
const fs = require("fs");

const [file, sectionName, ...chunks] = process.argv.slice(2);
if (!file || !sectionName || chunks.length === 0) {
  console.error("usage: node .add-questions.js <dataModule> <sectionName> <chunk...>");
  process.exit(2);
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

const startRe = new RegExp(`^  "${sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}": \\[\\s*$`);
const start = lines.findIndex((l) => startRe.test(l));
if (start === -1) {
  console.error(`section "${sectionName}" not found in ${file}`);
  process.exit(1);
}

// The section ends at the first `  ],` (or `  ]`) at the same indent as the key.
let end = -1;
for (let i = start + 1; i < lines.length; i++) {
  if (/^  \],?\s*$/.test(lines[i])) {
    end = i;
    break;
  }
}
if (end === -1) {
  console.error(`could not find the closing bracket for section "${sectionName}"`);
  process.exit(1);
}

const body = lines.slice(start + 1, end).join("\n");

const incoming = [];
for (const chunk of chunks) {
  const text = fs.readFileSync(chunk, "utf8").replace(/\s+$/, "");
  incoming.push(...text.split(/\r?\n/));
}

const stems = [];
for (let i = 0; i < incoming.length; i++) {
  const m = incoming[i].match(/^\s*q:\s*"(.*)",\s*$/);
  if (m) stems.push({ text: m[1], line: i });
}

const fresh = incoming.filter((line, i) => {
  const stem = stems.find((s) => s.line === i);
  if (!stem) return true;
  return !body.includes(stem.text);
});

if (fresh.length === incoming.length) {
  console.log(`no-op: all ${stems.length} questions already in "${sectionName}"`);
  process.exit(0);
}

const inserted = stems.filter((s) => !body.includes(s.text)).length;

lines.splice(end, 0, ...fresh);
fs.writeFileSync(file, lines.join("\n"), "utf8");

const newCount = end - (start + 1) + fresh.length;
console.log(
  `${file}: section "${sectionName}" +${inserted} -> ${newCount} questions (file now ${lines.length} lines)`
);
