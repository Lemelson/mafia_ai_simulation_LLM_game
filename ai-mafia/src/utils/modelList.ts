export function parseOpenRouterModelIdsFromText(text: string): string[] {
  const lines = (text ?? '').split(/\r?\n/);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Accept both formats:
    // - "openrouter:deepseek/deepseek-r1-0528:free"
    // - "deepseek/deepseek-r1-0528:free"
    const cleaned = line.startsWith('openrouter:') ? line.slice('openrouter:'.length) : line;

    // Ignore obvious non-ids.
    if (!cleaned.includes('/')) continue;
    if (cleaned.includes(' ')) continue;

    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      out.push(cleaned);
    }
  }

  return out;
}

export function filterFreeModels(modelIds: string[]): string[] {
  return (modelIds ?? []).filter(id => id.endsWith(':free'));
}

