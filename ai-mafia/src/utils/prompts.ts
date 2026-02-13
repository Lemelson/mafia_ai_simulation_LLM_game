import type { PlayerInGame, GameLogEntry, GameRules } from '../types/game';
import { ROLE_NAMES } from '../types/game';

export function buildSystemPrompt(
  player: PlayerInGame,
  rules: GameRules,
  template?: string,
): string {
  const fallback = [
    '{character_prompt}',
    '',
    '{rules_text}',
    '',
    'Тебя зовут: {name}.',
    'Твоя роль: {role}.',
    'Твои союзники (мафия): {mafia_allies}',
    'Результаты твоих проверок:',
    '{investigation_results}',
    'Ты лечил: {heal_history}',
  ].join('\n');

  const tpl = (template && template.trim().length > 0) ? template : fallback;

  const mafiaAllies = player.role === 'mafia' && player.privateKnowledge.allies?.length
    ? player.privateKnowledge.allies.join(', ')
    : '';

  const investigationResults = player.role === 'detective' && player.privateKnowledge.investigationResults?.length
    ? player.privateKnowledge.investigationResults
      .map(r => `- Ночь ${r.night}: ${r.target} — ${r.result === 'mafia' ? 'МАФИЯ' : 'невиновен'}`)
      .join('\n')
    : '';

  const healHistory = player.role === 'doctor' && player.privateKnowledge.healHistory?.length
    ? player.privateKnowledge.healHistory.join(', ')
    : '';

  // Simple placeholder substitution.
  let prompt = tpl;
  prompt = prompt.replaceAll('{character_prompt}', player.systemPrompt || '');
  prompt = prompt.replaceAll('{rules_text}', rules.rulesText || '');
  prompt = prompt.replaceAll('{name}', player.name);
  prompt = prompt.replaceAll('{role}', ROLE_NAMES[player.role]);
  prompt = prompt.replaceAll('{mafia_allies}', mafiaAllies);
  prompt = prompt.replaceAll('{investigation_results}', investigationResults);
  prompt = prompt.replaceAll('{heal_history}', healHistory);

  // Cleanup: avoid huge vertical whitespace when optional blocks are empty.
  prompt = prompt
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

  return prompt;
}

export function buildDayDiscussionPrompt(
  _player: PlayerInGame,
  dayNumber: number,
  alivePlayers: PlayerInGame[],
  deadPlayers: { name: string; role: string; day: number; cause: string }[],
  todayLog: GameLogEntry[],
  round: number,
): string {
  let msg = `Сейчас идёт день ${dayNumber}. Раунд обсуждения ${round}.\n`;
  msg += `Живые игроки: ${alivePlayers.map(p => p.name).join(', ')}.\n`;

  if (deadPlayers.length > 0) {
    msg += `Убитые/казнённые ранее:\n`;
    for (const d of deadPlayers) {
      msg += `- ${d.name} (${d.role}) — ${d.cause} (день ${d.day})\n`;
    }
  }

  const speechLog = todayLog.filter(e => e.type === 'speech' || e.type === 'system');
  if (speechLog.length > 0) {
    msg += `\nЛог обсуждения на сегодня:\n`;
    for (const entry of speechLog) {
      if (entry.type === 'system') {
        msg += `[Ведущий]: ${entry.content}\n`;
      } else {
        msg += `${entry.playerName}: «${entry.content}»\n`;
      }
    }
  }

  msg += `\nТвоя очередь высказаться. Говори кратко (2–4 предложения).`;
  msg += `\nТы можешь: обвинять, защищаться, делиться подозрениями, блефовать.`;
  msg += `\nПомни свою роль и действуй в интересах своей стороны.`;
  msg += `\nОтветь ТОЛЬКО своей репликой от первого лица, без пояснений.`;

  return msg;
}

export function buildVotingPrompt(
  player: PlayerInGame,
  alivePlayers: PlayerInGame[],
  todayLog: GameLogEntry[],
): string {
  const others = alivePlayers.filter(p => p.playerId !== player.playerId);
  let msg = `Голосование. На основе обсуждения, за кого ты голосуешь?\n`;
  msg += `Живые игроки (кроме тебя): ${others.map(p => p.name).join(', ')}\n\n`;

  const speechLog = todayLog.filter(e => e.type === 'speech');
  if (speechLog.length > 0) {
    msg += `Краткий лог обсуждения:\n`;
    for (const entry of speechLog) {
      msg += `${entry.playerName}: «${entry.content}»\n`;
    }
  }

  msg += `\nОтветь строго в формате JSON: {"vote": "имя_игрока"} или {"vote": "skip"}\n`;
  msg += `Без дополнительных пояснений, только JSON.`;

  return msg;
}

