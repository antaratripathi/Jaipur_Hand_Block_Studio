import { useState } from 'react';
import { INKS } from '../../lib/inks';
import styles from './InkPad.module.css';

interface Props {
  inkId: string;
  holding: string | null;
  /** Tapping a pad chooses its colour and inks the block in hand. */
  onDab: (inkId: string) => void;
}

/** A row of ink pads, one per colour, laid out like the blocks. */
export default function InkPad({ inkId, holding, onDab }: Props) {
  const [dab, setDab] = useState<{ id: string; n: number } | null>(null);

  return (
    <div className={styles.pads} role="group" aria-label="Ink pads">
      {INKS.map((ink) => {
        const dabbing = dab?.id === ink.id;
        return (
          <button
            key={ink.id}
            type="button"
            className={`${styles.pad} ${dabbing ? (dab!.n % 2 ? styles.dabA : styles.dabB) : ''}`}
            style={{ '--ink': ink.hex } as React.CSSProperties}
            aria-pressed={ink.id === inkId}
            aria-label={holding ? `Ink the ${holding} block with ${ink.name}` : `${ink.name} ink`}
            title={ink.name}
            onClick={() => {
              onDab(ink.id);
              if (holding) setDab((d) => ({ id: ink.id, n: (d?.n ?? 0) + 1 }));
            }}
          >
            <span className={styles.felt} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
