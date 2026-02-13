// Usage:
//   cd ai-mafia
//   OPENROUTER_API_KEY="sk-or-..." node scripts/test-openrouter.mjs
//
// Optional:
//   OPENROUTER_MODEL="arcee-ai/trinity-large-preview:free" node scripts/test-openrouter.mjs
//
// This script is intentionally tiny: it uses the same OpenAI-compatible endpoint
// the app uses in the browser.

const apiKey = process.env.OPENROUTER_API_KEY?.trim();
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY env var.");
  process.exit(2);
}

const baseUrl = process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1/chat/completions";
const onlyModel = process.env.OPENROUTER_MODEL?.trim() || null;

const models = onlyModel ? [onlyModel] : [
  "arcee-ai/trinity-large-preview:free",
  "deepseek/deepseek-r1-0528:free",
  "openrouter/free",
];

async function call(model) {
  const body = {
    model,
    messages: [
      { role: "system", content: "Reply briefly and clearly." },
      { role: "user", content: "Say 'OK' and then one short sentence about mafia as a party game." },
    ],
    max_tokens: 80,
    temperature: 0.2,
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Optional OpenRouter headers:
      "HTTP-Referer": "http://localhost",
      "X-Title": "AI Mafia (script)",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }

  if (!res.ok) {
    const err = json?.error ? JSON.stringify(json.error) : text.slice(0, 500);
    throw new Error(`${res.status} ${res.statusText}: ${err}`);
  }

  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response.");
  return content;
}

for (const m of models) {
  process.stdout.write(`\n=== ${m} ===\n`);
  try {
    const out = await call(m);
    process.stdout.write(out.trim() + "\n");
  } catch (e) {
    process.stdout.write(`ERROR: ${e?.message || String(e)}\n`);
  }
}
