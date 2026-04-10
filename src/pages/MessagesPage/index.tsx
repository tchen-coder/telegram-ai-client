import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getMyRoles, deleteMyRole } from '../../api/client';
import type { Role } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import styles from './MessagesPage.module.css';

export default function MessagesPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [swipedId, setSwipedId] = useState<number | null>(null);

  const fetchMyRoles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyRoles({ user_id: user.userId });
      setRoles(data.roles);
    } catch (err) {
      console.error('Failed to fetch my roles:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRoles();
  }, [fetchMyRoles]);

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    try {
      await deleteMyRole({ user_id: user.userId, role_id: deleteTarget.id });
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSwipedId(null);
    } catch (err) {
      console.error('Failed to delete role:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleChat = (role: Role) => {
    if (swipedId === role.id) {
      setSwipedId(null);
      return;
    }
    navigate(`/chat/${role.id}`, { state: { role } });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
        <div className={styles.headerDivider} />
      </header>

      <div className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : roles.length === 0 ? (
          <EmptyState onExplore={() => navigate('/')} />
        ) : (
          <div className={styles.list}>
            {roles.map((role, index) => (
              <ChatItem
                key={role.id}
                role={role}
                isActive={index === 0}
                isSwiped={swipedId === role.id}
                onSwipe={() => setSwipedId(swipedId === role.id ? null : role.id)}
                onChat={() => handleChat(role)}
                onDelete={() => setDeleteTarget(role)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Chat?"
        message={`Are you sure you want to delete your conversation with ${deleteTarget?.name}?`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setSwipedId(null); }}
      />
    </div>
  );
}

/* Empty state */
function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyVisual}>
        <div className={styles.emptyGlow} />
        <div className={styles.emptyCircle}>
          <div className={styles.emptyCircleImg} />
          <div className={styles.emptyCircleOverlay} />
        </div>
      </div>
      <div className={styles.emptyTextBlock}>
        <h2 className={styles.emptyHeading}>静谧的午夜...</h2>
        <p className={styles.emptySubtext}>
          这里还没有灵魂的回响。去寻找属于你的伴侣，开启一段不为人知的对话。
        </p>
      </div>
      <button className={styles.emptyCta} onClick={onExplore}>
        <span>去探索角色</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/* Chat item — Figma 239:413 (normal) and 239:424 (swiped) */
interface ChatItemProps {
  role: Role;
  isActive: boolean;
  isSwiped: boolean;
  onSwipe: () => void;
  onChat: () => void;
  onDelete: () => void;
}

function ChatItem({ role, isActive, isSwiped, onSwipe, onChat, onDelete }: ChatItemProps) {
  const startX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const SWIPE_OFFSET = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !contentRef.current) return;
    const diff = startX.current - e.touches[0].clientX;
    const offset = Math.max(0, Math.min(diff, SWIPE_OFFSET));
    contentRef.current.style.transform = `translateX(-${offset}px)`;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !contentRef.current) return;
    isDragging.current = false;
    contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';

    const currentTransform = contentRef.current.style.transform;
    const match = currentTransform.match(/translateX\(-([\d.]+)px\)/);
    const currentOffset = match ? parseFloat(match[1]) : 0;

    if (currentOffset > SWIPE_OFFSET / 2) {
      contentRef.current.style.transform = `translateX(-${SWIPE_OFFSET}px)`;
      onSwipe();
    } else {
      contentRef.current.style.transform = 'translateX(0)';
      if (isSwiped) onSwipe();
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
      contentRef.current.style.transform = isSwiped ? `translateX(-${SWIPE_OFFSET}px)` : 'translateX(0)';
    }
  }, [isSwiped]);

  const avatarBorder = isActive
    ? '1px solid rgba(241, 131, 255, 0.2)'
    : '1px solid rgba(72, 72, 71, 0.1)';

  return (
    <div className={styles.chatItemWrapper}>
      {/* Delete background (visible when swiped) */}
      <div className={styles.deleteBg}>
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <path d="M1 4H15M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M13 4V16C13 16.5523 12.5523 17 12 17H4C3.44772 17 3 16.5523 3 16V4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.deleteText}>删除</span>
        </button>
      </div>

      {/* Swipeable content */}
      <div
        ref={contentRef}
        className={`${styles.chatContent} ${isSwiped ? styles.swiped : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onChat()}
      >
        {/* Avatar — 4:5 ratio, 64x80 */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBorder} style={{ border: avatarBorder }}>
            {role.avatar_url ? (
              <img className={styles.avatar} src={role.avatar_url} alt={role.name} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
          </div>
          {isActive && <span className={styles.onlineDot} />}
        </div>

        {/* Text info */}
        <div className={styles.info}>
          <div className={styles.topRow}>
            <span className={styles.name}>{role.name}</span>
            <span className={styles.time}>
              {role.latest_reply ? '刚刚' : ''}
            </span>
          </div>
          <p className={styles.preview}>
            {role.latest_reply || role.description || '开始一段对话...'}
          </p>
        </div>
      </div>
    </div>
  );
}
