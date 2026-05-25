import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/authContext.jsx';
import styles from './AppNav.module.css';

export default function AppNav() {
  const { auth, logout } = useAuth();

  return (
    <div className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⚄</span>
        <span className={styles.logoText}>Fateshifter</span>
      </div>
      <div className={styles.divider} />
      <nav className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}>
          <DiceIcon /> Generator
        </NavLink>
        <NavLink to="/lists" className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}>
          <ListIcon /> Lists
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}>
          <SettingsIcon /> Settings
        </NavLink>
      </nav>
      <div className={styles.footer}>
        {auth?.username && <span className={styles.username}>{auth.username}</span>}
        <button className={styles.logout} onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}

const DiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
