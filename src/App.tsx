import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import type { CSSProperties } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from './store/appStore';
import { useTelegram } from './hooks/useTelegram';
import { recordPathTransition, setPrePageOverride, skipNextRouteTransition, trackEvent } from './utils/track';
import BottomNavBar from './components/BottomNavBar';
import ErrorBoundary from './components/ErrorBoundary';
import ExplorePage from './pages/ExplorePage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';

// 仅在小程序冷启动时执行一次：解析 push URL 上的 hook_id / role_id，上报 clickHook。
// 用 module 级 flag 防止 StrictMode 双挂载重复上报。
let hookReported = false;
function reportClickHookOnce() {
  if (hookReported) return;
  hookReported = true;
  const params = new URLSearchParams(window.location.search);
  const roleId = params.get('role_id');
  const hookId = params.get('hook_id');
  // 带 role_id：next_page = chat，hook_id 字段值取 role_id
  if (roleId) {
    trackEvent('clickHook', { hook_id: roleId, next_page: 'chat' });
    return;
  }
  // 带 hook_id：next_page = explore
  if (hookId) {
    trackEvent('clickHook', { hook_id: hookId, next_page: 'explore' });
  }
}

const hiddenStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  zIndex: -1,
};
const visibleStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

/**
 * 根据 Telegram start_param 跳转到对应页面。
 * start_param 格式: "chat_3" → /chat/3, "role_3" → /role/3
 */
function useStartParamRedirect(startParam: string | null) {
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const handled = useRef(false);

  useEffect(() => {
    if (!startParam || handled.current || path !== '/') return;
    handled.current = true;

    // 解析 start_param: "chat_3" → { action: "chat", id: "3" }
    const parts = startParam.split('_');
    const action = parts[0];
    const id = parts.slice(1).join('_');

    if (action === 'chat' && id) {
      // 标记此次进入聊天页来自 telegram push；
      // 同时跳过紧随其后的合成路由转换，避免 prevPageId 被 / 覆盖回 'explore'。
      setPrePageOverride('telegramPush');
      skipNextRouteTransition();
      navigate(`/chat/${id}`);
    } else if (action === 'role' && id) {
      setPrePageOverride('telegramPush');
      skipNextRouteTransition();
      navigate(`/role/${id}`);
    }
  }, [startParam, path, navigate]);
}

/**
 * 监听路由变化，把"上一页"记到全局，供页面读取作为 pre_page。
 * 用 useLayoutEffect 确保在子组件的 useEffect（如 ChatPage 上报 showChat）之前执行，
 * 否则子组件 mount 时拿到的是上上一次的 prevPageId。
 */
function useRouteTracker() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');
  useLayoutEffect(() => {
    if (lastPathRef.current && lastPathRef.current !== location.pathname) {
      recordPathTransition(lastPathRef.current);
    }
    lastPathRef.current = location.pathname;
  }, [location.pathname]);
}

function AppRoutes({ startParam }: { startParam: string | null }) {
  const location = useLocation();
  const path = location.pathname;

  useStartParamRedirect(startParam);
  useRouteTracker();

  // 解析 push URL 上的 hook_id / role_id，上报 clickHook（仅一次）
  useEffect(() => {
    reportClickHookOnce();
  }, []);

  const isChat = path.startsWith('/chat');
  const isDetail = path.startsWith('/role/');

  const showExplore = path === '/';
  const showMessages = path === '/messages';

  return (
    <>
      {/* Always-mounted tab pages — hidden but DOM preserved to keep scroll & state */}
      <div style={showExplore ? visibleStyle : hiddenStyle}>
        <ExplorePage />
      </div>
      <div style={showMessages ? visibleStyle : hiddenStyle}>
        <MessagesPage />
      </div>

      {/* Route-based pages */}
      <Routes>
        <Route path="/role/:roleId" element={<CharacterDetailPage />} />
        <Route path="/chat/:roleId" element={<ChatPage />} />
      </Routes>

      {!isChat && !isDetail && <BottomNavBar />}
    </>
  );
}

export default function App() {
  const { user, isReady, startParam } = useTelegram();
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const listenerRef = useRef<(() => void) | null>(null);

  const registerRoleUpdatedListener = useCallback((fn: () => void) => {
    listenerRef.current = fn;
  }, []);

  const notifyRoleUpdated = useCallback(() => {
    listenerRef.current?.();
  }, []);

  if (!isReady) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0e0e0e', color: '#666',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, currentRoleId, setCurrentRoleId, notifyRoleUpdated, registerRoleUpdatedListener }}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes startParam={startParam} />
        </ErrorBoundary>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
