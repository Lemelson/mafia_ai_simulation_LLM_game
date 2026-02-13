import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/themes/ThemeProvider';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { PlayerAvatar } from '../components/game/PlayerAvatar';
import { DEFAULT_AVATARS, DEFAULT_COLORS, DEFAULT_MODELS } from '../types/player';
import type { Player } from '../types/player';

export function PlayerLibrary() {
  const navigate = useNavigate();
  const { colors, theme } = useTheme();
  const players = usePlayerStore(s => s.players);
  const addPlayer = usePlayerStore(s => s.addPlayer);
  const updatePlayer = usePlayerStore(s => s.updatePlayer);
  const deletePlayer = usePlayerStore(s => s.deletePlayer);
  const initializeDefaults = usePlayerStore(s => s.initializeDefaults);
  const defaultModelId = useSettingsStore(s => s.defaultModel);
  const hiddenModelIds = useSettingsStore(s => s.hiddenModelIds);
  const customModelIds = useSettingsStore(s => s.freeModelIds);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🎭');
  const [color, setColor] = useState('#FF6B6B');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelId, setModelId] = useState(defaultModelId);

  const modelOptions = React.useMemo(() => {
    const base = DEFAULT_MODELS.filter(m => !hiddenModelIds.includes(m.id));
    const custom = (customModelIds ?? [])
      .map(id => id.trim())
      .filter(Boolean)
      .filter(id => !hiddenModelIds.includes(id))
      .filter(id => !base.some(m => m.id === id))
      .map(id => ({ id, name: id, provider: 'Custom', free: true as const }));
    return [...base, ...custom];
  }, [customModelIds, hiddenModelIds]);

  const modelNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const m of modelOptions) map.set(m.id, m.name);
    return map;
  }, [modelOptions]);

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

  const openEditor = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setName(player.name);
      setAvatar(player.avatar);
      setColor(player.color);
      setSystemPrompt(player.systemPrompt);
      setModelId(player.modelId);
    } else {
      setEditingPlayer(null);
      setName('');
      setAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
      setColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
      setSystemPrompt('');
      setModelId(defaultModelId);
    }
    setIsEditing(true);
  };

  const savePlayer = () => {
    if (!name.trim()) return;

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, {
        name: name.trim(),
        avatar,
        color,
        systemPrompt: systemPrompt.trim(),
        modelId,
      });
    } else {
      addPlayer({
        name: name.trim(),
        avatar,
        color,
        systemPrompt: systemPrompt.trim(),
        modelId,
        ttsVoiceId: null,
        ttsEnabled: false,
        elo: 1000,
      });
    }
    setIsEditing(false);
  };

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

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="ghost" onClick={() => navigate('/')}>← Назад</Button>
          <h1 style={{ margin: 0, fontSize: '28px', color: colors.textPrimary }}>
            🎭 Библиотека характеров
          </h1>
        </div>
        <Button onClick={() => openEditor()}>+ Новый характер</Button>
      </div>

      {/* Player grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        <AnimatePresence>
          {players.map(player => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                padding: '20px',
                borderRadius: theme.borderRadius,
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                cursor: 'pointer',
              }}
              onClick={() => openEditor(player)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <PlayerAvatar
                  name={player.name}
                  avatar={player.avatar}
                  color={player.color}
                  isAlive={true}
                  isSpeaking={false}
                  size={50}
                  showName={false}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px', fontWeight: 700,
                    color: player.color, marginBottom: '4px',
                  }}>
                    {player.name}
                  </div>
                  <Badge>
                    {modelNameById.get(player.modelId) || player.modelId}
                  </Badge>
                  <div style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: colors.textMuted,
                  }}>
                    ELO: {player.elo}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: colors.textMuted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {player.systemPrompt || 'Без описания'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={editingPlayer ? 'Редактировать характер' : 'Новый характер'}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Character label */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
              Название характера (ярлык)
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: «Шерлок», «Дипломат», «Параноик»"
              style={inputStyle}
            />
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '6px' }}>
              В игре реальные имена игроков назначаются случайно из пула имён (без повторов).
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
              Аватар
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DEFAULT_AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  style={{
                    width: 40, height: 40,
                    borderRadius: '8px',
                    border: a === avatar ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                    background: a === avatar ? `${colors.accent}22` : colors.bgInput,
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
              Цвет
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {DEFAULT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    border: c === color ? `3px solid ${colors.textPrimary}` : '2px solid transparent',
                    background: c,
                    cursor: 'pointer',
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
              Промпт персонажа (характер, стиль речи)
            </label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder='Например: "Ты параноидальный детектив, подозреваешь всех..."'
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Model */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
              Модель ИИ
            </label>
            <select
              value={modelId}
              onChange={e => setModelId(e.target.value)}
              style={inputStyle}
            >
              {!modelOptions.some(m => m.id === modelId) && (
                <option value={modelId}>
                  {modelId} (unknown)
                </option>
              )}
              {modelOptions.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) 🆓
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            {editingPlayer && (
              <Button
                variant="danger"
                onClick={() => {
                  deletePlayer(editingPlayer.id);
                  setIsEditing(false);
                }}
              >
                Удалить
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button onClick={savePlayer} disabled={!name.trim()}>
              {editingPlayer ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
