import { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../store/appStore';
import { useBackButton } from '../../hooks/useTelegram';
import { selectRole } from '../../api/client';
import type { Role } from '../../types/api';
import styles from './CharacterDetailPage.module.css';

interface LocationState {
  role?: Role;
}

export default function CharacterDetailPage() {
  const { user, setCurrentRoleId } = useApp();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const role = state.role;

  const [selecting, setSelecting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atTopRef = useRef(false);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useBackButton(handleBack);

  const handleStartChat = async () => {
    if (!user || !role || selecting) return;
    setSelecting(true);
    try {
      await selectRole({
        user_id: user.userId,
        role_id: role.id,
        push_to_telegram: false,
      });
      setCurrentRoleId(role.id);
      navigate(`/chat/${role.id}`, { state: { role } });
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

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - pullStartY.current;
    if (diff > 60) {
      isPulling.current = false;
      setExpanded(false);
    }
  };

  const handleTouchEnd = () => {
    isPulling.current = false;
  };

  if (!role) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <p>Character not found</p>
          <button className={styles.backLink} onClick={() => navigate('/')}>
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const bgImage = role.role_image_url || role.avatar_url;
  const tags = role.tags || [];

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
        <span className={styles.headerTitle}>{role.name}</span>
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
        <button className={styles.viewProfileBtn} onClick={() => setExpanded(true)}>
          <span>更多档案</span>
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
        <button className={styles.collapseBtn} onClick={() => setExpanded(false)} aria-label="Collapse">
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

        {/* Name with level badge */}
        <div className={styles.nameRow}>
          <h1 className={styles.nameExpanded}>{role.name}</h1>
          <span className={styles.levelBadge}>{role.relationship}</span>
        </div>

        {/* Biography section */}
        <div className={styles.bioSection}>
          <h3 className={styles.bioLabel}>Biography</h3>

          {/* Stats grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Occupation</span>
              <span className={styles.statValue}>{role.relationship_label || 'Unknown'}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Intimacy</span>
              <div className={styles.intimacyRow}>
                <span className={styles.intimacyLevel}>
                  Level<br />{role.relationship}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min((role.relationship / 10) * 100, 100)}%` }}
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
          {selecting ? 'Starting...' : '开始聊天'}
        </button>
      </div>
    </div>
  );
}
