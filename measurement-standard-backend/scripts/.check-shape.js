/**
 * Dev helper: report any question in a data module that does not have exactly
 * four choices or exactly one correct answer.
 *
 * scan-content.js checks what is inside each string; this checks the shape of
 * the structure, which is the other way a data module can be wrong.
 *
 * Usage: node scripts/.check-shape.js <data module>
 */
const fs = require("fs");
const file = process.argv[2];
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

let current = null;
const flush = () => {
  if (!current) return;
  const problems = [];
  if (current.choices.length !== 4) {
    problems.push(`${current.choices.length} choices (expected 4)`);
  }
  if (current.correct !== 1) {
    problems.push(`${current.correct} correct (expected 1)`);
  }
  if (current.dupes.size) {
    problems.push(`duplicate choice text: ${[...current.dupes].join(", ")}`);
  }
  if (!current.expl) problems.push("empty explanation");
  console.log(
    `${problems.length ? "FAIL" : "ok  "} line ${current.line}: ${JSON.stringify(
      current.q.slice(0, 45)
    )}${problems.length ? "  -> " + problems.join("; ") : ""}`
  );
  if (problems.length) process.exitCode = 1;
};

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const qm = l.match(/^      q:\s*"(.*)",\s*$/);
  if (qm) {
    flush();
    current = { line: i + 1, q: qm[1], choices: [], correct: 0, expl: null, dupes: new Set(), seen: new Set() };
    continue;
  }
  if (!current) continue;
  const em = l.match(/^      expl:\s*"(.*)",\s*$/);
  if (em) current.expl = em[1];
  const cm = l.match(/^        \{ t:\s*"(.*)", ok:\s*(true|false) \},\s*$/);
  if (cm) {
    // A later choice repeating an earlier one is a duplicate, so compare
    // against everything seen so far rather than only nearby lines.
    if (current.seen.has(cm[1])) current.dupes.add(cm[1]);
    current.seen.add(cm[1]);
    current.choices.push(cm[1]);
    if (cm[2] === "true") current.correct++;
  }
}
flush();
