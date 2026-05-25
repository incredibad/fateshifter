import AppNav from './AppNav.jsx';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      <AppNav />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
