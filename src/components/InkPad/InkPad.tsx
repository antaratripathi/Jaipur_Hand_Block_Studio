import { useState } from 'react';
import { INKS } from '../../lib/inks';
import styles from './InkPad.module.css';

interface Props {
  inkId: string;
  holding: string | null;
  onPick: (inkId: string) => void;
  onDab: () => void;
}

/** One ink tin whose felt shows the chosen colour, with the four colours beneath it. */
export default function InkPad({ inkId, holding, onPick, onDab }: Props) {
  const [dabbing, setDabbing] = useState(0);
  const ink = INKS.find((i) => i.id === inkId) ?? INKS[0];

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.tin} ${dabbing ? (dabbing % 2 ? styles.dabA : styles.dabB) : ''}`}
        style={{ '--ink': ink.hex } as React.CSSProperties}
        aria-label={holding ? `Ink the ${holding} block with ${ink.name}` : `${ink.name} ink pad`}
        onClick={() => {
          if (!holding) return;
          onDab();
          setDabbing((n) => n + 1);
        }}
      >
        <span className={styles.felt} aria-hidden />
      </button>
      <div className={styles.colours} role="radiogroup" aria-label="Ink colour">
        {INKS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === inkId}
            aria-label={c.name}
            title={c.name}
            className={styles.colour}
            style={{ '--ink': c.hex } as React.CSSProperties}
            onClick={() => onPick(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
