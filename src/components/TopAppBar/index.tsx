import styles from './TopAppBar.module.css';

interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function TopAppBar({ title, onBack, rightAction }: TopAppBarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{rightAction}</div>
    </header>
  );
}
