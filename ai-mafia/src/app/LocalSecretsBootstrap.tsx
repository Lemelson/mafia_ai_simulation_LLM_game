import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { loadLocalSecrets, localSecretsHealth } from '../services/localSecrets';
import { resetOpenRouterService } from '../services/llm/OpenRouterService';

export function LocalSecretsBootstrap() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // Best-effort: if a local secrets server is running and the current key is empty,
    // load it from ai-mafia/.local/secrets.json.
    (async () => {
      const current = useSettingsStore.getState();
      if ((current.openRouterApiKey ?? '').trim().length > 0) return;

      const ok = await localSecretsHealth();
      if (!ok) return;

      const secrets = await loadLocalSecrets();
      if ((secrets.openRouterApiKey ?? '').trim().length > 0) {
        useSettingsStore.getState().setApiKey(secrets.openRouterApiKey);
        resetOpenRouterService();
      }
      if ((secrets.openRouterBaseUrl ?? '').trim().length > 0) {
        useSettingsStore.getState().updateSettings({ openRouterBaseUrl: secrets.openRouterBaseUrl });
      }
    })().catch(() => {
      // Silent: bootstrap should never block app rendering.
    });
  }, []);

  return null;
}

