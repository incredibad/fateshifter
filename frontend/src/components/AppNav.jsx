import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext.jsx';
import pkg from '../../package.json';
import styles from './AppNav.module.css';

function LogoSVG() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" className={styles.logoSvg}>
      <path d="M20,20 L20,2 A18,18,0,0,1,35.59,11 Z" fill="#b8996e" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <path d="M20,20 L35.59,11 A18,18,0,0,1,35.59,29 Z" fill="#2563eb" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <path d="M20,20 L35.59,29 A18,18,0,0,1,20,38 Z" fill="#1a1a1a" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <path d="M20,20 L20,38 A18,18,0,0,1,4.41,29 Z" fill="#dc2626" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <path d="M20,20 L4.41,29 A18,18,0,0,1,4.41,11 Z" fill="#16a34a" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <path d="M20,20 L4.41,11 A18,18,0,0,1,20,2 Z" fill="#6b7280" stroke="rgba(0,0,0,0.55)" strokeWidth="0.75"/>
      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
      <circle cx="20" cy="20" r="2.5" fill="rgba(0,0,0,0.6)"/>
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="5" x2="17" y2="5"/>
      <line x1="3" y1="10" x2="17" y2="10"/>
      <line x1="3" y1="15" x2="17" y2="15"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="16" y2="16"/>
      <line x1="16" y1="4" x2="4" y2="16"/>
    </svg>
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

export default function AppNav() {
  const { auth, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}
      <div className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
        <div className={styles.navBar}>
          <div className={styles.logo}>
            <LogoSVG />
            <span className={styles.logoText}>FATE SHIFTER</span>
          </div>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
        <div className={styles.navContent}>
          <div className={styles.divider} />
          <nav className={styles.links}>
            <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}>
              <DiceIcon /> Fate Shifter
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
            <span className={styles.version}>v{pkg.version}</span>
          </div>
        </div>
      </div>
    </>
  );
}
