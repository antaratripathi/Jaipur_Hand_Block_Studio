import { useState } from 'react';
import { HAND_FONTS } from '../../lib/fonts';
import styles from './Controls.module.css';

interface LetteringProps {
  fontId: string;
  onChange: (fontId: string) => void;
}

/** Choose the message lettering. */
export function Lettering({ fontId, onChange }: LetteringProps) {
  return (
    <p className={styles.row} role="group" aria-label="Message lettering">
      <span className={styles.label}>Lettering</span>
      {HAND_FONTS.map((f, i) => (
        <span key={f.id} className={styles.item}>
          {i > 0 && <span className={styles.sep} aria-hidden>·</span>}
          <button type="button" className={styles.link} aria-pressed={f.id === fontId} onClick={() => onChange(f.id)}>
            {f.name}
          </button>
        </span>
      ))}
    </p>
  );
}

interface SheetProps {
  canUndo: boolean;
  hasInk: boolean;
  onUndo: () => void;
  onWash: () => void;
  onNewSheet: () => void;
  onDownloadPNG: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
}

/** Undo · Wash off · New sheet, and the downloads, as quiet text links. */
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
    <div className={styles.sheet}>
      <p className={styles.row}>
        <button type="button" className={styles.link} onClick={p.onUndo} disabled={!p.canUndo}>Undo</button>
        <span className={styles.sep} aria-hidden>·</span>
        <button type="button" className={styles.link} onClick={p.onWash} disabled={!p.hasInk}>Wash off</button>
        <span className={styles.sep} aria-hidden>·</span>
        <button type="button" className={styles.link} onClick={p.onNewSheet}>New sheet</button>
      </p>
      <div className={styles.downloads}>
        <button type="button" className={`${styles.link} ${styles.download}`} onClick={() => run('png', p.onDownloadPNG)} disabled={!p.hasInk || busy !== null}>
          <span aria-hidden>↳</span> {busy === 'png' ? 'Saving…' : 'Download PNG'}
        </button>
        <button type="button" className={`${styles.link} ${styles.download}`} onClick={() => run('pdf', p.onDownloadPDF)} disabled={!p.hasInk || busy !== null}>
          <span aria-hidden>↳</span> {busy === 'pdf' ? 'Saving…' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}
