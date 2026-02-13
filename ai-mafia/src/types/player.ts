export interface Player {
  id: string;
  name: string;
  avatar: string; // emoji or URL
  color: string;
  systemPrompt: string;
  modelId: string;
  ttsVoiceId: string | null;
  ttsEnabled: boolean;
  createdAt: string;
  // ELO stats
  elo: number;
}

export const DEFAULT_AVATARS = [
  '🎭', '🕵️', '👤', '🤵', '👩‍⚕️', '🧑‍💼', '👨‍🔬', '🧙',
  '🦊', '🐺', '🦅', '🐻', '🦁', '🐯', '🦇', '🐍',
  '😎', '🤔', '🧐', '😈', '👻', '🎩', '💀', '🌹',
];

export const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

export const DEFAULT_MODELS = [
  { id: 'openrouter/free', name: 'Free Router', provider: 'OpenRouter', free: true },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large Preview', provider: 'Arcee AI', free: true },
  { id: 'openai/gpt-oss-120b:free', name: 'gpt-oss-120b', provider: 'OpenAI', free: true },
  { id: 'stepfun/step-3.5-flash:free', name: 'Step 3.5 Flash', provider: 'StepFun', free: true },
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera', provider: 'TNG Tech', free: true },
  { id: 'tngtech/deepseek-r1t-chimera:free', name: 'DeepSeek R1T Chimera', provider: 'TNG Tech', free: true },
  { id: 'tngtech/tng-r1t-chimera:free', name: 'TNG R1T Chimera', provider: 'TNG Tech', free: true },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'Z.ai', free: true },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B A3B', provider: 'NVIDIA', free: true },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', free: false },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', free: false },
  // NOTE: Some provider/model IDs change or temporarily lose endpoints on OpenRouter.
  // Prefer using `openrouter/free` if you want a stable "free" default.
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', provider: 'DeepSeek', free: true },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', provider: 'DeepSeek', free: true },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', free: true },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B', provider: 'Qwen', free: true },
  { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen3 235B', provider: 'Qwen', free: true },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'Mistral', free: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', free: true },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', free: false },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', free: false },
];

// Pre-built characters for the library
export const DEFAULT_PLAYERS: Omit<Player, 'id' | 'createdAt'>[] = [
  {
    name: 'Виктор',
    avatar: '🕵️',
    color: '#FF6B6B',
    systemPrompt: 'Ты подозрительный и нервный персонаж. Ты всех подозреваешь, часто меняешь мнение. Говоришь эмоционально, используешь восклицательные знаки. Склонен к теориям заговора.',
    modelId: 'openrouter/free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Шерлок',
    avatar: '🧐',
    color: '#4ECDC4',
    systemPrompt: 'Ты холодный, расчётливый аналитик. Ты основываешь свои выводы на логике и фактах. Ты запоминаешь, кто что говорил, и указываешь на противоречия. Говоришь спокойно и уверенно.',
    modelId: 'openrouter/free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Анна',
    avatar: '🌹',
    color: '#DDA0DD',
    systemPrompt: 'Ты хитрая и обаятельная. Ты умеешь убеждать других и манипулировать мнениями. Говоришь мягко, но всегда преследуешь свою цель. Используешь комплименты и лесть.',
    modelId: 'meta-llama/llama-3.3-70b-instruct:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Патрик',
    avatar: '😎',
    color: '#45B7D1',
    systemPrompt: 'Ты агрессивный и напористый. Ты первым обвиняешь, давишь на других, требуешь ответов. Если кто-то обвиняет тебя — яростно защищаешься и переводишь стрелки.',
    modelId: 'qwen/qwen3-235b-a22b:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Елена',
    avatar: '👩‍⚕️',
    color: '#96CEB4',
    systemPrompt: 'Ты добродушная и наивная. Ты легко веришь другим и часто соглашаешься с большинством. Иногда случайно говоришь подозрительные вещи, даже если невиновна. Говоришь просто, короткими фразами.',
    modelId: 'mistralai/mistral-small-3.1-24b-instruct:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Максим',
    avatar: '🤵',
    color: '#F7DC6F',
    systemPrompt: 'Ты осторожный дипломат. Стараешься найти компромисс, предлагаешь подождать с выводами. Не любишь спешить с обвинениями. Говоришь взвешенно, аргументированно.',
    modelId: 'google/gemma-3-27b-it:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Ирина',
    avatar: '🦊',
    color: '#F0B27A',
    systemPrompt: 'Ты наблюдательная и тихая. Предпочитаешь слушать других и делать выводы из их поведения. Говоришь редко, но метко. Замечаешь детали, которые другие пропускают.',
    modelId: 'openrouter/free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Дмитрий',
    avatar: '🐺',
    color: '#BB8FCE',
    systemPrompt: 'Ты харизматичный лидер. Любишь брать инициативу, организовывать голосования, предлагать стратегии. Говоришь уверенно, как будто знаешь правду. Иногда слишком самоуверен.',
    modelId: 'qwen/qwen3-235b-a22b:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'София',
    avatar: '🎭',
    color: '#85C1E9',
    systemPrompt: 'Ты актриса и мастер перевоплощений. Можешь убедительно играть любую роль. Говоришь драматично, с эмоциями. Любишь создавать интригу и напряжение в обсуждениях.',
    modelId: 'meta-llama/llama-3.3-70b-instruct:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
  {
    name: 'Артём',
    avatar: '🧙',
    color: '#82E0AA',
    systemPrompt: 'Ты философ и мыслитель. Ты рассуждаешь абстрактно, используешь метафоры и аналогии. Иногда отвлекаешься от темы, но в итоге приходишь к интересным выводам.',
    modelId: 'mistralai/mistral-small-3.1-24b-instruct:free',
    ttsVoiceId: null,
    ttsEnabled: false,
    elo: 1000,
  },
];
