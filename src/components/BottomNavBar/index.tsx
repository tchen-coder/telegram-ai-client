import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNavBar.module.css';

/* Figma 248:545 — image assets for tab icons */
const exploreIcon = 'https://www.figma.com/api/mcp/asset/5a0df75b-1fa0-472a-89b1-5f800f3b9022';
const chatIcon = 'https://www.figma.com/api/mcp/asset/e51fb3a1-09b1-4d56-bc7b-4d5413814a30';
const profileIcon = 'https://www.figma.com/api/mcp/asset/a541b683-459e-4759-aff5-e822597d86e5';

const tabs = [
  { path: '/', label: '探索', icon: exploreIcon, iconW: 20, iconH: 24 },
  { path: '/messages', label: '聊天', icon: chatIcon, iconW: 20, iconH: 24 },
  { path: '/profile', label: '个人', icon: profileIcon, iconW: 16, iconH: 20 },
] as const;

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.nav}>
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
