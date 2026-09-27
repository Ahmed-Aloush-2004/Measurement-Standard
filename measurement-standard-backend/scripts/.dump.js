/**
 * Dev helper: print the codepoints of one line, and of the string literal on it.
 *
 * Terminals re-render mangled Arabic as plausible-looking script, so the only
 * trustworthy view of a suspect line is its codepoints.
 *
 * Usage: node scripts/.dump.js <file>:<line> [...]
 */
const fs = require("fs");

for (const spec of process.argv.slice(2)) {
  const i = spec.lastIndexOf(":");
  const file = spec.slice(0, i);
  const n = spec.slice(i + 1);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const l = lines[Number(n) - 1];
  if (l === undefined) {
    console.log(`${spec}: past end of file (${lines.length} lines)`);
    continue;
  }
  console.log(`${spec}: ${l}`);
  const strs = [...l.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  strs.forEach((s, k) => {
    const flagged = [...s]
      .map((ch, j) => ({ ch, j, cp: ch.codePointAt(0) }))
      .filter((x) => (x.cp >= 0x0400 && x.cp <= 0x052f) || (x.cp >= 0x41 && x.cp <= 0x7a));
    console.log(`  str${k} cps: ${[...s].map((c) => c.codePointAt(0).toString(16)).join(",")}`);
    if (flagged.length) {
      console.log(
        `  BAD at idx ${flagged.map((f) => f.j).join(",")}: ` +
          flagged.map((f) => `${f.ch}=U+${f.cp.toString(16).toUpperCase()}`).join(" ")
      );
    }
  });
}
