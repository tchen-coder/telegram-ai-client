import type { PageId } from '../constants/pages';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  console.log('[track]', eventName, params, 'gtag=', typeof window.gtag);
  window.gtag?.('event', eventName, params ?? {});
}

/* ---- 页面追踪 ---- */

// 路径 → page id 映射，后续新增页面在此添加
const PAGE_MAP: Record<string, PageId> = {
  '/': 'explore',
  '/messages': 'messages',
};

const DYNAMIC_PREFIXES: [string, PageId][] = [
  ['/role/', 'characterDetail'],
  ['/chat/', 'chat'],
];

export function pathnameToPageId(pathname: string): PageId | '' {
  const exact = PAGE_MAP[pathname];
  if (exact) return exact;
  for (const [prefix, id] of DYNAMIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return id;
  }
  return '';
}

/* ---- 全局 pre_page 追踪 ---- */

// 上一个路径的 page id；可被显式覆写为 'telegramPush' 等特殊值。
// 默认 'telegramPush'：首次进入小程序（无论冷启动 / push 直达哪个页面）
// 还没有路由切换过，此时上报的事件 pre_page 都视为来自 Telegram。
// 一旦用户在应用内发生路由切换，recordPathTransition 会覆盖为实际页面。
let prevPageId: string = 'telegramPush';

// 标记"下一次路由转换是合成的"（如 start_param 触发的 / → /chat/X 重定向），
// 此时用户并未真正在 / 停留过，所以不应把 prevPageId 覆盖为 'explore'。
let skipNextTransition = false;

/** 标记下一次路由转换为合成跳转，跳过 prevPageId 覆盖。 */
export function skipNextRouteTransition() {
  skipNextTransition = true;
}

/** 在路由变化时调用，把"当前页面"标记为下一次的 pre_page。 */
export function recordPathTransition(prevPathname: string) {
  if (skipNextTransition) {
    skipNextTransition = false;
    return;
  }
  prevPageId = pathnameToPageId(prevPathname);
}

/** 强制设置 pre_page 来源（如 push 直达）。 */
export function setPrePageOverride(value: string) {
  prevPageId = value;
}

export function getPrePageId(): string {
  return prevPageId;
}
