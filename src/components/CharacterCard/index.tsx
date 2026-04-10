import type { Role } from '../../types/api';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  role: Role;
  onClick: () => void;
}

function truncateName(name: string, max: number = 15): string {
  return name.length > max ? name.slice(0, max) + '...' : name;
}

export default function CharacterCard({ role, onClick }: CharacterCardProps) {
  const imageUrl = role.role_image_url || role.avatar_url;
  const tags = role.tags || [];

  return (
    <button className={styles.card} onClick={onClick}>
      {/* Image Area — 4:5 ratio */}
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            className={styles.image}
            src={imageUrl}
            alt={role.name}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
        <div className={styles.saturationOverlay} />
        {/* Gradient overlay at bottom for tags */}
        {tags.length > 0 && (
          <div className={styles.gradientOverlay}>
            <div className={styles.tags}>
              {tags.slice(0, 3).map((tag, i) => (
                <span
                  key={tag}
                  className={i === 0 ? styles.tagSolid : styles.tagGlass}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className={styles.info}>
        <h3 className={styles.name}>{truncateName(role.name)}</h3>
        {role.description && (
          <p className={styles.quote}>
            &ldquo;{role.description}&rdquo;
          </p>
        )}
      </div>
    </button>
  );
}
