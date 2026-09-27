/**
 * Dev helper: append one file to another without going through the shell.
 *
 * PowerShell 5.1 is not safe for this: `Set-Content -Encoding UTF8` writes a BOM,
 * and a later `Get-Content -Raw` (which defaults to the ANSI codepage) then reads
 * that BOM'd UTF-8 as mojibake, silently turning Arabic content into `?`.
 *
 * Usage: node scripts/.append.js <target> <source>
 */
const fs = require("fs");
const [target, source] = process.argv.slice(2);

const head = fs.readFileSync(target);
const add = fs.readFileSync(source);

// utf8 round-trip, tolerating a BOM on either side
const strip = (b) => {
  let s = b.toString("utf8");
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s;
};

// Join with exactly one newline. The target often has no trailing newline (it
// was truncated mid-file), so a bare concatenation would merge the target's
// last line with the first appended line and quietly corrupt both.
fs.writeFileSync(target, strip(head).replace(/\n*$/, "\n") + strip(add), "utf8");

const out = fs.readFileSync(target, "utf8");
const arabic = (out.match(/[\u0600-\u06FF]/g) || []).length;
const fffd = (out.match(/\uFFFD/g) || []).length;
const qmarks = out.split(/\r?\n/).filter((l) => (l.match(/\?/g) || []).length > 2).length;
console.log(
  `${target}: ${out.split(/\r?\n/).length} lines, ${arabic} arabic chars, ` +
    `${fffd} U+FFFD, ${qmarks} suspicious ? lines`
);
if (fffd || qmarks) process.exit(1);
