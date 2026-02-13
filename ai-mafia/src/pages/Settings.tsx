import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useSettingsStore } from '../stores/settingsStore';
import { useNamePoolStore } from '../stores/namePoolStore';
import { Button } from '../components/ui/Button';
import { THEMES } from '../components/themes/themes';
import { DEFAULT_MODELS } from '../types/player';
import { resetOpenRouterService } from '../services/llm/OpenRouterService';
import { OpenRouterService } from '../services/llm/OpenRouterService';
import { filterFreeModels, parseOpenRouterModelIdsFromText } from '../utils/modelList';

export function Settings() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const settings = useSettingsStore();
  const namePool = useNamePoolStore(s => s.names);
  const initNamePool = useNamePoolStore(s => s.initializeDefaults);
  const addName = useNamePoolStore(s => s.addName);
  const updateName = useNamePoolStore(s => s.updateName);
  const deleteName = useNamePoolStore(s => s.deleteName);
  const resetNames = useNamePoolStore(s => s.resetDefaults);
  const [newName, setNewName] = React.useState('');
  const [llmTestStatus, setLlmTestStatus] = React.useState<{ kind: 'idle' | 'loading' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });
  const [freeModelsText, setFreeModelsText] = React.useState('');
  const freeModelIds = useSettingsStore(s => s.freeModelIds);
  const setFreeModelIds = useSettingsStore(s => s.setFreeModelIds);
  const [modelTestResults, setModelTestResults] = React.useState<Record<string, { status: 'pending' | 'ok' | 'error'; ms?: number; text?: string }>>({});
  const [isBatchTesting, setIsBatchTesting] = React.useState(false);
  const batchCancelRef = React.useRef({ cancelled: false });

  const curatedFreeModels = React.useMemo(() => ([
    'arcee-ai/trinity-large-preview:free',
    'openai/gpt-oss-120b:free',
    'stepfun/step-3.5-flash:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'z-ai/glm-4.5-air:free',
    'deepseek/deepseek-r1-0528:free',
    'tngtech/deepseek-r1t-chimera:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'tngtech/tng-r1t-chimera:free',
  ]), []);

  const runBatchModelTest = React.useCallback(async (models: string[]) => {
    const key = (settings.openRouterApiKey ?? '').trim();
    if (!key) {
      setModelTestResults({ '(setup)': { status: 'error', text: 'API ключ пустой (введите OpenRouter ключ выше).' } });
      return;
    }

    batchCancelRef.current.cancelled = false;
    setIsBatchTesting(true);

    const svc = new OpenRouterService(key, settings.openRouterBaseUrl);
    const uniqueModels = Array.from(new Set(models.map(m => (m ?? '').trim()).filter(Boolean)));
    const maxModels = 25;
    const toTest = uniqueModels.length > maxModels ? uniqueModels.slice(0, maxModels) : uniqueModels;

    const initial: Record<string, { status: 'pending' | 'ok' | 'error'; ms?: number; text?: string }> = {};
    if (uniqueModels.length > maxModels) {
      initial['(setup)'] = {
        status: 'error',
        text: `Список слишком большой: ${uniqueModels.length}. Для защиты от лимитов тестирую первые ${maxModels}.`,
      };
    }
    for (const id of toTest) initial[id] = { status: 'pending' };
    setModelTestResults(initial);

    for (const modelId of toTest) {
      if (batchCancelRef.current.cancelled) break;
      const t0 = performance.now();
      try {
        const reply = await svc.generateReply({
          systemPrompt: 'Reply with exactly: OK',
          messages: [{ role: 'user', content: 'Привет! Ответь одним словом: OK' }],
          modelId,
          maxTokens: 16,
          temperature: 0,
          responseFormat: 'text',
        });
        const ms = Math.round(performance.now() - t0);
        setModelTestResults(prev => ({
          ...prev,
          [modelId]: { status: 'ok', ms, text: reply.trim().slice(0, 80) },
        }));
      } catch (err) {
        const ms = Math.round(performance.now() - t0);
        const msg = err instanceof Error ? err.message : String(err);
        setModelTestResults(prev => ({
          ...prev,
          [modelId]: { status: 'error', ms, text: msg.slice(0, 180) },
        }));
      }

      // Gentle pacing to reduce 429s.
      await new Promise(r => setTimeout(r, 250));
    }

    setIsBatchTesting(false);
  }, [settings.openRouterApiKey, settings.openRouterBaseUrl]);

  const allFreeModelsInApp = React.useMemo(() => {
    const ids = new Set<string>();
    for (const m of DEFAULT_MODELS) {
      if (m.free) ids.add(m.id);
    }
    for (const id of freeModelIds) ids.add(id);
    return Array.from(ids);
  }, [freeModelIds]);

  React.useEffect(() => {
    initNamePool();
  }, [initNamePool]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${colors.border}`,
    background: colors.bgInput,
    color: colors.textPrimary,
    fontSize: '14px',
    fontFamily: theme.fontFamily,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: theme.borderRadius,
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: colors.textSecondary,
    marginBottom: '6px',
    fontWeight: 600,
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Button variant="ghost" onClick={() => navigate('/')}>← Назад</Button>
        <h1 style={{ margin: 0, fontSize: '28px', color: colors.textPrimary }}>
          ⚙️ Настройки
        </h1>
      </div>

      {/* API Settings */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', color: colors.textPrimary, fontSize: '16px' }}>
          🔑 API OpenRouter
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>API Ключ</label>
          <input
            type="password"
            value={settings.openRouterApiKey}
            onChange={e => {
              settings.setApiKey(e.target.value);
              resetOpenRouterService();
            }}
            placeholder="sk-or-..."
            style={inputStyle}
          />
          <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
            Получите ключ на{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
              style={{ color: colors.accent }}>
              openrouter.ai
            </a>
            . Ключ хранится локально в вашем браузере.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={llmTestStatus.kind === 'loading'}
            onClick={async () => {
              const key = (settings.openRouterApiKey ?? '').trim();
              if (!key) {
                setLlmTestStatus({ kind: 'error', text: 'Ключ пустой (проверьте поле API ключа).' });
                return;
              }
              setLlmTestStatus({ kind: 'loading', text: 'Проверяю OpenRouter...' });
              try {
                const svc = new OpenRouterService(key, settings.openRouterBaseUrl);
                const reply = await svc.generateReply({
                  systemPrompt: 'You are a health check. Reply with exactly: OK',
                  messages: [{ role: 'user', content: 'Reply with OK.' }],
                  modelId: settings.defaultModel,
                  maxTokens: 10,
                  temperature: 0,
                  responseFormat: 'text',
                });
                setLlmTestStatus({ kind: 'ok', text: `OK (ответ: ${reply.slice(0, 80)})` });
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                setLlmTestStatus({ kind: 'error', text: msg.slice(0, 240) });
              }
            }}
          >
            🧪 Проверить OpenRouter
          </Button>

          {llmTestStatus.kind !== 'idle' && (
            <span style={{
              fontSize: '12px',
              color: llmTestStatus.kind === 'ok' ? colors.success : llmTestStatus.kind === 'error' ? colors.danger : colors.textMuted,
              maxWidth: '520px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
              title={llmTestStatus.text}
            >
              {llmTestStatus.kind === 'loading' ? '...' : llmTestStatus.text}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Модель по умолчанию</label>
          <select
            value={settings.defaultModel}
            onChange={e => settings.updateSettings({ defaultModel: e.target.value })}
            style={inputStyle}
          >
            {DEFAULT_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider}) {m.free ? '🆓' : '💰'}
              </option>
            ))}
            {freeModelIds.length > 0 && (
              <optgroup label="Imported free models">
                {freeModelIds.map(id => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>
            Импорт списка моделей (вставь строки вида `openrouter:...` и нажми “Импортировать free”)
          </label>
          <textarea
            value={freeModelsText}
            onChange={e => setFreeModelsText(e.target.value)}
            rows={6}
            placeholder={`openrouter:arcee-ai/trinity-large-preview:free\nopenrouter:deepseek/deepseek-r1-0528:free\n...`}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const ids = parseOpenRouterModelIdsFromText(freeModelsText);
                const free = filterFreeModels(ids);
                setFreeModelIds(free);
              }}
            >
              📥 Импортировать free
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFreeModelIds(curatedFreeModels);
                setFreeModelsText(curatedFreeModels.map(id => `openrouter:${id}`).join('\n'));
              }}
              title="Заменяет импортированный список на проверенные ID из твоего сообщения"
            >
              ⭐ Загрузить 8 моделей
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isBatchTesting}
              onClick={() => {
                const models = (freeModelIds.length > 0 ? freeModelIds : curatedFreeModels).slice(0, 30);
                void runBatchModelTest(models);
              }}
              title="Проверяет, что модели реально отвечают на минимальный healthcheck-запрос"
            >
              ▶︎ Тест моделей (до 30)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isBatchTesting}
              onClick={() => { void runBatchModelTest(allFreeModelsInApp); }}
              title="Проверяет все free-модели, которые сейчас есть в списке приложения (плюс импортированные)"
            >
              ▶︎ Тест free (все из списка)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!isBatchTesting}
              onClick={() => { batchCancelRef.current.cancelled = true; setIsBatchTesting(false); }}
            >
              Стоп
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFreeModelIds([])}
              disabled={freeModelIds.length === 0}
            >
              Очистить
            </Button>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              Free моделей в списке: {freeModelIds.length}
            </span>
          </div>

          {Object.keys(modelTestResults).length > 0 && (
            <div style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: theme.borderRadius,
              border: `1px solid ${colors.border}`,
              background: colors.bgSecondary,
              maxHeight: '180px',
              overflow: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '12px',
              whiteSpace: 'pre',
              color: colors.textPrimary,
            }}>
              {Object.entries(modelTestResults).map(([id, r]) => {
                const icon = r.status === 'pending' ? '…' : r.status === 'ok' ? 'OK' : 'ERR';
                const ms = typeof r.ms === 'number' ? ` ${r.ms}ms` : '';
                const text = r.text ? ` ${r.text}` : '';
                return `${icon}${ms} ${id}${text}\n`;
              }).join('')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Макс. токенов на реплику</label>
            <input
              type="number"
              value={settings.maxTokensPerReply}
              onChange={e => settings.updateSettings({ maxTokensPerReply: Number(e.target.value) })}
              min={50}
              max={1000}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Температура (креативность)</label>
            <input
              type="number"
              value={settings.temperature}
              onChange={e => settings.updateSettings({ temperature: Number(e.target.value) })}
              min={0}
              max={2}
              step={0.1}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', color: colors.textPrimary, fontSize: '16px' }}>
          🎨 Тема оформления
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => settings.setTheme(t.id)}
              style={{
                padding: '12px 18px',
                borderRadius: theme.borderRadius,
                border: t.id === settings.themeId
                  ? `2px solid ${colors.accent}`
                  : `1px solid ${colors.border}`,
                background: t.id === settings.themeId ? `${colors.accent}22` : colors.bgSecondary,
                color: colors.textPrimary,
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: theme.fontFamily,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '80px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{t.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{t.name}</span>
              <span style={{ fontSize: '10px', color: colors.textMuted }}>{t.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Game settings */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', color: colors.textPrimary, fontSize: '16px' }}>
          🎮 Настройки игры
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>
            Задержка между репликами:{' '}
            {settings.speechDelay === 0 ? 'Real-time' : `${(settings.speechDelay / 1000).toFixed(1)} сек`}
          </label>
          <input
            type="range"
            min={0}
            max={20000}
            step={250}
            value={settings.speechDelay}
            onChange={e => settings.setSpeechDelay(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: colors.accent,
              ['--range-accent' as never]: colors.accent,
              ['--range-track' as never]: colors.border,
              ['--range-thumb-border' as never]: colors.bgSecondary,
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>
            Скорость печати: {settings.typingSpeed}x
          </label>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={settings.typingSpeed}
            onChange={e => settings.setTypingSpeed(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: colors.accent,
              ['--range-accent' as never]: colors.accent,
              ['--range-track' as never]: colors.border,
              ['--range-thumb-border' as never]: colors.bgSecondary,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.autoScroll}
              onChange={e => settings.updateSettings({ autoScroll: e.target.checked })}
              style={{ accentColor: colors.accent }}
            />
            <span style={{ fontSize: '13px', color: colors.textPrimary }}>Автопрокрутка чата</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showNightActions}
              onChange={e => settings.updateSettings({ showNightActions: e.target.checked })}
              style={{ accentColor: colors.accent }}
            />
            <span style={{ fontSize: '13px', color: colors.textPrimary }}>Показывать ночные действия</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.revealRolesByDefault}
              onChange={e => settings.updateSettings({ revealRolesByDefault: e.target.checked })}
              style={{ accentColor: colors.accent }}
            />
            <span style={{ fontSize: '13px', color: colors.textPrimary }}>
              По умолчанию показывать роли (и истинные цвета)
            </span>
          </label>
        </div>
      </div>

      {/* Name pool */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', color: colors.textPrimary, fontSize: '16px' }}>
          🏷️ Пул имён игроков
        </h3>

        <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
          При старте каждой игры всем участникам выдаются случайные уникальные имена из этого списка (без повторов).
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {namePool.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={n}
                onChange={e => updateName(i, e.target.value)}
                style={inputStyle}
              />
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteName(i)}
                title="Удалить имя"
              >
                ✕
              </Button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Добавить имя"
              style={inputStyle}
            />
            <Button
              size="sm"
              onClick={() => {
                addName(newName);
                setNewName('');
              }}
              disabled={!newName.trim()}
            >
              Добавить
            </Button>
            <Button size="sm" variant="ghost" onClick={resetNames}>
              Сброс
            </Button>
          </div>
        </div>
      </div>

      {/* System prompt / rules */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', color: colors.textPrimary, fontSize: '16px' }}>
          🧠 Системный промпт
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Текст правил (rulesText)</label>
          <textarea
            value={settings.rulesText}
            onChange={e => settings.updateSettings({ rulesText: e.target.value })}
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontSize: '13px', lineHeight: 1.4 }}
          />
          <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '6px' }}>
            Этот текст подставляется в системный промпт и используется агентами как “правила игры”.
          </p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Шаблон системного промпта (systemPromptTemplate)</label>
          <textarea
            value={settings.systemPromptTemplate}
            onChange={e => settings.updateSettings({ systemPromptTemplate: e.target.value })}
            rows={12}
            style={{ ...inputStyle, resize: 'vertical', fontSize: '13px', lineHeight: 1.4 }}
          />
          <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '6px' }}>
            Плейсхолдеры: <code>{'{character_prompt}'}</code>, <code>{'{rules_text}'}</code>, <code>{'{name}'}</code>, <code>{'{role}'}</code>,{' '}
            <code>{'{mafia_allies}'}</code>, <code>{'{investigation_results}'}</code>, <code>{'{heal_history}'}</code>.
          </p>
        </div>
      </div>

      {/* TTS placeholder */}
      <div style={{ ...sectionStyle, opacity: 0.6 }}>
        <h3 style={{ margin: '0 0 8px', color: colors.textPrimary, fontSize: '16px' }}>
          🔊 Озвучка (TTS) — скоро
        </h3>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
          Поддержка ElevenLabs, OpenAI TTS и браузерного синтеза речи будет добавлена в будущем обновлении.
        </p>
      </div>
    </div>
  );
}
