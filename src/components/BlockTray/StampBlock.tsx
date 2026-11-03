import type { StampDef } from '../../lib/types';
import StampFace from '../StampFace/StampFace';
import styles from './BlockTray.module.css';

interface Props {
  def: StampDef;
  selected: boolean;
  onSelect: () => void;
}

export default function StampBlock({ def, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`${styles.block} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      aria-label={`${def.name} block`}
      onClick={onSelect}
    >
      <span className={styles.handle} aria-hidden />
      <span className={styles.face}>
        <StampFace def={def} fill="var(--color-wood-dark)" className={styles.carving} />
      </span>
      <span className={styles.name}>{def.name}</span>
    </button>
  );
}
