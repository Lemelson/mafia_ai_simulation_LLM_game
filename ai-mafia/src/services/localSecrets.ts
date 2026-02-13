export type LocalSecrets = {
  openRouterApiKey: string;
  openRouterApiKeyMasked?: string;
  openRouterBaseUrl: string;
};

async function req<T>(method: 'GET' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/__local_secrets${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(json?.error ? String(json.error) : `${res.status} ${res.statusText}`);
  }
  return json as T;
}

export async function localSecretsHealth(): Promise<boolean> {
  try {
    await req('GET', '/health');
    return true;
  } catch {
    return false;
  }
}

export async function loadLocalSecrets(): Promise<LocalSecrets> {
  return await req<LocalSecrets>('GET', '/secrets');
}

export async function saveLocalSecrets(input: { openRouterApiKey?: string; openRouterBaseUrl?: string }): Promise<void> {
  await req('PUT', '/secrets', input);
}

export async function deleteLocalSecrets(): Promise<void> {
  await req('DELETE', '/secrets');
}

