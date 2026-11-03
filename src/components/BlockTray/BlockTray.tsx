import { STAMPS } from '../../assets/stamps/stamps';
import StampBlock from './StampBlock';
import styles from './BlockTray.module.css';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function BlockTray({ selectedId, onSelect }: Props) {
  return (
    <section className={styles.tray} aria-label="Stamp blocks">
      {STAMPS.map((def) => (
        <StampBlock
          key={def.id}
          def={def}
          selected={def.id === selectedId}
          onSelect={() => onSelect(def.id === selectedId ? null : def.id)}
        />
      ))}
    </section>
  );
}
