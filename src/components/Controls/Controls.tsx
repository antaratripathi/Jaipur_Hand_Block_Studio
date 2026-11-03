import { useState } from 'react';
import styles from './Controls.module.css';

interface QuickProps {
  canRotate: boolean;
  canUndo: boolean;
  onRotate: (deg: number) => void;
  onUndo: () => void;
}

/** Rotate and undo: always within reach. */
export function QuickControls({ canRotate, canUndo, onRotate, onUndo }: QuickProps) {
  return (
    <div className={styles.group}>
      <button type="button" onClick={() => onRotate(-15)} disabled={!canRotate} aria-label="Rotate block left">⟲</button>
      <button type="button" onClick={() => onRotate(15)} disabled={!canRotate} aria-label="Rotate block right">⟳</button>
      <button type="button" onClick={onUndo} disabled={!canUndo}>Undo</button>
    </div>
  );
}

interface SheetProps {
  hasInk: boolean;
  onWash: () => void;
  onNewSheet: () => void;
  onDownloadPNG: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
}

/** Wash off, new sheet and downloads. */
export function SheetControls(p: SheetProps) {
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
    <div className={styles.controls}>
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
    </div>
  );
}
