import { useEffect, useState, useCallback } from 'react';
import type { AppUser } from '../store/appStore';

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
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

export function useTelegram() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    const u = getTelegramUser();
    if (u) {
      setUser(u);
    } else {
      // Fallback for local development
      setUser({ userId: 'dev_user_001', userName: 'DevUser' });
    }
    setIsReady(true);
  }, []);

  const webApp = window.Telegram?.WebApp ?? null;

  return { user, isReady, webApp };
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
