/**
 * Structural validator for the generated seed .sql files.
 * Does not need a database: parses the VALUES lists out of the SQL and asserts
 * the invariants we care about (counts, exactly-one-correct, no dup questions,
 * balanced quotes/parens, choice<->question linkage).
 *
 * Usage: node scripts/validate-sql.js [--per-section=N] <file.sql> [...]
 */

const fs = require("fs");

/**
 * Parse `FROM (VALUES (...), (...), (...)) AS v(...)` into an array of string[] rows.
 *
 * `listOpen` must be the index of the '(' that opens the VALUES list (the one
 * right after `FROM `). Depth 1 is that outer paren, depth 2 is a row, so the
 * column alias parens in `AS v(a, b)` are never mistaken for rows.
 *
 * The list is closed by the ')' that follows the final row, which is why we
 * return as soon as a row closes and the next non-space char is ')'. Without
 * that check the parser would happily run on into the rest of the statement.
 */
function parseTuples(src, listOpen) {
  const rows = [];
  let i = listOpen;
  let row = [];
  let field = "";
  let inStr = false;
  let depth = 0;

  const pushField = () => {
    row.push(field.trim());
    field = "";
  };
  const pushRow = () => {
    pushField();
    if (row.length > 1 || row[0] !== "") rows.push(row);
    row = [];
  };

  for (; i < src.length; i++) {
    const c = src[i];

    if (inStr) {
      if (c === "'") {
        if (src[i + 1] === "'") {
          field += "'";
          i++;
        } else {
          inStr = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === "'") { inStr = true; continue; }

    if (c === "(") {
      depth++;
      if (depth === 2) { row = []; field = ""; }
      continue;
    }

    if (c === ")") {
      if (depth === 2) {
        pushRow();
        depth = 1;
        let j = i + 1;
        while (j < src.length && /\s/.test(src[j])) j++;
        if (src[j] === ")") { i = j; break; }
        continue;
      }
      depth--;
      if (depth === 0) { i++; break; }
      continue;
    }

    if (c === "," && depth === 2) { pushField(); continue; }
    if (depth === 2) field += c;
  }
  return { rows, end: i };
}

function checkQuotesOutsideComments(sql) {
  // Walk the file, skipping -- comments, and make sure every ' opens/closes.
  let inStr = false;
  let line = 1;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "\n") line++;
    if (inStr) {
      if (c === "'") {
        if (sql[i + 1] === "'") { i++; continue; }
        inStr = false;
      }
      continue;
    }
    if (c === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      line++;
      continue;
    }
    if (c === "'") inStr = true;
  }
  return { balanced: !inStr, line };
}

function extractSections(sql) {
  // Section names from the sections INSERT VALUES block.
  const anchor = sql.indexOf("INSERT INTO sections");
  if (anchor === -1) return null;
  const listOpen = sql.indexOf("(VALUES", anchor);
  return parseTuples(sql, listOpen).rows;
}

function extractExamTypes(sql) {
  const anchor = sql.indexOf("INSERT INTO exam_types");
  if (anchor === -1) return null;
  const listOpen = sql.indexOf("(VALUES", anchor);
  return parseTuples(sql, listOpen).rows;
}

/**
 * Flag data rows that mix Arabic and Latin scripts.
 *
 * Every seeded row is either wholly Arabic or wholly English, so a row holding
 * both means stray text leaked into the content (a common authoring slip, and
 * one that is invisible in a terminal that cannot render Arabic).
 *
 * Science exam types legitimately embed symbols (Na, NaCl, pH, SI units). Those
 * are declared per file with an `-- ALLOW-LATIN: ...` directive and removed
 * before the test, so real prose garbage is still caught.
 */
