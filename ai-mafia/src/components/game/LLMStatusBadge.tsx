import { useLLMStatusStore } from '../../stores/llmStatusStore';
import { useTheme } from '../themes/ThemeProvider';

function fmtTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function LLMStatusBadge() {
  const { colors, theme } = useTheme();
  const {
    inFlight,
    llmCalls,
    llmSuccess,
    llmErrors,
    mockReplies,
    lastSource,
    lastFallbackReason,
    lastError,
    lastModelId,
    lastRequestAt,
    lastSuccessAt,
  } = useLLMStatusStore();

  const isLoading = inFlight > 0;
  const isMockMissingKey = lastFallbackReason === 'missing_key';
  const isErrorFallback = lastFallbackReason === 'error';

  const dotColor = isLoading
    ? colors.warning
    : isErrorFallback
      ? colors.danger
      : isMockMissingKey
        ? colors.textMuted
        : (lastSource === 'llm' ? colors.success : colors.textMuted);

  const label = isLoading
    ? 'LLM: запрос...'
    : isErrorFallback
      ? 'LLM: ошибка (mock)'
      : isMockMissingKey
        ? 'LLM: ключ не задан (mock)'
        : (lastSource === 'llm' ? 'LLM: OK' : 'LLM: mock');

  const titleParts = [
    `Provider: OpenRouter`,
    `Model: ${lastModelId ?? '—'}`,
    `Requests: ${llmCalls} (ok ${llmSuccess}, err ${llmErrors})`,
    `Mock replies: ${mockReplies}`,
    `Last request: ${fmtTime(lastRequestAt)}`,
    `Last success: ${fmtTime(lastSuccessAt)}`,
  ];
  if (lastError) titleParts.push(`Last error: ${lastError}`);

  return (
    <div
      title={titleParts.join('\n')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: theme.borderRadius,
        border: `1px solid ${colors.border}`,
        background: colors.bgSecondary,
        color: colors.textPrimary,
        fontFamily: theme.fontFamily,
        fontSize: '12px',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dotColor,
          boxShadow: `0 0 12px ${dotColor}55`,
        }}
      />
      <span style={{ color: colors.textMuted }}>{label}</span>
    </div>
  );
}

