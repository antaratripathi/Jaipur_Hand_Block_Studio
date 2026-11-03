import { useState } from 'react';
import styles from './Controls.module.css';

interface Props {
  canRotate: boolean;
  canUndo: boolean;
  hasInk: boolean;
  onRotate: (deg: number) => void;
  onUndo: () => void;
  onWash: () => void;
  onNewSheet: () => void;
  onDownloadPNG: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
}

export default function Controls(p: Props) {
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null);

  const run = async (kind: 'png' | 'pdf', fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={styles.controls} aria-label="Sheet controls">
      <div className={styles.group}>
        <button type="button" onClick={() => p.onRotate(-15)} disabled={!p.canRotate} aria-label="Rotate block left">⟲</button>
        <button type="button" onClick={() => p.onRotate(15)} disabled={!p.canRotate} aria-label="Rotate block right">⟳</button>
        <button type="button" onClick={p.onUndo} disabled={!p.canUndo}>Undo</button>
      </div>
      <div className={styles.group}>
        <button type="button" onClick={p.onWash} disabled={!p.hasInk}>Wash off</button>
        <button type="button" onClick={p.onNewSheet}>New sheet</button>
      </div>
      <div className={styles.group}>
        <button type="button" className={styles.primary} onClick={() => run('png', p.onDownloadPNG)} disabled={busy !== null}>
          {busy === 'png' ? 'Saving…' : 'Download PNG'}
        </button>
        <button type="button" className={styles.primary} onClick={() => run('pdf', p.onDownloadPDF)} disabled={busy !== null}>
          {busy === 'pdf' ? 'Saving…' : 'Download PDF'}
        </button>
      </div>
    </section>
  );
}
