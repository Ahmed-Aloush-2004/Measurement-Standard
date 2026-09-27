const path = require("path");
const { valueTuples, splitCells } = require("./parse-seed");

/**
 * Reports, per seed .sql file, how the single correct answer is distributed over
 * the four choice positions.
 *
 * A seed whose answer key always lands in the same slot is a giveaway, so each
 * file should come out close to 25 per slot. gen-sql.js rotates the choice order
 * to guarantee it; this script is how you confirm that survived generation, and
 * it is also what would catch a hand-authored file that skipped the generator.
 *
 * Exits non-zero if any question does not have exactly four choices with exactly
 * one correct, so it can be used as a check in a pipeline.
 */
let failed = false;

for (const file of process.argv.slice(2)) {
  const byQuestion = new Map();

  for (const { body } of valueTuples(require("fs").readFileSync(file, "utf8"))) {
    const cells = splitCells(body);
    if (cells.length !== 4) continue; // question row is 3 cells, section row is 2
    const [q, , correct] = cells;
    if (!/^(true|false)$/.test(correct)) continue;

    if (!byQuestion.has(q)) byQuestion.set(q, { total: 0, correct: 0, slot: 0 });
    const e = byQuestion.get(q);
    e.total += 1;
    if (correct === "true") {
      e.correct += 1;
      e.slot = e.total;
    }
  }

  const slots = [0, 0, 0, 0];
  const problems = [];
  for (const [q, e] of byQuestion) {
    if (e.correct !== 1) problems.push(`${e.correct} correct answers for "${q.slice(0, 70)}"`);
    if (e.total !== 4) problems.push(`${e.total} choices for "${q.slice(0, 70)}"`);
    slots[e.slot - 1] += 1;
  }
  if (problems.length) failed = true;

  console.log(
    `${path.basename(file).padEnd(26)} questions=${String(byQuestion.size).padStart(3)}  ` +
      `answer slots 1..4 = ${slots.join(" / ")}` +
      (problems.length ? `\n  PROBLEMS:\n    - ${problems.join("\n    - ")}` : "")
  );
}

process.exit(failed ? 1 : 0);
