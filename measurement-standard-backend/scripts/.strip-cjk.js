/**
 * Dev helper: strip stray CJK / Hangul / fullwidth codepoints from a file.
 * These never belong in the Arabic or English seed content, and they are
 * invisible in most terminals, so they are easier to remove by codepoint
 * range than by reading the line and retyping it.
 *
 * Usage: node scripts/.strip-cjk.js <file> [...]
 */
const fs = require("fs");
// CJK, Hangul, fullwidth, replacement and private-use characters. None of these
// belong in the Arabic or English seed content. U+FFFD is included because it is
// the marker a decoder leaves behind when text was already mangled.
const BAD = /[\u3000-\u9FFF\uAC00-\uD7AF\uFF00-\uFFFD\uE000-\uF8FF]/g;

for (const file of process.argv.slice(2)) {
  const before = fs.readFileSync(file, "utf8");
  const found = [...new Set(before.match(BAD) || [])];
  if (!found.length) {
    console.log(`clean  ${file}`);
    continue;
  }
  const after = before.replace(BAD, "");
  fs.writeFileSync(file, after, "utf8");
  console.log(
    `strip  ${file}  removed ${found.length} distinct: ` +
      found.map((c) => c + "=U+" + c.codePointAt(0).toString(16)).join(", ")
  );
}
