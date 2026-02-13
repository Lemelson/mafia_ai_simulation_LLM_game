import type { LLMService, LLMServiceParams, ChatMessage } from './LLMService';

export class OpenRouterService implements LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  setApiKey(key: string) {
    this.apiKey = (key ?? '').trim();
  }

  setBaseUrl(url: string) {
    const trimmed = (url ?? '').trim();
    if (trimmed.length > 0) this.baseUrl = trimmed;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async generateReply(params: LLMServiceParams): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key not set');
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages,
    ];

    const body: Record<string, unknown> = {
      model: params.modelId,
      messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    };

    if (params.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Mafia',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    const choice = data.choices?.[0];
    const msg = choice?.message;
    const content = msg?.content;

    // OpenRouter typically returns a string content. Some providers may return an empty string
    // while still providing "reasoning" (i.e. the model never produced a final answer).
    if (typeof content === 'string') {
      if (content.trim().length > 0) return content;
      const finish = choice?.finish_reason || choice?.native_finish_reason || 'unknown';
      const hasReasoning = typeof msg?.reasoning === 'string' && msg.reasoning.trim().length > 0;
      if (hasReasoning) {
        throw new Error(`OpenRouter returned empty content (finish_reason=${finish}). Try increasing max tokens or using a non-reasoning model.`);
      }
      throw new Error(`OpenRouter returned empty content (finish_reason=${finish}).`);
    }

    // Some providers may represent content as a structured array.
    if (Array.isArray(content)) {
      const parts = content
        .map((p: unknown) => {
          if (!p) return '';
          if (typeof p === 'string') return p;
          if (typeof p === 'object') {
            const obj = p as Record<string, unknown>;
            if (typeof obj.text === 'string') return obj.text;
            if (typeof obj.content === 'string') return obj.content;
          }
          return '';
        })
        .join('');
      if (parts.trim().length > 0) return parts;
    }

    throw new Error('Invalid response from OpenRouter API (no message content)');
  }
}

// Singleton
let instance: OpenRouterService | null = null;

export function getOpenRouterService(): OpenRouterService {
  if (!instance) {
    const stored = localStorage.getItem('mafia-settings');
    const parsed = stored ? JSON.parse(stored) : null;
    const key = parsed?.state?.openRouterApiKey || '';
    const baseUrl = parsed?.state?.openRouterBaseUrl || undefined;
    instance = new OpenRouterService(key, baseUrl);
  }
  return instance;
}

export function resetOpenRouterService() {
  instance = null;
}
