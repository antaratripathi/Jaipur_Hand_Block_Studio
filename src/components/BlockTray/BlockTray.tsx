import { STAMPS } from '../../assets/stamps/stamps';
import type { BlockInk } from '../../hooks/useInk';
import WoodBlock from '../WoodBlock/WoodBlock';
import styles from './BlockTray.module.css';

interface Props {
  selectedId: string | null;
  inks: Record<string, BlockInk>;
  onSelect: (id: string | null) => void;
}

/** The row of blocks. A lifted block leaves an empty slot; tap the slot to put it back. */
export default function BlockTray({ selectedId, inks, onSelect }: Props) {
  return (
    <div className={styles.tray} role="group" aria-label="Stamp blocks">
      {STAMPS.map((def, i) => {
        const lifted = def.id === selectedId;
        return (
          <button
            key={def.id}
            type="button"
            className={`${styles.slot} ${lifted ? styles.empty : ''}`}
            aria-pressed={lifted}
            aria-label={lifted ? `Put the ${def.name} block back` : `Pick up the ${def.name} block${inks[def.id] ? ' (inked)' : ''}`}
            onClick={() => onSelect(lifted ? null : def.id)}
          >
            {!lifted && <WoodBlock def={def} ink={inks[def.id]} grainOffset={i} className={styles.block} />}
          </button>
        );
      })}
    </div>
  );
}
