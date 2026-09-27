/**
 * Emits an idempotent PostgreSQL seed .sql file for one exam type.
 *
 * The question content is hand-authored in a data module; this only formats it.
 * Emitting the SQL mechanically guarantees that the `qcontent` key repeated on
 * every choice row is byte-identical to the question it belongs to, which is
 * the single easiest mistake to make when hand-typing the VALUES lists.
 *
 * Output shape is identical to prisma/sql/01_step.sql and is understood by
 * scripts/validate-sql.js.
 *
 * Usage: node scripts/data/<exam_type>.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/** Quote a value as a SQL string literal. */
function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Render `  (a, b, c),` rows padded into aligned columns. */
function rows(cells) {
  const widths = [];
  for (const row of cells) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] ?? 0, cell.length);
    });
  }
  return cells
    .map((row) => {
      const parts = row.map((cell, i) =>
        i === row.length - 1 ? cell : cell.padEnd(widths[i])
      );
      return `  (${parts.join(", ")})`;
    })
    .join(",\n");
}

function header({ outFile, examType, sectionCount, perSection, questionCount, choiceCount, languageNote, latinAllow }) {
  const allowLine = latinAllow?.length
    ? `\n-- ALLOW-LATIN: ${latinAllow.join(", ")}\n`
    : "";
  return `-- ============================================================================
-- ${outFile}   |   Exam type: ${examType.name}  (code = '${examType.code}')
-- ----------------------------------------------------------------------------
-- ${sectionCount} sections x ${perSection} questions x 4 choices (1 correct) = ${questionCount} questions / ${choiceCount} choices
-- ${languageNote}
--
-- Target: PostgreSQL. Tables per prisma/schema.prisma
--   exam_types (id uuid, name text, code varchar(100) UNIQUE)
--   sections   (id uuid, name text, exam_type_id uuid -> exam_types.id)
--   questions  (id uuid, content text, explanation text, created_at, section_id uuid)
--   choices    (id uuid, content text, is_correct bool, question_id uuid)
--
-- IDEMPOTENT: safe to re-run. No hard-coded UUIDs, so it works alongside rows
-- already created by the Prisma seeder (src/seeds/seed.ts). Rows are matched on
-- natural keys (exam_types.code, sections.name, questions.content, choices.content).
--
-- NOTE: the mobile app selects exam types and sections by NAME substring, not by
-- code -- see src/app/{verbal,quantitative,achievement,step}.tsx. Changing a
-- name below can make a section stop showing up on its screen.${allowLine}
--
-- Run:  psql "$DATABASE_URL" -f ${path.basename(outFile)}
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) EXAM TYPE
-- ----------------------------------------------------------------------------
-- NOTE: every id is supplied explicitly. prisma/schema.prisma declares the ids as
-- @default(uuid()), which Prisma resolves in the client, so the DDL has no column
-- DEFAULT and a raw INSERT that omits id fails with SQLSTATE 23502.
-- gen_random_uuid() is built in from PostgreSQL 13 on, so no extension is needed.
INSERT INTO exam_types (id, name, code)
SELECT gen_random_uuid(), v.name, v.code
FROM (VALUES (${lit(examType.name)}, ${lit(examType.code)})) AS v(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM exam_types et WHERE et.code = v.code
);

-- ----------------------------------------------------------------------------
-- 2) SECTIONS
-- ----------------------------------------------------------------------------
INSERT INTO sections (id, name, exam_type_id)
SELECT gen_random_uuid(), v.name, et.id
FROM (VALUES
${rows(examType.sections.map((s, i) => [lit(s), String(i + 1)]))}
) AS v(name, ord)
JOIN exam_types et ON et.code = ${lit(examType.code)}
WHERE NOT EXISTS (
  SELECT 1 FROM sections s
  WHERE s.exam_type_id = et.id AND s.name = v.name
);

-- ============================================================================
-- 3) QUESTIONS + CHOICES
--    Repeated per section. \`sec\` resolves the section id from its natural key.
-- ============================================================================
`;
}

/**
 * Rotate a question's choices so the correct one lands on `targetSlot`.
 *
 * Hand-authoring 800 questions naturally makes the answer key drift: measured
 * across the first three seed files the correct answer sat in slot 1 for 61% of
 * questions and in slot 4 for only 2%, which is a giveaway to anyone who plays the
 * app. Rotating mechanically makes the distribution exactly even -- with a 4-slot
 * cycle and a per-section length that is a multiple of 4, every slot gets the same
 * number of correct answers in every section (5 per slot at 20 questions/section,
 * 10 at 40) -- while preserving the relative order of the distractors and keeping
 * generation deterministic.
 */
function balanceChoices(choices, targetSlot) {
  const correct = choices.findIndex((c) => c.ok);
  if (correct < 0) return choices;
  const shift = (correct - targetSlot + choices.length) % choices.length;
  return choices.map((_, i) => choices[(i + shift) % choices.length]);
}

