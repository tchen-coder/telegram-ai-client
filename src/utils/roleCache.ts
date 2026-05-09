import type { Role } from '../types/api';

const CACHE_KEY_PREFIX = 'myroles_v3_';

export function getCacheKey(userId: string) {
  return CACHE_KEY_PREFIX + userId;
}

export function loadCache(userId: string): Role[] {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCache(userId: string, roles: Role[]) {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(roles));
  } catch {}
}
