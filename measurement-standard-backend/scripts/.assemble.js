/*
 * Assemble a data module from a header, ordered section chunks, and a footer.
 *
 * The chunked build exists because writing a long Arabic payload in one go
 * corrupts a few percent of the characters, and a partially-corrupted file that
 * still parses is worse than one that fails loudly. Each chunk is written,
 * scanned, and repaired on its own, then concatenated here.
 *
 * Usage: node scripts/.assemble.js <out> <header> <chunk>... <footer>
 */
const fs = require("fs");

const [, , out, header, ...rest] = process.argv;
const footer = rest.pop();

const parts = [header, ...rest, footer].map((f) => fs.readFileSync(f, "utf8"));
const text = parts.join("\n");

// Exactly one newline at EOF, and no blank line between chunks.
const cleaned = text.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "\n");

fs.writeFileSync(out, cleaned, "utf8");
console.log(`wrote ${out} (${cleaned.split("\n").length} lines)`);
