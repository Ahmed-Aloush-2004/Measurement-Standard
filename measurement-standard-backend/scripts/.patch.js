/**
 * Dev helper: patch specific lines of a file, addressed by line number.
 *
 * Content-based `edit` fails when a line contains a CJK or mixed-direction
 * character that cannot be retyped byte-for-byte. Indexing by line number avoids
 * matching altogether: the patch supplies only the replacement, never the old
 * text, so nothing has to reproduce the corrupted bytes.
 *
 * Patch file is a JSON array of replacements, 1-based line numbers:
 *   [
 *     { "line": 73, "text": "      expl: \"...\",\n" },
 *     { "line": 74, "text": "    },\n" }
 *   ]
 *
 * Text is written verbatim, so include the trailing newline. A replacement may
 * be several lines: give the new text "\n" escapes inside the JSON string.
 *
 * Usage: node scripts/.patch.js <target> <patch.json>
 */
const fs = require("fs");
const [target, patchFile] = process.argv.slice(2);

let patch;
try {
  patch = JSON.parse(fs.readFileSync(patchFile, "utf8"));
} catch (e) {
  console.error(`patch file is not valid JSON: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(patch)) {
  console.error("patch file must contain a JSON array");
  process.exit(1);
}

const lines = fs.readFileSync(target, "utf8").split("\n");

let patched = 0;
const skipped = [];
for (const { line, text } of patch) {
  if (!Number.isInteger(line) || line < 1 || line > lines.length) {
    skipped.push(`${line} (file has ${lines.length} lines)`);
    continue;
  }
  // A replacement ending in "\n" is written back as multiple lines, so split
  // and splice rather than assigning a string that would embed a literal "\n".
  const replacement = String(text).split("\n");
  if (replacement[replacement.length - 1] === "") replacement.pop();
  lines.splice(line - 1, 1, ...replacement);
  patched++;
}

fs.writeFileSync(target, lines.join("\n"), "utf8");
console.log(`patched ${patched} line(s) in ${target}`);
if (skipped.length) {
  console.log(`SKIPPED ${skipped.length} out-of-range line(s): ${skipped.join("; ")}`);
  process.exitCode = 1;
}
