import styles from './ErrorState.module.css';

const errorIcon = new URL('../../assets/error-icon.svg', import.meta.url).href;

interface ErrorStateProps {
  onRetry?: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className={styles.container}>
      {/* Background glow */}
      <div className={styles.bgGlow} />
      {/* Bottom gradient */}
      <div className={styles.bottomGradient} />

      <div className={styles.content}>
        {/* Glitchy Connection Visual — Figma 237:305 */}
        <div className={styles.iconArea}>
          <img className={styles.iconImg} src={errorIcon} alt="" />
          {/* Neon glitch line 1 — pink */}
          <div className={styles.glitchLine1} />
          {/* Neon glitch line 2 — red */}
          <div className={styles.glitchLine2} />
        </div>

        {/* Title with text-shadow */}
        <h2 className={styles.title}>网络怎么消失了....</h2>

        {/* Description */}
        <p className={styles.description}>
          看来网络在午夜的帷幕中消失了，<br />
          检查下您的网络再重试吧。
        </p>

        {/* Retry button */}
        {onRetry && (
          <button className={styles.retryBtn} onClick={onRetry}>
            <span>重试</span>
          </button>
        )}
      </div>
    </div>
  );
}
