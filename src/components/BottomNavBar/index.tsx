import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNavBar.module.css';

// SVG icon components matching Figma design
function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1L12.9 7.1L19.5 7.9L14.75 12.5L15.9 19.1L10 15.8L4.1 19.1L5.25 12.5L0.5 7.9L7.1 7.1L10 1Z"
        fill={active ? '#c084fc' : 'none'}
        stroke={active ? '#c084fc' : '#71717a'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 4C2 2.9 2.9 2 4 2H16C17.1 2 18 2.9 18 4V13C18 14.1 17.1 15 16 15H6L2 19V4Z"
        fill={active ? '#c084fc' : 'none'}
        stroke={active ? '#c084fc' : '#71717a'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="5"
        r="3"
        fill={active ? '#c084fc' : 'none'}
        stroke={active ? '#c084fc' : '#71717a'}
        strokeWidth="1.5"
      />
      <path
        d="M2 14C2 11.2 4.7 9 8 9C11.3 9 14 11.2 14 14"
        fill="none"
        stroke={active ? '#c084fc' : '#71717a'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const tabs = [
  { path: '/', label: 'Explore', Icon: ExploreIcon },
  { path: '/messages', label: 'Chat', Icon: ChatIcon },
  { path: '/profile', label: 'Profile', Icon: ProfileIcon },
] as const;

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.Icon active={active} />
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
