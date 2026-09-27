const fs = require("fs");
const file = "scripts/.e4.tmp";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
lines.push("  ],");
fs.writeFileSync(file, lines.join("\n") + "\n", "utf8");
console.log(`${file}: restored closing "  ]," (now ${lines.length} lines)`);
