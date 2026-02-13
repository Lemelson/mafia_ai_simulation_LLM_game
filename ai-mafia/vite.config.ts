import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

function localSecretsPlugin(): Plugin {
  const localDir = path.join(process.cwd(), '.local')
  const secretsPath = path.join(localDir, 'secrets.json')

  function ensureLocalDir() {
    fs.mkdirSync(localDir, { recursive: true })
  }

  function readSecrets() {
    try {
      const raw = fs.readFileSync(secretsPath, 'utf8')
      const json = JSON.parse(raw)
      return {
        openRouterApiKey: typeof json.openRouterApiKey === 'string' ? json.openRouterApiKey : '',
        openRouterBaseUrl: typeof json.openRouterBaseUrl === 'string' ? json.openRouterBaseUrl : '',
      }
    } catch {
      return { openRouterApiKey: '', openRouterBaseUrl: '' }
    }
  }

  function writeSecrets(next: { openRouterApiKey?: string; openRouterBaseUrl?: string }) {
    ensureLocalDir()
    const payload = JSON.stringify(
      {
        openRouterApiKey: typeof next.openRouterApiKey === 'string' ? next.openRouterApiKey : '',
        openRouterBaseUrl: typeof next.openRouterBaseUrl === 'string' ? next.openRouterBaseUrl : '',
      },
      null,
      2
    )
    fs.writeFileSync(secretsPath, payload, { mode: 0o600 })
    try {
      fs.chmodSync(secretsPath, 0o600)
    } catch {
      // best-effort
    }
  }

  function deleteSecrets() {
    try {
      fs.unlinkSync(secretsPath)
    } catch {
      // ignore
    }
  }

  function sendJson(res: ServerResponse, status: number, body: unknown) {
    const data = JSON.stringify(body)
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(data)
  }

  async function readBody(req: IncomingMessage): Promise<string> {
    return await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', (chunk: unknown) => {
        data += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)
        if (data.length > 1024 * 1024) {
          reject(new Error('Request too large'))
          req.destroy()
        }
      })
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })
  }

  function handler(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = req.url || ''
    if (!url.startsWith('/__local_secrets')) return next()

    const p = url.replace(/^\/__local_secrets/, '') || '/'

    if (req.method === 'GET' && p === '/health') {
      return sendJson(res, 200, { ok: true })
    }

    if (p !== '/secrets') {
      return sendJson(res, 404, { error: 'Not found' })
    }

    if (req.method === 'GET') {
      const secrets = readSecrets()
      const key = (secrets.openRouterApiKey || '').trim()
      return sendJson(res, 200, {
        openRouterApiKey: key,
        openRouterApiKeyMasked: key ? `${key.slice(0, 6)}…${key.slice(-4)}` : '',
        openRouterBaseUrl: secrets.openRouterBaseUrl || '',
      })
    }

    if (req.method === 'PUT') {
      readBody(req)
        .then((raw) => {
          const body = raw ? JSON.parse(raw) : {}
          const existing = readSecrets()
          const openRouterApiKey =
            typeof body.openRouterApiKey === 'string' ? body.openRouterApiKey.trim() : existing.openRouterApiKey
          const openRouterBaseUrl =
            typeof body.openRouterBaseUrl === 'string' ? body.openRouterBaseUrl.trim() : existing.openRouterBaseUrl
          writeSecrets({ openRouterApiKey, openRouterBaseUrl })
          return sendJson(res, 200, { ok: true })
        })
        .catch((e) => sendJson(res, 400, { error: e?.message || String(e) }))
      return
    }

    if (req.method === 'DELETE') {
      deleteSecrets()
      return sendJson(res, 200, { ok: true })
    }

    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  return {
    name: 'local-secrets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localSecretsPlugin()],
})
