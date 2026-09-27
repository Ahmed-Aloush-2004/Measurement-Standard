/*
 * Dev helper: drop the array-closing line from a non-final chunk.
 *
 * A section is split across several chunk files, and every chunk was written as
 * if it were the last one (each ends with the `  ],` that closes the questions
 * array). The assembler concatenates chunks, so only the final chunk of a section
 * may keep that line; the rest leave the array open.
 *
 * Usage: node scripts/.dropclose.js <file> [<file> ...]
 */
const fs = require("fs");

for (const file of process.argv.slice(2)) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  // Drop trailing blank lines, then the closing `  ],` if that is what is there.
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines[lines.length - 1] !== "  ],") {
    throw new Error(`${file}: expected last line to be "  ],", got ${JSON.stringify(lines[lines.length - 1])}`);
  }
  lines.pop();
  fs.writeFileSync(file, lines.join("\n") + "\n", "utf8");
  console.log(`${file}: dropped closing "  ]," (now ${lines.length} lines)`);
}
