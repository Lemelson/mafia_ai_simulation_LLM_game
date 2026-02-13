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

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    return data.choices[0].message.content;
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