function checkMixedScripts(sql) {
  const allow = [];
  const directive = /^--\s*ALLOW-LATIN:\s*(.*)$/m.exec(sql);
  if (directive) {
    for (const token of directive[1].split(",")) {
      const t = token.trim();
      if (t) allow.push(t);
    }
  }
  // Longest first, so `NaCl` is not partly eaten by the `Na` alternative.
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
  sql.split(/\r?\n/).forEach((line, i) => {
    if (!/^\s*\(/.test(line)) return;
    // `true` / `false` are the is_correct column, not content.
    let content = line.replace(/\btrue\b|\bfalse\b/g, "");
    if (allowRe) content = content.replace(allowRe, "");

    // U+FFFD means the text was mangled before it reached the SQL, and
    // private-use codepoints never belong in seed content.
    if (/\uFFFD/.test(content)) {
      problems.push(`line ${i + 1}: contains U+FFFD replacement character: ${line.trim()}`);
      return;
    }
    if (/[\uE000-\uF8FF]/.test(content)) {
      problems.push(`line ${i + 1}: contains private-use codepoint: ${line.trim()}`);
      return;
    }

    // These datasets are Arabic or English only, so CJK is always stray text.
    if (/[\u3000-\u9FFF\uAC00-\uD7AF]/.test(content)) {
      problems.push(`line ${i + 1}: contains CJK characters: ${line.trim()}`);
      return;
    }

    const arabic = /[\u0600-\u06FF]/.test(content);
    const latin = /[A-Za-z]/.test(content);
    if (arabic && latin) problems.push(`line ${i + 1}: mixes Arabic and Latin: ${line.trim()}`);
  });
  return problems;
}

/**
 * Every INSERT must supply `id` explicitly.
 *
 * prisma/schema.prisma declares the ids as @default(uuid()), which Prisma
 * resolves in the client rather than in the DDL, so the column has no database
 * DEFAULT. A raw INSERT that omits id fails at runtime with
 * "null value in column id ... violates not-null constraint" (SQLSTATE 23502).
 */
function checkExplicitIds(sql) {
  const problems = [];
  const re = /INSERT INTO\s+(\w+)\s*\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const [, table, columnList] = m;
    const columns = columnList.split(",").map((c) => c.trim().toLowerCase());
    if (!columns.includes("id")) {
      problems.push(
        `INSERT INTO ${table} omits id -- the column has no database default ` +
          `(prisma @default(uuid()) is client-side) and will fail with SQLSTATE 23502`
      );
    }
  }
  return problems;
}

