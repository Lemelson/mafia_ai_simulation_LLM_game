// Usage:
//   cd ai-mafia
//   node scripts/extract-free-models.mjs < puter-models.txt > free-models.txt
//
// Input can contain:
//   openrouter:deepseek/deepseek-r1-0528:free
// or plain ids:
//   deepseek/deepseek-r1-0528:free

import fs from "node:fs";

const input = fs.readFileSync(0, "utf8");
const lines = input.split(/\r?\n/);

const out = [];
const seen = new Set();

for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  const cleaned = line.startsWith("openrouter:") ? line.slice("openrouter:".length) : line;
  if (!cleaned.endsWith(":free")) continue;
  if (!cleaned.includes("/")) continue;
  if (cleaned.includes(" ")) continue;
  if (seen.has(cleaned)) continue;
  seen.add(cleaned);
  out.push(cleaned);
}

out.sort();
process.stdout.write(out.join("\n") + (out.length ? "\n" : ""));

