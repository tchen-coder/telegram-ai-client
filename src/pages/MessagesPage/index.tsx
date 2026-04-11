import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getMyRoles, deleteMyRole } from '../../api/client';
import type { Role } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import TopAppBar from '../../components/TopAppBar';
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
    <div className="page-container" onClick={() => { if (swipedId !== null) setSwipedId(null); }}>
      {/* Header */}
      <TopAppBar title="秘语" />

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
                onChat={() => {
                  if (swipedId !== null && swipedId !== role.id) {
                    setSwipedId(null);
                    return;
                  }
                  handleChat(role);
                }}
                onDelete={() => setDeleteTarget(role)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除对话？"
        message={`确定要删除与 ${deleteTarget?.name} 的对话吗？此操作无法撤销。`}
        confirmText={deleting ? '删除中...' : '删除'}
        cancelText="取消"
        danger
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setSwipedId(null); }}
      />
    </div>
  );
}

/* Empty state — Figma 248:509 */
const emptyAvatar = new URL('../../assets/empty-avatar.webp', import.meta.url).href;
const ctaArrow = new URL('../../assets/cta-arrow.svg', import.meta.url).href;

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyVisual}>
        <div className={styles.emptyGlow} />
        <div className={styles.emptyCircle}>
          <div className={styles.emptyCircleBorder}>
            <img className={styles.emptyCircleImg} src={emptyAvatar} alt="" />
            <div className={styles.emptyCircleSaturation} />
            <div className={styles.emptyCircleOverlay} />
            <div className={styles.emptyCircleNeon} />
          </div>
        </div>
        <div className={styles.emptyAccentCircle} />
        <div className={styles.emptyAccentGlow} />
      </div>
      <div className={styles.emptyTextBlock}>
        <h2 className={styles.emptyHeading}>静谧的午夜...</h2>
        <p className={styles.emptySubtext}>
          这里还没有灵魂的回响。去寻找属于你的伴侣，开启一段不为人知的对话。
        </p>
      </div>
      <button className={styles.emptyCta} onClick={onExplore}>
        <span>去探索角色</span>
        <img src={ctaArrow} alt="" className={styles.emptyCtaArrow} />
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

  const setBackground = (bg: string) => {
    if (contentRef.current) contentRef.current.style.background = bg;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
      contentRef.current.style.background = '#20201f';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !contentRef.current) return;
    const diff = startX.current - e.touches[0].clientX;
    const offset = Math.max(0, Math.min(diff, SWIPE_OFFSET));
    contentRef.current.style.transform = `translateX(-${offset}px)`;
    // Keep #20201f while swiping
    contentRef.current.style.background = '#20201f';
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !contentRef.current) return;
    isDragging.current = false;
    contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), background 0.2s';

    const currentTransform = contentRef.current.style.transform;
    const match = currentTransform.match(/translateX\(-([\d.]+)px\)/);
    const currentOffset = match ? parseFloat(match[1]) : 0;

    if (currentOffset > SWIPE_OFFSET / 2) {
      contentRef.current.style.transform = `translateX(-${SWIPE_OFFSET}px)`;
      contentRef.current.style.background = '#20201f';
      onSwipe();
    } else {
      contentRef.current.style.transform = 'translateX(0)';
      contentRef.current.style.background = '#101010';
      if (isSwiped) onSwipe();
    }
  };

  // Sync transform & background from parent isSwiped prop
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), background 0.2s';
      contentRef.current.style.transform = isSwiped ? `translateX(-${SWIPE_OFFSET}px)` : 'translateX(0)';
      contentRef.current.style.background = isSwiped ? '#20201f' : '#101010';
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
