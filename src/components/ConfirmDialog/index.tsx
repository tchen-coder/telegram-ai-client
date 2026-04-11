import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Trash icon */}
        {danger && (
          <div className={styles.iconWrapper}>
            <svg width="19" height="21" viewBox="0 0 19 21" fill="none">
              <path d="M1 5H18M6 5V3C6 2.44772 6.44772 2 7 2H12C12.5523 2 13 2.44772 13 3V5M15 5V18C15 18.5523 14.5523 19 14 19H5C4.44772 19 4 18.5523 4 18V5" stroke="#ff6e84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 9V15M11 9V15" stroke="#ff6e84" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        <h2 className={styles.title}>{title}</h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button
            className={styles.confirmBtn}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
