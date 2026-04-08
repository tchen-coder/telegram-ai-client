import type { Role } from '../../types/api';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  role: Role;
  onClick: () => void;
}

export default function CharacterCard({ role, onClick }: CharacterCardProps) {
  const imageUrl = role.role_image_url || role.avatar_url;

  // Split relationship_label into individual tags
  const tags = role.relationship_label
    ? role.relationship_label.split(/[、,，/]/).map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <button className={styles.card} onClick={onClick}>
      {/* Image Area */}
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
        {/* Saturation overlay */}
        <div className={styles.saturationOverlay} />
        {/* Gradient overlay at bottom */}
        <div className={styles.gradientOverlay}>
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
        </div>
      </div>

      {/* Info Area */}
      <div className={styles.info}>
        <h3 className={styles.name}>{role.name}</h3>
        {role.description && (
          <p className={styles.quote}>
            &ldquo;{role.description.length > 80
              ? role.description.slice(0, 80) + '...'
              : role.description}&rdquo;
          </p>
        )}
      </div>
    </button>
  );
}
