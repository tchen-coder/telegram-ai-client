import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleActivate = () => {
    setFocused(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [text]);

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div className={styles.inputWrapper}>
          <div
            className={`${styles.overlay} ${focused ? styles.overlayHidden : ''}`}
            onClick={handleActivate}
          />
          <textarea
            ref={inputRef}
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="轻声诉说你的想法..."
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          className={styles.sendBtn}
          onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
          disabled={disabled}
        >
          <svg className={styles.sendIcon} viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 16V10L8 8L0 6V0L19 8L0 16Z" fill="#41004C"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
