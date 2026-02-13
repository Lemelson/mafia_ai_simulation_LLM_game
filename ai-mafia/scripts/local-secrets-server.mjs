// Local-only helper server for storing API keys on disk (NOT committed).
//
// Runs on 127.0.0.1:5174 and stores secrets in:
//   ai-mafia/.local/secrets.json
//
// API (all JSON):
//   GET    /secrets
//   PUT    /secrets   { openRouterApiKey?: string, openRouterBaseUrl?: string }
//   DELETE /secrets
//
// This is intentionally simple and should only be used on a trusted machine.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const host = "127.0.0.1";
const port = Number(process.env.LOCAL_SECRETS_PORT || "5174");
const rootDir = process.cwd(); // expected: ai-mafia
const localDir = path.join(rootDir, ".local");
const secretsPath = path.join(localDir, "secrets.json");

function ensureLocalDir() {
  fs.mkdirSync(localDir, { recursive: true });
}

function readSecrets() {
  try {
    const raw = fs.readFileSync(secretsPath, "utf8");
    const json = JSON.parse(raw);
    return {
      openRouterApiKey: typeof json.openRouterApiKey === "string" ? json.openRouterApiKey : "",
      openRouterBaseUrl: typeof json.openRouterBaseUrl === "string" ? json.openRouterBaseUrl : "",
    };
  } catch {
    return { openRouterApiKey: "", openRouterBaseUrl: "" };
  }
}

function writeSecrets(next) {
  ensureLocalDir();
  const payload = JSON.stringify(
    {
      openRouterApiKey: typeof next.openRouterApiKey === "string" ? next.openRouterApiKey : "",
      openRouterBaseUrl: typeof next.openRouterBaseUrl === "string" ? next.openRouterBaseUrl : "",
    },
    null,
    2
  );
  fs.writeFileSync(secretsPath, payload, { mode: 0o600 });
  try {
    fs.chmodSync(secretsPath, 0o600);
  } catch {
    // best-effort on non-POSIX
  }
}

function deleteSecrets() {
  try {
    fs.unlinkSync(secretsPath);
  } catch {
    // ignore
  }
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return sendJson(res, 400, { error: "Missing url" });

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.url !== "/secrets") {
    return sendJson(res, 404, { error: "Not found" });
  }

  if (req.method === "GET") {
    const secrets = readSecrets();
    // Never echo the full key back; provide enough for UI to show it's loaded.
    const key = (secrets.openRouterApiKey || "").trim();
    return sendJson(res, 200, {
      openRouterApiKey: key,
      openRouterApiKeyMasked: key ? `${key.slice(0, 6)}…${key.slice(-4)}` : "",
      openRouterBaseUrl: secrets.openRouterBaseUrl || "",
    });
  }

  if (req.method === "PUT") {
    try {
      const bodyRaw = await readBody(req);
      const body = bodyRaw ? JSON.parse(bodyRaw) : {};
      const existing = readSecrets();
      const openRouterApiKey = typeof body.openRouterApiKey === "string" ? body.openRouterApiKey.trim() : existing.openRouterApiKey;
      const openRouterBaseUrl = typeof body.openRouterBaseUrl === "string" ? body.openRouterBaseUrl.trim() : existing.openRouterBaseUrl;
      writeSecrets({ openRouterApiKey, openRouterBaseUrl });
      return sendJson(res, 200, { ok: true });
    } catch (e) {
      return sendJson(res, 400, { error: e?.message || String(e) });
    }
  }

  if (req.method === "DELETE") {
    deleteSecrets();
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(port, host, () => {
  console.log(`[local-secrets] listening on http://${host}:${port}`);
  console.log(`[local-secrets] writing to ${secretsPath}`);
});
