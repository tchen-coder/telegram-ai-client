import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { useBackButton } from '../../hooks/useTelegram';
import { selectRole } from '../../api/client';
import { getLocale } from '../../utils/locale';
import { trackEvent } from '../../utils/track';
import type { Role } from '../../types/api';
import styles from './CharacterDetailPage.module.css';

interface LocationState {
  role?: Role;
}

export default function CharacterDetailPage() {
  const t = getLocale();
  const { user, setCurrentRoleId } = useApp();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const [role, setRole] = useState<Role | null>(state.role || null);

  const [selecting, setSelecting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atTopRef = useRef(false);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  // Fetch fresh role data to get updated rv value
  useEffect(() => {
    if (!user || !roleId) return;
    selectRole({ user_id: user.userId, role_id: roleId, push_to_telegram: false })
      .then((data) => setRole(data.role))
      .catch(() => {});
  }, [user?.userId, roleId]);

  // 埋点：详情页曝光（一次） & 记录进入时间用于 clickBackInfoDetail dwelltime
  const reportedShowRef = useRef(false);
  const enterTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!roleId || reportedShowRef.current) return;
    trackEvent('showInfoPage', { role_id: Number(roleId) });
    reportedShowRef.current = true;
    enterTimeRef.current = Date.now();
  }, [roleId]);

  // clickChatInfoPage 的 waittime: CharacterDetailPage 进 ChatPage 会 unmount，
  // 所以把点击时间存 sessionStorage，回到详情页 mount 时算差值上报。
  useEffect(() => {
    if (!roleId) return;
    const key = `chat_click_ts_${roleId}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const ts = Number(raw);
      if (ts > 0) {
        trackEvent('clickChatInfoPage', {
          role_id: Number(roleId),
          waittime: Date.now() - ts,
        });
      }
      sessionStorage.removeItem(key);
    }
  }, [roleId]);

  const handleBack = useCallback(() => {
    if (roleId) {
      trackEvent('clickBackInfoDetail', {
        role_id: Number(roleId),
        dwelltime: enterTimeRef.current ? Date.now() - enterTimeRef.current : 0,
      });
    }
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (idx === 0 || idx == null) {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  }, [navigate, roleId]);

  useBackButton(handleBack);

  const handleStartChat = async () => {
    if (!user || !role || selecting) return;
    setSelecting(true);
    // 记录点击时间，回到详情页时上报 clickChatInfoPage 的 waittime
    sessionStorage.setItem(`chat_click_ts_${role.role_id}`, String(Date.now()));
    try {
      await selectRole({
        user_id: user.userId,
        role_id: String(role.role_id),
        push_to_telegram: false,
      });
      setCurrentRoleId(role.id);
      navigate(`/chat/${role.role_id}`, { state: { role } });
    } catch (err) {
      console.error('Failed to select role:', err);
    } finally {
      setSelecting(false);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    atTopRef.current = scrollRef.current.scrollTop <= 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (atTopRef.current) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleExpand = () => {
    trackEvent('clickInfoDetail', { role_id: Number(roleId), load_result: 1 });
    setExpanded(true);
  };

  const handleCollapse = () => {
    trackEvent('foldInfoDetail', { role_id: Number(roleId) });
    setExpanded(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - pullStartY.current;
    if (diff > 60) {
      isPulling.current = false;
      handleCollapse();
    }
  };

  const handleTouchEnd = () => {
    isPulling.current = false;
  };

  if (!role) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <p>{t.roleLoading}</p>
        </div>
      </div>
    );
  }

  const bgImage = role.role_image_url || role.avatar_url;
  const tags = role.tags || [];
  const chars = Array.from(role.name);
  const displayName = chars.length > 16 ? chars.slice(0, 16).join('') + '...' : role.name;

  return (
    <div className={styles.container}>
      {/* Full-screen background image */}
      <div className={styles.bgWrapper}>
        {bgImage ? (
          <img className={styles.bgImage} src={bgImage} alt="" />
        ) : (
          <div className={styles.bgPlaceholder} />
        )}
        <div className={styles.bgOverlay} />
      </div>

      {/* Fixed header bar */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825V9" fill="#C084FC"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>{displayName}</span>
      </header>

      {/* Default view: name + tags + VIEW PROFILE button */}
      <div className={`${styles.defaultBottom} ${expanded ? styles.hidden : ''}`}>
        <h1 className={styles.nameDefault}>{role.name}</h1>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>{tag.toUpperCase()}</span>
            ))}
          </div>
        )}
        <button className={styles.viewProfileBtn} onClick={handleExpand}>
          <span>{t.roleViewProfile}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 6.5L6 1.5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Expanded glass card */}
      <div
        className={`${styles.glassCard} ${expanded ? styles.expanded : ''}`}
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Collapse chevron — Figma 205:1086 */}
        <button className={styles.collapseBtn} onClick={handleCollapse} aria-label="Collapse">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Tags row */}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>{tag.toUpperCase()}</span>
            ))}
          </div>
        )}

        {/* Name with age badge */}
        <div className={styles.nameRow}>
          <h1 className={styles.nameExpanded}>{role.name}</h1>
          <span className={styles.levelBadge}>{role.age || 18}</span>
        </div>

        {/* Biography section */}
        <div className={styles.bioSection}>
          <h3 className={styles.bioLabel}>{t.roleBio}</h3>

          {/* Stats grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>{t.roleJob}</span>
              <span className={styles.statValue}>{role.jobs?.[0] || t.roleJobUnknown}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>{t.roleIntimacy}</span>
              <div className={styles.intimacyRow}>
                <span className={styles.intimacyLevel}>
                  {role.relationship_label || '朋友'}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(role.rv || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {role.description && (
            <p className={styles.description}>{role.description}</p>
          )}
        </div>
      </div>

      {/* Fixed floating CTA */}
      <div className={styles.ctaWrapper}>
        <button
          className={styles.ctaBtn}
          onClick={handleStartChat}
          disabled={selecting}
        >
          {selecting ? t.roleStartChatWait : t.roleStartChat}
        </button>
      </div>
    </div>
  );
}
