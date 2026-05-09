import type { Role } from '../../types/api';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  role: Role;
  onClick: () => void;
}

function truncateName(name: string, max: number = 16): string {
  const chars = Array.from(name);
  return chars.length > max ? chars.slice(0, max).join('') + '...' : name;
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