function sectionSql({ code, section, questions, sectionIndex }) {
  const name = lit(section);

  const questionRows = rows(
    questions.map((q, i) => [lit(q.q), lit(q.expl), String(i + 1)])
  );

  const choiceRows = rows(
    questions.flatMap((q, qi) =>
      balanceChoices(q.choices, (sectionIndex * 7 + qi) % q.choices.length).map(
        (c) => [lit(q.q), lit(c.t), String(Boolean(c.ok)), String(qi + 1)]
      )
    )
  );

  return `
-- ---------------------------------------------------------------- ${section} ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = ${lit(code)} AND s.name = ${name}
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
${questionRows}
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
${choiceRows}
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = ${lit(code)} AND s.name = ${name}
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);
`;
}

function footer({ code }) {
  return `
-- ----------------------------------------------------------------------------
-- ${"VERIFY"}
-- ----------------------------------------------------------------------------
SELECT 'exam_types'  AS entity, count(*) FROM exam_types  WHERE code = ${lit(code)}
UNION ALL SELECT 'sections',   count(*) FROM sections s JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = ${lit(code)}
UNION ALL SELECT 'questions',  count(*) FROM questions q JOIN sections s ON s.id = q.section_id JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = ${lit(code)}
UNION ALL SELECT 'choices',    count(*) FROM choices ch JOIN questions q ON q.id = ch.question_id JOIN sections s ON s.id = q.section_id JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = ${lit(code)};

COMMIT;
`;
}

/** Guard rails so a bad data module fails here instead of shipping bad SQL. */
function assertSane(examType) {
  const errs = [];
  // Sections are 20 questions each by default. A module may opt into a different
  // length per section with `perSection`; it must divide evenly by 4 so the answer
  // rotation below still lands the correct answer on every slot equally often.
  const perSection = examType.perSection ?? 20;
  if (!Number.isInteger(perSection) || perSection < 4) {
    errs.push(`perSection must be an integer >= 4 (got ${JSON.stringify(examType.perSection)})`);
  } else if (perSection % 4 !== 0) {
    errs.push(`perSection must be a multiple of 4 so answer slots stay balanced (got ${perSection})`);
  }
  if (!examType.outFile) errs.push("outFile is required");
  if (!examType.examType?.name) errs.push("examType.name is required");
  if (!examType.examType?.code) errs.push("examType.code is required");
  if (!examType.examType?.sections?.length) errs.push("examType.sections is required");

  let questions = 0;
  let choices = 0;
  for (const section of examType.examType?.sections ?? []) {
    const list = examType.sections?.[section] ?? [];
    if (list.length !== perSection) errs.push(`section "${section}": ${list.length} questions (expected ${perSection})`);
    const seen = new Set();
    for (const q of list) {
      questions++;
      if (!q.q?.trim()) errs.push(`section "${section}": empty question content`);
      if (!q.expl?.trim()) errs.push(`section "${section}": empty explanation for "${q.q}"`);
      if (seen.has(q.q)) errs.push(`section "${section}": duplicate question "${q.q}"`);
      seen.add(q.q);
      if (q.choices?.length !== 4) {
        errs.push(`section "${section}": "${q.q}" has ${q.choices?.length} choices (expected 4)`);
        continue;
      }
      choices += 4;
      const texts = q.choices.map((c) => c.t);
      if (new Set(texts).size !== texts.length) {
        errs.push(`section "${section}": "${q.q}" has duplicate choice texts`);
      }
      const ok = q.choices.filter((c) => c.ok).length;
      if (ok !== 1) errs.push(`section "${section}": "${q.q}" has ${ok} correct choices (expected 1)`);
    }
  }
  if (errs.length) {
    throw new Error(`data module is not sane:\n  - ${errs.join("\n  - ")}`);
  }
  return { questions, choices };
}

function emit(spec) {
  const { examType, sections, outFile, languageNote } = spec;
  const { questions, choices } = assertSane(spec);

  const body = examType.sections
    .map((name, sectionIndex) =>
      sectionSql({ code: examType.code, section: name, questions: sections[name], sectionIndex })
    )
    .join("");

  const sql =
    header({
      outFile: path.basename(outFile),
      examType,
      sectionCount: examType.sections.length,
      perSection: spec.perSection ?? 20,
      questionCount: questions,
      choiceCount: choices,
      languageNote,
      latinAllow: spec.latinAllow,
    }) +
    body +
    footer({ code: examType.code });

  const dest = path.isAbsolute(outFile) ? outFile : path.join(ROOT, outFile);
  fs.writeFileSync(dest, sql, "utf8");
  console.log(
    `wrote ${path.relative(ROOT, dest)}  ` +
      `[${examType.sections.length} sections, ${questions} questions, ${choices} choices]`
  );
}

module.exports = { emit };
