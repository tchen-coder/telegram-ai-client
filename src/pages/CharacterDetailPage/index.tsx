import { useState, useCallback } from 'react';
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

  const imageUrl = role.role_description_image_url || role.role_image_url || role.avatar_url;
  const tags = role.relationship_label
    ? role.relationship_label.split(/[、,，/]/).map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className={styles.container}>
      {/* Scrollable content */}
      <div className={styles.scroll}>
        {/* Character Image */}
        <div className={styles.imageWrapper}>
          {imageUrl ? (
            <img
              className={styles.image}
              src={imageUrl}
              alt={role.name}
            />
          ) : (
            <div className={styles.placeholder} />
          )}
          <div className={styles.saturationOverlay} />
          {/* Gradient at top for back button visibility */}
          <div className={styles.topGradient} />
          {/* Back button */}
          <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9L9 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Name */}
          <h1 className={styles.name}>{role.name}</h1>

          {/* Tags */}
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className={i === 0 ? styles.tagSolid : styles.tagGlass}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description — fully expanded, scrollable */}
          {role.description && (
            <div className={styles.description}>
              <p>{role.description}</p>
            </div>
          )}

          {/* Relationship */}
          <div className={styles.relationship}>
            <span className={styles.relationshipLabel}>Relationship</span>
            <span className={styles.relationshipLevel}>
              {role.relationship_label} — Lv.{role.relationship}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className={styles.cta}>
        <button
          className={styles.ctaBtn}
          onClick={handleStartChat}
          disabled={selecting}
        >
          {selecting ? 'Starting...' : 'Start Chat'}
        </button>
      </div>
    </div>
  );
}
