import { useEffect, useState, useCallback } from 'react';
import type { AppUser } from '../store/appStore';
import { healthCheck, upsertUser } from '../api/client';

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  MainButton: { show: () => void; hide: () => void; setText: (t: string) => void };
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  themeParams: Record<string, string>;
  colorScheme: 'dark' | 'light';
  platform: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

function getTelegramUser(): AppUser | null {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    return {
      userId: String(u.id),
      userName: u.first_name || u.username || 'User',
    };
  }
  return null;
}

/** Detect if we are inside a Telegram Mini App context */
function isInTelegram(): boolean {
  // Telegram injects WebApp object with initData when opened as Mini App
  const tg = window.Telegram?.WebApp;
  return !!(tg && tg.initDataUnsafe?.user);
}

const DEV_USER: AppUser = { userId: 'dev_user_001', userName: 'DevUser' };

export function useTelegram() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    // Telegram SDK may load async — poll a few times before falling back
    let attempts = 0;
    const maxAttempts = 10; // 10 * 200ms = 2s max wait

    const tryInit = () => {
      const tg = window.Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();
        setStartParam(tg.initDataUnsafe?.start_param ?? null);
      }

      const tgUser = getTelegramUser();
      if (tgUser) {
        const u = tg?.initDataUnsafe?.user;
        const displayName = [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.username || 'User';
        healthCheck().catch(() => {});
        upsertUser({
          platform: 'telegram',
          platform_user_id: String(u?.id ?? tgUser.userId),
          platform_username: displayName,
          language_code: u?.language_code,
        }).catch(() => {});
        setUser(tgUser);
        setIsReady(true);
        return;
      }

      // SDK not ready yet, retry
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryInit, 200);
        return;
      }

      // Fallback: web browser access — use dev user (write fixed params)
      healthCheck().catch(() => {});
      upsertUser({
        platform: 'telegram',
        platform_user_id: 'dev_user_001',
        platform_username: 'DevUser',
      }).catch(() => {});
      setUser(DEV_USER);
      setIsReady(true);
    };

    tryInit();
  }, []);

  const webApp = window.Telegram?.WebApp ?? null;

  return { user, isReady, webApp, startParam };
}

export function useBackButton(onBack: () => void) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    tg.BackButton.show();
    tg.BackButton.onClick(onBack);

    return () => {
      tg.BackButton.hide();
      tg.BackButton.offClick(onBack);
    };
  }, [onBack]);
}
