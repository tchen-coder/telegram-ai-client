import type { ChatMessage } from '../types/api';

const CACHE_KEY_PREFIX = 'chat_v1_';
const MAX_MESSAGES = 50; // keep latest 50 messages per role

function key(userId: string, roleId: string) {
  return CACHE_KEY_PREFIX + userId + '_' + roleId;
}

export function loadChatCache(userId: string, roleId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(key(userId, roleId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatCache(userId: string, roleId: string, messages: ChatMessage[]) {
  try {
    // Only keep the latest MAX_MESSAGES, drop typing indicator
    const toSave = messages
      .filter((m) => m.id > 0)
      .slice(-MAX_MESSAGES);
    localStorage.setItem(key(userId, roleId), JSON.stringify(toSave));
  } catch {}
}

export function appendChatCache(userId: string, roleId: string, msgs: ChatMessage[]) {
  const existing = loadChatCache(userId, roleId);
  const existingIds = new Set(existing.map((m) => m.id));
  const merged = [...existing, ...msgs.filter((m) => m.id > 0 && !existingIds.has(m.id))];
  saveChatCache(userId, roleId, merged);
}
