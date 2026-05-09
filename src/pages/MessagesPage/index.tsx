import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { getMyRoles, deleteMyRole } from '../../api/client';
import { loadCache, saveCache } from '../../utils/roleCache';
import { getLocale } from '../../utils/locale';
import type { Role } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import styles from './MessagesPage.module.css';

function formatTime(ts: number | undefined): string {
  const t = getLocale();
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return t.messagesYesterday;
  if (d.getFullYear() === now.getFullYear()) return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function MessagesPage() {
  const t = getLocale();
  const { user, registerRoleUpdatedListener } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isVisible = location.pathname === '/messages';
  const [roles, setRoles] = useState<Role[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; role: Role } | null>(null);

  // Re-read cache whenever ChatPage notifies a role update
  useEffect(() => {
    if (!user) return;
    registerRoleUpdatedListener(() => {
      const cached = loadCache(user.userId);
      if (cached.length > 0) setRoles(cached);
    });
  }, [user, registerRoleUpdatedListener]);

  // Step 1: Read from local cache on mount — instant render, no loading flash
  useEffect(() => {
    if (!user) return;
    const cached = loadCache(user.userId);
    if (cached.length > 0) {
      setRoles(cached);
    }
  }, [user]);

  // Step 2: Background sync — fetch API, diff, merge
  const syncRoles = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getMyRoles({ user_id: user.userId });
      const serverRoles: Role[] = data.roles;

      setRoles((prev) => {
        if (prev.length === 0) {
          // No local cache — first load from API
          saveCache(user.userId, serverRoles);
          return serverRoles;
        }

        const localMap = new Map(prev.map((r) => [r.id, r]));
        let changed = false;
        const merged: Role[] = [];

        for (const sr of serverRoles) {
          const local = localMap.get(sr.id);
          if (!local) {
            // New role from server
            changed = true;
            merged.push(sr);
          } else if (
            sr.latest_reply !== local.latest_reply ||
            sr.latest_reply_time !== local.latest_reply_time ||
            sr.unread_count !== local.unread_count
          ) {
            // Data changed — use server version
            changed = true;
            merged.push(sr);
          } else {
            // No change — keep local (identical reference, React skips re-render)
            merged.push(local);
          }
        }

        // Check for deletions
        const serverIds = new Set(serverRoles.map((r) => r.id));
        const hasDeletions = prev.some((r) => !serverIds.has(r.id));
        if (hasDeletions) changed = true;

        if (changed) {
          const result = merged.filter((r) => serverIds.has(r.id));
          saveCache(user.userId, result);
          return result;
        }
        return prev; // Nothing changed — same reference, no re-render
      });
    } catch (err) {
      console.error('Failed to sync my roles:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!isVisible) return;
    syncRoles();
  }, [isVisible, syncRoles]);

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    try {
      await deleteMyRole({ user_id: user.userId, role_id: String(deleteTarget.role_id) });
      setRoles((prev) => {
        const filtered = prev.filter((r) => r.id !== deleteTarget.id);
        saveCache(user.userId, filtered);
        return filtered;
      });
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
    navigate(`/chat/${role.role_id}`, { state: { role } });
  };

  return (
    <div className="page-container" onClick={() => { if (swipedId !== null) setSwipedId(null); if (contextMenu) setContextMenu(null); }}>

      <div className={styles.main}>
        {roles.length === 0 ? (
          <EmptyState onExplore={() => navigate('/')} />
        ) : (
          <div className={styles.list}>
            {roles.map((role) => (
              <ChatItem
                key={role.id}
                role={role}
                isActive={role.unread_count != null && role.unread_count > 0}
                isSwiped={swipedId === role.id}
                timestamp={role.latest_reply_time}
                onSwipe={() => setSwipedId(swipedId === role.id ? null : role.id)}
                onChat={() => {
                  if (swipedId !== null && swipedId !== role.id) {
                    setSwipedId(null);
                    return;
                  }
                  handleChat(role);
                }}
                onDelete={() => setDeleteTarget(role)}
                onContextMenu={(x, y) => setContextMenu({ x, y, role })}
              />
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.contextMenuItem}
            onClick={() => { setDeleteTarget(contextMenu.role); setContextMenu(null); }}
          >
            <svg width="14" height="15" viewBox="0 0 16 18" fill="none">
              <path d="M1 4H15M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M13 4V16C13 16.5523 12.5523 17 12 17H4C3.44772 17 3 16.5523 3 16V4" stroke="#f183ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t.messagesDeleteMenuLabel}</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t.messagesDeleteConfirmTitle}
        message={t.messagesDeleteConfirmText(deleteTarget?.name ?? '')}
        confirmText={deleting ? t.messagesDeleteConfirming : t.messagesDeleteConfirm}
        cancelText={t.messagesDeleteCancel}
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
  const t = getLocale();
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
        <h2 className={styles.emptyHeading}>{t.messagesEmptyHeading}</h2>
        <p className={styles.emptySubtext}>{t.messagesEmptySubtext}</p>
      </div>
      <button className={styles.emptyCta} onClick={onExplore}>
        <span>{t.messagesCtaExplore}</span>
        <img src={ctaArrow} alt="" className={styles.emptyCtaArrow} />
      </button>
    </div>
  );
}

/* Chat item */
interface ChatItemProps {
  role: Role;
  isActive: boolean;
  isSwiped: boolean;
  timestamp?: number;
  onSwipe: () => void;
  onChat: () => void;
  onDelete: () => void;
  onContextMenu: (x: number, y: number) => void;
}

function ChatItem({ role, isActive, isSwiped, timestamp, onSwipe, onChat, onDelete, onContextMenu }: ChatItemProps) {
  const t = getLocale();
  const startX = useRef(0);
  const startY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const directionLocked = useRef<'horizontal' | 'vertical' | null>(null);
  const SWIPE_OFFSET = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    directionLocked.current = null;
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !contentRef.current) return;
    const diffX = startX.current - e.touches[0].clientX;
    const diffY = Math.abs(startY.current - e.touches[0].clientY);

    if (!directionLocked.current && (Math.abs(diffX) > 8 || diffY > 8)) {
      if (Math.abs(diffX) > diffY) {
        directionLocked.current = 'horizontal';
      } else {
        directionLocked.current = 'vertical';
        isDragging.current = false;
        return;
      }
    }

    if (directionLocked.current !== 'horizontal') return;

    const offset = Math.max(0, Math.min(diffX, SWIPE_OFFSET));
    contentRef.current.style.transform = `translateX(-${offset}px)`;
    contentRef.current.style.background = '#20201f';
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !contentRef.current) {
      isDragging.current = false;
      directionLocked.current = null;
      return;
    }
    isDragging.current = false;
    directionLocked.current = null;
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
    <div
      className={`${styles.chatItemWrapper} ${isSwiped ? styles.swiped : ''}`}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY); }}
    >
      {/* 红色删除层，始终在底部 */}
      <div className={styles.deleteBg}>
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <path d="M1 4H15M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M13 4V16C13 16.5523 12.5523 17 12 17H4C3.44772 17 3 16.5523 3 16V4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.deleteText}>{t.messagesDeleteLabel}</span>
        </button>
      </div>

      {/* 内容层，position:absolute 铺满，左滑时露出底部红色 */}
      <div
        ref={contentRef}
        className={`${styles.chatContent} ${isSwiped ? styles.swiped : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onChat()}
      >
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

        <div className={styles.info}>
          <div className={styles.topRow}>
            <span className={styles.name}>{Array.from(role.name).length > 16 ? Array.from(role.name).slice(0, 16).join('') + '...' : role.name}</span>
            <span className={styles.time}>
              {formatTime(timestamp)}
            </span>
          </div>
          <p className={styles.preview}>
            {role.latest_reply || role.description || t.messagesPreviewFallback}
          </p>
        </div>
      </div>
    </div>
  );
}
