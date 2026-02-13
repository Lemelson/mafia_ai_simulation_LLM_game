// TTS Service - Placeholder for future implementation

export interface Voice {
  id: string;
  name: string;
  language: string;
  preview?: string;
}

export interface TTSService {
  synthesize(params: {
    text: string;
    voiceId: string;
    speed?: number;
    pitch?: number;
  }): Promise<Blob>;

  getAvailableVoices(): Promise<Voice[]>;
  isAvailable(): boolean;
}

export interface TTSConfig {
  provider: 'elevenlabs' | 'openai' | 'browser' | null;
  apiKey: string | null;
  enabled: boolean;
  globalSpeed: number;
}

// Stub implementation
export class StubTTSService implements TTSService {
  async synthesize(): Promise<Blob> {
    throw new Error('TTS not implemented yet');
  }

  async getAvailableVoices(): Promise<Voice[]> {
    return [];
  }

  isAvailable(): boolean {
    return false;
  }
}