function main() {
  const argv = process.argv.slice(2);

  // Sections are 20 questions each by default. Files that deliberately use a
  // longer section (e.g. the expanded general aptitude exam) opt in with
  // --per-section=N; every other invocation keeps the original 20.
  let expectedPerSection = 20;
  const files = [];
  for (const arg of argv) {
    const m = arg.match(/^--per-section=(\d+)$/);
    if (m) {
      expectedPerSection = Number(m[1]);
      continue;
    }
    files.push(arg);
  }

  if (files.length === 0) {
    console.error("usage: node validate-sql.js [--per-section=N] <file.sql> [...]");
    process.exit(2);
  }
  if (expectedPerSection < 1 || expectedPerSection % 4 !== 0) {
    console.error(`--per-section must be a positive multiple of 4 (got ${expectedPerSection})`);
    process.exit(2);
  }

  let failed = 0;

  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    const problems = [];

    const q = checkQuotesOutsideComments(sql);
    if (!q.balanced) {
      problems.push(`unbalanced single quote; last opened near line ${q.line}`);
    }

    for (const p of checkMixedScripts(sql)) problems.push(p);
    for (const p of checkExplicitIds(sql)) problems.push(p);

    if (/\bBEGIN\s*;/.test(sql) && !/\bCOMMIT\s*;/.test(sql)) {
      problems.push("BEGIN without COMMIT");
    }

    const examTypes = extractExamTypes(sql) || [];
    const sectionRows = extractSections(sql) || [];
    if (examTypes.length === 0) problems.push("no exam_types VALUES found");
    if (sectionRows.length === 0) problems.push("no sections VALUES found");

    // Question blocks end with:  ) AS v(content, expl, ord)
    // The VALUES list sits BEFORE the alias; the section name sits BEFORE that
    // (inside the `WITH sec AS (...)` CTE).
    const questionBlocks = [];
    const qRe = /\)\s*AS v\(content, expl, ord\)/g;
    let m;
    while ((m = qRe.exec(sql)) !== null) {
      const aliasEnd = m.index + m[0].length;
      const vFrom = sql.lastIndexOf("FROM (VALUES", aliasEnd);
      if (vFrom === -1) continue;
      const { rows } = parseTuples(sql, vFrom + "FROM ".length);
      const before = sql.slice(0, aliasEnd);
      const secMatches = [...before.matchAll(/s\.name = '([^']+)'/g)];
      const section = secMatches.length ? secMatches[secMatches.length - 1][1] : "?";
      questionBlocks.push({ section, rows });
    }

    // Choice blocks end with:  ) AS v(qcontent, content, correct, ord)
    // Here the section name appears AFTER, in the JOIN ... WHERE clause.
    const choiceRows = [];
    const cRe = /\)\s*AS v\(qcontent, content, correct, ord\)/g;
    while ((m = cRe.exec(sql)) !== null) {
      const aliasEnd = m.index + m[0].length;
      const vFrom = sql.lastIndexOf("FROM (VALUES", aliasEnd);
      if (vFrom === -1) continue;
      const { rows } = parseTuples(sql, vFrom + "FROM ".length);
      const after = sql.slice(aliasEnd, aliasEnd + 500);
      const secMatch = after.match(/s\.name = '([^']+)'/);
      choiceRows.push({ section: secMatch ? secMatch[1] : "?", rows });
    }

    if (questionBlocks.length !== sectionRows.length) {
      problems.push(
        `question blocks (${questionBlocks.length}) != sections (${sectionRows.length})`
      );
    }

    let totalQ = 0;
    let totalC = 0;

    sectionRows.forEach((srow) => {
      const sectionName = srow[0];
      const qb = questionBlocks.find((b) => b.section === sectionName);
      if (!qb) {
        problems.push(`section "${sectionName}": no question block found`);
        return;
      }
      if (qb.rows.length !== expectedPerSection) {
        problems.push(
          `section "${sectionName}": ${qb.rows.length} questions (expected ${expectedPerSection})`
        );
      }

      const seen = new Set();
      for (const r of qb.rows) {
        const [content, expl] = r;
        if (!content) problems.push(`section "${sectionName}": empty question content`);
        if (!expl) problems.push(`section "${sectionName}": empty explanation for "${content}"`);
        if (seen.has(content)) {
          problems.push(`section "${sectionName}": duplicate question "${content}"`);
        }
        seen.add(content);
      }
      totalQ += qb.rows.length;

      const cb = choiceRows.find((b) => b.section === sectionName);
      if (!cb) {
        problems.push(`section "${sectionName}": no choice block found`);
        return;
      }

      const byQuestion = new Map();
      for (const r of cb.rows) {
        const [qcontent, content, correct] = r;
        if (!byQuestion.has(qcontent)) byQuestion.set(qcontent, []);
        byQuestion.get(qcontent).push({ content, correct: correct === "true" });
      }
      totalC += cb.rows.length;

      for (const q of qb.rows) {
        const content = q[0];
        const choices = byQuestion.get(content);
        if (!choices) {
          problems.push(`section "${sectionName}": no choices for "${content}"`);
          continue;
        }
        if (choices.length !== 4) {
          problems.push(
            `section "${sectionName}": "${content}" has ${choices.length} choices (expected 4)`
          );
        }
        const correctCount = choices.filter((c) => c.correct).length;
        if (correctCount !== 1) {
          problems.push(
            `section "${sectionName}": "${content}" has ${correctCount} correct choices (expected 1)`
          );
        }
        const contents = choices.map((c) => c.content);
        if (new Set(contents).size !== contents.length) {
          problems.push(`section "${sectionName}": "${content}" has duplicate choice texts`);
        }
      }

      // orphan choices pointing at a question that does not exist
      for (const key of byQuestion.keys()) {
        if (!seen.has(key)) {
          problems.push(`section "${sectionName}": choices reference unknown question "${key}"`);
        }
      }
    });

    const ok = problems.length === 0;
    if (!ok) failed++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${file}  ` +
        `[examTypes=${examTypes.length} sections=${sectionRows.length} questions=${totalQ} choices=${totalC}]`
    );
    for (const p of problems) console.log(`      - ${p}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
