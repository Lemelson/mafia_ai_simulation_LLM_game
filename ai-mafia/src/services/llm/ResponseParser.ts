/**
 * Parse JSON response from LLM, handling common issues like
 * markdown code blocks, extra text, etc.
 */
export function parseJsonResponse<T>(raw: string): T | null {
  // Try direct parse first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Continue to other strategies
  }

  // Try extracting from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch {
      // Continue
    }
  }

  // Try finding JSON object in the text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch {
      // Continue
    }
  }

  return null;
}

export interface VoteResponse {
  vote: string;
}

export interface TargetResponse {
  target: string;
}

export interface InvestigateResponse {
  investigate: string;
}

export interface ProtectResponse {
  protect: string;
}

/**
 * Validate that a name exists in the list of alive players.
 */
export function validatePlayerName(name: string, aliveNames: string[]): string | null {
  // Exact match
  const exact = aliveNames.find(n => n.toLowerCase() === name.toLowerCase());
  if (exact) return exact;

  // Partial match
  const partial = aliveNames.find(n =>
    n.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(n.toLowerCase())
  );
  if (partial) return partial;

  return null;
}

/**
 * Extract speech text, removing any JSON or meta-information.
 */
export function extractSpeechText(raw: string, maxLength: number = 500): string {
  // Remove any JSON blocks
  let text = raw.replace(/```[\s\S]*?```/g, '').trim();
  // Remove any {"key": "value"} patterns
  text = text.replace(/\{[^}]*\}/g, '').trim();
  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }
  return text || raw.substring(0, maxLength);
}
