import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/themes/ThemeProvider';
import { useSettingsStore } from '../stores/settingsStore';
import { useNamePoolStore } from '../stores/namePoolStore';
import { Button } from '../components/ui/Button';
import { THEMES } from '../components/themes/themes';
import { DEFAULT_MODELS } from '../types/player';
import { resetOpenRouterService } from '../services/llm/OpenRouterService';

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
          </select>
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
