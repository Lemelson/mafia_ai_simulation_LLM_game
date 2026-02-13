export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function estimateReadingTime(text: string, wpm: number = 200): number {
  const words = text.split(/\s+/).length;
  return Math.max(2000, (words / wpm) * 60 * 1000);
}

export function estimateTypingDelay(text: string): number {
  // ~30ms per character for typewriter effect
  return text.length * 30;
}

export class TypewriterController {
  private aborted = false;

  abort() {
    this.aborted = true;
  }

  isAborted() {
    return this.aborted;
  }

  async typewrite(
    text: string,
    onChar: (partial: string) => void,
    speed: number = 1,
  ): Promise<void> {
    const baseDelay = 30 / speed;
    let partial = '';
    for (const char of text) {
      if (this.aborted) {
        onChar(text);
        return;
      }
      partial += char;
      onChar(partial);
      await delay(baseDelay);
    }
  }
}
