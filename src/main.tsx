import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Catch JS errors that bypass React's ErrorBoundary — display as overlay WITHOUT destroying the React DOM
const showFatalError = (msg: string) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#cc0000;color:#fff;font:bold 15px/1.5 monospace;padding:24px;overflow:auto;white-space:pre-wrap;word-break:break-all;';
  el.textContent = '【全局错误 — 请截图发给开发者】\n\n' + msg;
  document.body.appendChild(el);
};
window.addEventListener('error', (e) => { if (e.error) showFatalError(e.message + '\n' + (e.error?.stack ?? '')); });
window.addEventListener('unhandledrejection', (e) => showFatalError(String(e.reason?.stack ?? e.reason)));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
