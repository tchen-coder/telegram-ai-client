import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, background: '#1a0a0a', color: '#ff6b6b',
          fontFamily: 'monospace', fontSize: 13, minHeight: '100vh',
          overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}>
          <strong style={{ fontSize: 16, color: '#ff4040' }}>渲染错误 — 请将此截图发给开发者</strong>
          {'\n\n'}
          {String(this.state.error)}
          {'\n\n'}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}
