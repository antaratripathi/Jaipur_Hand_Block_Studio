import { useEffect, useRef, type ReactNode } from 'react';
import styles from './BottomSheet.module.css';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** A panel that slides up from the bottom on small screens. */
export default function BottomSheet({ title, open, onClose, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.inert = !open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('textarea, button, [tabindex]')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      returnTo?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} ref={rootRef} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <span className={styles.grip} aria-hidden />
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
