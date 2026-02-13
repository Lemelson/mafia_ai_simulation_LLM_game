export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMServiceParams {
  systemPrompt: string;
  messages: ChatMessage[];
  modelId: string;
  maxTokens: number;
  temperature: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMService {
  generateReply(params: LLMServiceParams): Promise<string>;
  isAvailable(): boolean;
}
