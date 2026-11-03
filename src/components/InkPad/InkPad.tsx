import { useState } from 'react';
import { INKS } from '../../lib/inks';
import styles from './InkPad.module.css';

interface Props {
  inkId: string;
  /** Name of the block in hand, if any — tapping a pad then inks it. */
  holding: string | null;
  onDab: (inkId: string) => void;
}

export default function InkPad({ inkId, holding, onDab }: Props) {
  const [dabbing, setDabbing] = useState<string | null>(null);

  const handle = (id: string) => {
    onDab(id);
    setDabbing(id);
    window.setTimeout(() => setDabbing(null), 260);
  };

  return (
    <section className={styles.tin} aria-label="Ink pad">
      <div className={styles.pads}>
        {INKS.map((ink) => (
          <button
            key={ink.id}
            type="button"
            className={`${styles.pad} ${ink.id === inkId ? styles.selected : ''} ${dabbing === ink.id ? styles.dab : ''}`}
            style={{ '--ink': ink.hex } as React.CSSProperties}
            aria-pressed={ink.id === inkId}
            aria-label={holding ? `Ink the ${holding} block with ${ink.name}` : `Choose ${ink.name} ink`}
            title={ink.name}
            onClick={() => handle(ink.id)}
          >
            <span className={styles.felt} aria-hidden />
          </button>
        ))}
      </div>
      <p className={styles.caption} aria-live="polite">
        {holding ? `Dab the ${holding.toLowerCase()} block on an ink` : `${INKS.find((i) => i.id === inkId)?.name} ink`}
      </p>
    </section>
  );
}
