import { useState } from 'react';
import styles from './Controls.module.css';

interface SheetProps {
  canUndo: boolean;
  hasInk: boolean;
  onUndo: () => void;
  onWash: () => void;
  onNewSheet: () => void;
  onDownloadPNG: () => Promise<void>;
}

/** Undo · Wash off · New sheet, and the download, as quiet text links. */
export function SheetControls(p: SheetProps) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      await p.onDownloadPNG();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.sheet}>
      <p className={styles.row}>
        <button type="button" className={styles.link} onClick={p.onUndo} disabled={!p.canUndo}>Undo</button>
        <span className={styles.sep} aria-hidden>·</span>
        <button type="button" className={styles.link} onClick={p.onWash} disabled={!p.hasInk}>Wash off</button>
        <span className={styles.sep} aria-hidden>·</span>
        <button type="button" className={styles.link} onClick={p.onNewSheet}>New sheet</button>
      </p>
      <button type="button" className={`${styles.link} ${styles.download}`} onClick={download} disabled={!p.hasInk || busy}>
        {busy ? 'Saving…' : 'Download PNG'}
      </button>
    </div>
  );
}
