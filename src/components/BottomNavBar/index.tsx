import { useNavigate, useLocation } from 'react-router-dom';
import { getLocale } from '../../utils/locale';
import styles from './BottomNavBar.module.css';

/* Figma 248:545 — image assets for tab icons */
const exploreIcon = new URL('../../assets/tab-explore.svg', import.meta.url).href;
const chatIcon = new URL('../../assets/tab-chat.svg', import.meta.url).href;

const isTelegram = !!window.Telegram?.WebApp;

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = getLocale();

  const tabs = [
    { path: '/', label: t.navExplore, icon: exploreIcon, iconW: 20, iconH: 24 },
    { path: '/messages', label: t.navChat, icon: chatIcon, iconW: 20, iconH: 24 },
  ] as const;

  return (
    <nav className={`${styles.nav} ${isTelegram ? styles.telegram : ''}`}>
      <div className={styles.shell}>
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              className={`${styles.tab} ${active ? styles.active : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <div className={styles.iconMargin} style={{ width: tab.iconW, height: tab.iconH }}>
                <img alt="" className={styles.iconImg} src={tab.icon} />
              </div>
              <span className={styles.label}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
