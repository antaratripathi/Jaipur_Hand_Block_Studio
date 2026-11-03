import type { StampDef } from '../../lib/types';
import type { BlockInk } from '../../hooks/useInk';
import StampFace from '../StampFace/StampFace';
import styles from './BlockTray.module.css';

interface Props {
  def: StampDef;
  selected: boolean;
  ink?: BlockInk;
  onSelect: () => void;
}

export default function StampBlock({ def, selected, ink, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`${styles.block} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      aria-label={`${def.name} block${ink ? ', inked' : ''}`}
      onClick={onSelect}
    >
      <span className={styles.handle} aria-hidden />
      <span className={styles.face}>
        <StampFace def={def} fill="var(--color-wood-dark)" className={styles.carving} />
        {ink && (
          <StampFace
            def={def}
            fill={ink.color}
            className={`${styles.carving} ${styles.ink}`}
            style={{ opacity: 0.35 + 0.65 * ink.level }}
          />
        )}
      </span>
      <span className={styles.name}>{def.name}</span>
    </button>
  );
}
