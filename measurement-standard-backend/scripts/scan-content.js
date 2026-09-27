/**
 * Scans only the string literals of a data module (not the JS syntax) and reports
 * anything that should never reach a seed file:
 *
 *   - CJK / Hangul characters: these datasets are Arabic or English only, so any
 *     CJK codepoint is stray text from a generation slip.
 *   - Arabic prose that contains Latin words, minus an explicit allow list of
 *     scientific symbols and proper nouns.
 *   - Empty or whitespace-only strings.
 *   - Suspicious mixed-direction runs (a Latin word glued to an Arabic word with
 *     no space, e.g. `Deweyما`), which no allow list should ever excuse.
 *
 * This is a development aid: it runs against scripts/data/*.js before the SQL is
 * generated, so problems are reported with the source line rather than after the
 * fact in the .sql output.
 *
 * Usage: node scripts/scan-content.js scripts/data/qiyas.js
 */

const fs = require("fs");
const path = require("path");

const CJK = /[\u3000-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/;
// Cyrillic is not a real corruption *mode* in the same way CJK is, but it is
// what a mangled Arabic word actually turns into: writing a chunk of
// `الاقتصاد` once produced `الت。木нолм` -- Arabic letters interleaved with
// U+0430-U+043F Cyrillic, which renders in a terminal as plausible-looking
// script and so slips past review. These datasets are Arabic or English only,
// so any Cyrillic codepoint is a defect.
const CYRILLIC = /[\u0400-\u04FF\u0500-\u052F]/;
// U+FFFD is what a decoder leaves behind when it cannot read a byte, so its
// presence means the string was already mangled before it got here. It sits
// above the \uFF00-\uFFEF fullwidth block, so it needs its own check.
const REPLACEMENT = /\uFFFD/;
// Private-use codepoints: no legitimate seed content uses them.
const PRIVATE_USE = /[\uE000-\uF8FF]/;
const ARABIC = /[\u0600-\u06FF]/;
// Two or more consecutive ASCII '?'. A single '?' is legitimate in English
// content, but "??" can only come from a mis-decoded byte: PowerShell 5.1 reading
// BOM'd UTF-8 as ANSI replaces every non-ANSI character with '?', which silently
// destroys Arabic content while leaving the file syntactically valid.
const QUESTION_RUN = /\?{2,}/;
// Deliberately NOT global: these are used with .test() as well as .match(), and a
// /g regex carries `lastIndex` between calls, so .test() would skip matches
// depending on which string was scanned before.
const LATIN_WORD = /[A-Za-z]{2,}/;
// A Latin token immediately followed by an Arabic *letter* with no separating
// space, e.g. `Deweyما` or `Auxinالأوكسين`. Arabic punctuation (، ؛ ؟) and
// Arabic-Indic digits are excluded so `و B،` is not flagged.
const GLUED = /[A-Za-z][\u0621-\u064A\u066E-\u06D3]/;

/** Pull out every double-quoted string literal with its 1-based line number. */
function stringLiterals(source) {
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const line = source.slice(0, m.index).split(/\r?\n/).length;
    // The property name in front of the literal, so checks can be limited to the
    // fields that carry seed content and ignore plumbing like outFile and code.
    const before = source.slice(0, m.index);
    const key = (before.match(/([A-Za-z_$][\w$]*)\s*:\s*$/) || [])[1] || null;
    out.push({ line, text: m[1], key });
  }
  return out;
}

/** Read the latinAllow array the module passes to emit(). */
function allowListOf(source) {
  const m = source.match(/latinAllow:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function scan(file) {
  const source = fs.readFileSync(file, "utf8");
  const allow = allowListOf(source);
  // Longest first so `NaCl` is not partly eaten by the `Na` alternative.
  const allowRe = allow.length
    ? new RegExp(
        allow
          .slice()
          .sort((a, b) => b.length - a.length)
          .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|"),
        "g"
      )
    : null;

  const problems = [];
  const isEnglishModule = /languageNote:\s*"[^"]*English/i.test(source);
  const CONTENT_KEYS = new Set(["q", "expl", "t"]);

  for (const { line, text: raw, key } of stringLiterals(source)) {
    // JS-level escapes only; the data modules contain no real newlines in strings.
    const text = raw.replace(/\\(["'\\])/g, "$1");
    const where = `${path.basename(file)}:${line}`;

    if (!text.trim()) {
      problems.push(`${where}: empty string literal`);
      continue;
    }

    const repl = text.match(REPLACEMENT);
    if (repl) {
      problems.push(`${where}: U+FFFD replacement character in: ${text}`);
      continue;
    }

    if (QUESTION_RUN.test(text)) {
      problems.push(
        `${where}: run of '?' -- text was mis-decoded (${text.length} chars, likely all lost)`
      );
      continue;
    }

    const priv = text.match(PRIVATE_USE);
    if (priv) {
      problems.push(`${where}: private-use codepoint ${JSON.stringify(priv[0])} in: ${text}`);
      continue;
    }

    const hit = text.match(CJK);
    if (hit) {
      problems.push(`${where}: CJK/U+FF codepoint ${JSON.stringify(hit[0])} in: ${text}`);
      continue;
    }

    const cyr = text.match(CYRILLIC);
    if (cyr) {
      problems.push(
        `${where}: Cyrillic codepoint ${JSON.stringify(cyr[0])} (U+${cyr[0]
          .codePointAt(0)
          .toString(16)
          .toUpperCase()}) -- mojibake, not real content: ${text}`
      );
      continue;
    }

    const glued = text.match(GLUED);
    if (glued) {
      problems.push(`${where}: Latin glued to Arabic ${JSON.stringify(glued[0])} in: ${text}`);
      continue;
    }

    // A content field with Latin and no Arabic at all is either a stray
    // placeholder or an allow-listed symbol. The GLUED check below only fires
    // when Latin touches Arabic, so a standalone Latin choice such as
    // " lazari" would otherwise pass unnoticed. English-language modules are
    // excluded: there, Latin-only content is the point.
    if (
      !isEnglishModule &&
      CONTENT_KEYS.has(key) &&
      LATIN_WORD.test(text) &&
      !ARABIC.test(text)
    ) {
      const left = allowRe ? text.replace(allowRe, "") : text;
      if (LATIN_WORD.test(left)) {
        problems.push(`${where}: Latin-only string ${JSON.stringify(text)} in an Arabic module`);
        continue;
      }
    }

    if (ARABIC.test(text) && LATIN_WORD.test(text)) {
      // Strip the allow list before complaining about what is left.
      const left = allowRe ? text.replace(allowRe, "") : text;
      const rest = left.match(LATIN_WORD);
      if (rest) {
        problems.push(`${where}: unexplained Latin ${JSON.stringify(rest[0])} in: ${text}`);
      }
    }
  }
  return { problems, allow, strings: stringLiterals(source).length };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/scan-content.js <data module> [...]");
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  const { problems, allow, strings } = scan(file);
  if (problems.length) {
    failed += problems.length;
    console.log(`FAIL  ${path.basename(file)}  [${strings} strings, ${allow.length} allow tokens]`);
    for (const p of problems) console.log(`      - ${p}`);
  } else {
    console.log(`PASS  ${path.basename(file)}  [${strings} strings, ${allow.length} allow tokens]`);
  }
}
process.exit(failed ? 1 : 0);
