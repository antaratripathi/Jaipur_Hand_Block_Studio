import type { ReactNode } from 'react';
import styles from './Title.module.css';

export default function Title({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>The Block Print Table</h1>
      <div className={styles.end}>{children}</div>
    </header>
  );
}
