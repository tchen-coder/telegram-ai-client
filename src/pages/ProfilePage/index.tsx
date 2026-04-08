import { useApp } from '../../store/appStore';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useApp();

  return (
    <div className="page-container">
      <div className="page-scroll">
        <div className={styles.profile}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {user?.userName?.charAt(0) || 'U'}
              </span>
            </div>
            <span className={styles.premium}>Premium</span>
          </div>
          <h1 className={styles.name}>{user?.userName || 'User'}</h1>
          <p className={styles.userId}>ID: {user?.userId || '-'}</p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardRow}>
            <span>My Subscriptions</span>
            <span className={styles.chevron}>›</span>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>My Favorites</h3>
          <div className={styles.favorites}>
            <div className={styles.favoriteEmpty}>
              <p className={styles.favoriteHint}>No favorites yet</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          {[
            { icon: '🔔', label: 'Notifications' },
            { icon: '🎨', label: 'Appearance' },
            { icon: '🌐', label: 'Language' },
            { icon: '❓', label: 'Support & FAQ' },
          ].map((item) => (
            <div key={item.label} className={styles.settingRow}>
              <span className={styles.settingIcon}>{item.icon}</span>
              <span className={styles.settingLabel}>{item.label}</span>
              <span className={styles.chevron}>›</span>
            </div>
          ))}
        </div>

        <button className={styles.signOut}>Sign Out</button>

        <p className={styles.version}>v1.0.0</p>
      </div>
    </div>
  );
}
