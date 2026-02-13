// Runs Vite + local-secrets server together without extra deps.
import { spawn } from "node:child_process";
import path from "node:path";

const cwd = process.cwd(); // expected: ai-mafia

const secrets = spawn(
  process.execPath,
  [path.join("scripts", "local-secrets-server.mjs")],
  { cwd, stdio: "inherit" }
);

const vite = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
  { cwd, stdio: "inherit" }
);

function shutdown(code = 0) {
  try { vite.kill("SIGINT"); } catch {}
  try { secrets.kill("SIGINT"); } catch {}
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

vite.on("exit", (code) => shutdown(code ?? 0));

