/*
 * Dev helper: repair corrupted text, addressed by plain strings.
 *
 * Plain strings rather than codepoints: hand-transcribing Arabic to codepoints
 * is itself an error source (writing \u0644\u0644\u0627\u062c\u0645 for "الملازم"
 * silently yields a different, still-valid-looking word that no character-class
 * check will catch). This file is written by the editor, which round-trips
 * Arabic reliably, so the strings here are read as intended and verified by
 * reading the repaired lines back.
 *
 * Each edit is { file, line, find, text } with 1-based line numbers.
 * Idempotent: an edit whose find is already absent is reported as SKIP.
 *
 * Usage: node scripts/.repair.js scripts/.fixes.json
 */
const fs = require("fs");

const [, , editsFile] = process.argv;
const edits = JSON.parse(fs.readFileSync(editsFile, "utf8"));
const cache = new Map();

for (const e of edits) {
  if (!cache.has(e.file)) cache.set(e.file, fs.readFileSync(e.file, "utf8").split(/\r?\n/));
  const lines = cache.get(e.file);
  const before = lines[e.line - 1];
  if (before === undefined) throw new Error(`${e.file}:${e.line} is past end of file`);
  if (!before.includes(e.find)) {
    console.log(`SKIP ${e.file}:${e.line} (find absent)`);
    continue;
  }
  lines[e.line - 1] = before.replace(e.find, e.text);
  console.log(`FIX  ${e.file}:${e.line}: ${JSON.stringify(e.find)} -> ${JSON.stringify(e.text)}`);
}

for (const [file, lines] of cache) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log(`--- wrote ${file}`);
}
