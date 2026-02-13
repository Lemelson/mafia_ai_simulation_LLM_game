import { create } from 'zustand';

export type LLMReplySource = 'llm' | 'mock';
export type LLMFallbackReason = 'missing_key' | 'error' | null;

export interface LLMStatusState {
  provider: 'openrouter';

  // Counters
  attempts: number;      // total reply generations (including mock)
  llmCalls: number;      // network calls attempted
  llmSuccess: number;    // successful LLM responses
  llmErrors: number;     // failed LLM calls
  mockReplies: number;   // replies served from mock (missing key or fallback)

  // Live status
  inFlight: number;
  lastModelId: string | null;
  lastSource: LLMReplySource | null;
  lastFallbackReason: LLMFallbackReason;
  lastError: string | null;
  lastRequestAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;

  // Actions
  reset: () => void;
  markMockMissingKey: (modelId: string) => void;
  startLLMCall: (modelId: string) => void;
  markLLMSuccess: (modelId: string) => void;
  markLLMError: (modelId: string, error: unknown) => void;
  markLLMErrorAndFallback: (modelId: string, error: unknown) => void;
}

const initial: Omit<
  LLMStatusState,
  'reset' | 'markMockMissingKey' | 'startLLMCall' | 'markLLMSuccess' | 'markLLMError' | 'markLLMErrorAndFallback'
> = {
  provider: 'openrouter',
  attempts: 0,
  llmCalls: 0,
  llmSuccess: 0,
  llmErrors: 0,
  mockReplies: 0,
  inFlight: 0,
  lastModelId: null,
  lastSource: null,
  lastFallbackReason: null,
  lastError: null,
  lastRequestAt: null,
  lastSuccessAt: null,
  lastErrorAt: null,
};

function toErrorString(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export const useLLMStatusStore = create<LLMStatusState>()((set, get) => ({
  ...initial,

  reset: () => set({ ...initial }),

  markMockMissingKey: (modelId) => {
    const now = new Date().toISOString();
    set(state => ({
      attempts: state.attempts + 1,
      mockReplies: state.mockReplies + 1,
      lastModelId: modelId,
      lastSource: 'mock',
      lastFallbackReason: 'missing_key',
      lastError: null,
      lastRequestAt: now,
    }));
  },

  startLLMCall: (modelId) => {
    const now = new Date().toISOString();
    set(state => ({
      attempts: state.attempts + 1,
      llmCalls: state.llmCalls + 1,
      inFlight: state.inFlight + 1,
      lastModelId: modelId,
      lastRequestAt: now,
      // Clear stale error when a new request begins.
      lastError: null,
      lastFallbackReason: null,
    }));
  },

  markLLMSuccess: (modelId) => {
    const now = new Date().toISOString();
    set(state => ({
      inFlight: Math.max(0, state.inFlight - 1),
      llmSuccess: state.llmSuccess + 1,
      lastModelId: modelId,
      lastSource: 'llm',
      lastFallbackReason: null,
      lastError: null,
      lastSuccessAt: now,
    }));
  },

  markLLMError: (modelId, error) => {
    const now = new Date().toISOString();
    const msg = toErrorString(error).slice(0, 400);
    const inFlight = get().inFlight;
    set(state => ({
      inFlight: Math.max(0, inFlight - 1),
      llmErrors: state.llmErrors + 1,
      lastModelId: modelId,
      lastSource: 'llm',
      lastFallbackReason: null,
      lastError: msg,
      lastErrorAt: now,
    }));
  },

  markLLMErrorAndFallback: (modelId, error) => {
    const now = new Date().toISOString();
    const msg = toErrorString(error).slice(0, 400);
    // If the caller starts a request and errors before decrement, keep it safe.
    const inFlight = get().inFlight;
    set(state => ({
      inFlight: Math.max(0, inFlight - 1),
      llmErrors: state.llmErrors + 1,
      mockReplies: state.mockReplies + 1,
      lastModelId: modelId,
      lastSource: 'mock',
      lastFallbackReason: 'error',
      lastError: msg,
      lastErrorAt: now,
    }));
  },
}));