export function buildMafiaNightPrompt(
  _player: PlayerInGame,
  alivePlayers: PlayerInGame[],
  mafiaChat: GameLogEntry[],
): string {
  const targets = alivePlayers.filter(p => p.role !== 'mafia');

  let msg = `Наступила ночь. Ты — мафия.\n`;

  if (mafiaChat.length > 0) {
    msg += `Обсуждение мафии:\n`;
    for (const entry of mafiaChat) {
      msg += `${entry.playerName}: «${entry.content}»\n`;
    }
    msg += `\nТеперь выбери жертву. `;
  } else {
    msg += `Обсуди с союзниками, кого убить сегодня ночью. Скажи кратко (1-2 предложения), кого предлагаешь убить и почему.\n`;
    msg += `Потенциальные жертвы: ${targets.map(p => p.name).join(', ')}\n`;
    return msg;
  }

  msg += `Ответь строго в формате JSON: {"target": "имя_жертвы"}\n`;
  msg += `Возможные жертвы: ${targets.map(p => p.name).join(', ')}\n`;
  msg += `Без дополнительных пояснений, только JSON.`;

  return msg;
}

export function buildMafiaChatPrompt(
  player: PlayerInGame,
  alivePlayers: PlayerInGame[],
  previousMessages: GameLogEntry[],
): string {
  const targets = alivePlayers.filter(p => p.role !== 'mafia');

  let msg = `Наступила ночь. Ты — мафия. Обсуди с союзниками, кого убить.\n`;
  msg += `Твои союзники: ${player.privateKnowledge.allies?.join(', ') || 'нет'}.\n`;
  msg += `Живые не-мафиози: ${targets.map(p => p.name).join(', ')}.\n`;

  if (previousMessages.length > 0) {
    msg += `\nОбсуждение:\n`;
    for (const entry of previousMessages) {
      msg += `${entry.playerName}: «${entry.content}»\n`;
    }
  }

  msg += `\nСкажи кратко (1-2 предложения), кого предлагаешь и почему. Только реплика, без пояснений.`;

  return msg;
}

export function buildDetectivePrompt(
  player: PlayerInGame,
  alivePlayers: PlayerInGame[],
): string {
  const others = alivePlayers.filter(p => p.playerId !== player.playerId);

  let msg = `Наступила ночь. Ты — Комиссар. Выбери игрока для проверки.\n`;
  msg += `Живые игроки (кроме тебя): ${others.map(p => p.name).join(', ')}\n`;

  if (player.privateKnowledge.investigationResults?.length) {
    msg += `\nТвои предыдущие проверки:\n`;
    for (const r of player.privateKnowledge.investigationResults) {
      msg += `- ${r.target}: ${r.result === 'mafia' ? 'МАФИЯ' : 'не мафия'}\n`;
    }
  }

  msg += `\nОтветь строго в формате JSON: {"investigate": "имя_игрока"}\n`;
  msg += `Без дополнительных пояснений, только JSON.`;

  return msg;
}

export function buildDoctorPrompt(
  player: PlayerInGame,
  alivePlayers: PlayerInGame[],
): string {
  const others = alivePlayers.filter(p => p.playerId !== player.playerId);
  const canHealSelf = (player.privateKnowledge.selfHealCount ?? 0) < 1;

  let msg = `Наступила ночь. Ты — Доктор. Выбери игрока для защиты.\n`;

  if (canHealSelf) {
    msg += `Живые игроки: ${alivePlayers.map(p => p.name).join(', ')}\n`;
    msg += `(Ты можешь защитить себя, но только 1 раз за игру)\n`;
  } else {
    msg += `Живые игроки (кроме тебя — лимит самолечения исчерпан): ${others.map(p => p.name).join(', ')}\n`;
  }

  if (player.privateKnowledge.healHistory?.length) {
    msg += `Предыдущие защиты: ${player.privateKnowledge.healHistory.join(', ')}\n`;
  }

  msg += `\nОтветь строго в формате JSON: {"protect": "имя_игрока"}\n`;
  msg += `Без дополнительных пояснений, только JSON.`;

  return msg;
}

export function buildLastWordsPrompt(playerName: string): string {
  return `Тебя казнили. Ты — ${playerName}. Скажи последнее слово (1-2 предложения). Только реплика, без пояснений.`;
}

export function buildIntroductionPrompt(player: PlayerInGame): string {
  return `Игра начинается! Представься кратко (1 предложение). Ты — ${player.name}. Скажи что-нибудь характерное для твоего персонажа. Не раскрывай свою роль! Только реплика от первого лица.`;
}
