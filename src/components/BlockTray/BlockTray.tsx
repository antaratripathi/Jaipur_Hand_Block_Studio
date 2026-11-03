import { STAMPS } from '../../assets/stamps/stamps';
import type { BlockInk } from '../../hooks/useInk';
import StampBlock from './StampBlock';
import styles from './BlockTray.module.css';

interface Props {
  selectedId: string | null;
  inks: Record<string, BlockInk>;
  onSelect: (id: string | null) => void;
}

export default function BlockTray({ selectedId, inks, onSelect }: Props) {
  return (
    <section className={styles.tray} aria-label="Stamp blocks">
      {STAMPS.map((def) => (
        <StampBlock
          key={def.id}
          def={def}
          selected={def.id === selectedId}
          ink={inks[def.id]}
          onSelect={() => onSelect(def.id === selectedId ? null : def.id)}
        />
      ))}
    </section>
  );
}
