import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAMPS, STAMPS_BY_ID } from '../../assets/stamps/stamps';
import { INKS } from '../../lib/inks';
import { preloadStampMasks } from '../../lib/stampMask';
import { usePrintState } from '../../hooks/usePrintState';
import { useStamping } from '../../hooks/useStamping';
import { useElementSize } from '../../hooks/useElementSize';
import BlockTray from '../BlockTray/BlockTray';
import Paper from '../Paper/Paper';
import GhostBlock from '../GhostBlock/GhostBlock';
import styles from './PrintTable.module.css';

export default function PrintTable() {
  const { state, addPress, undo } = usePrintState();
  const [stampId, setStampId] = useState<string | null>(null);
  const [masksReady, setMasksReady] = useState(0);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperSize = useElementSize(paperRef);
  const color = INKS[0].hex;

  useEffect(() => {
    preloadStampMasks(STAMPS).then(() => setMasksReady((n) => n + 1));
  }, []);

  const onPress = useCallback(addPress, [addPress]);
  const { ghost, rotation, rotate, pressing, handlers } = useStamping({
    surfaceRef,
    paperRef,
    stampId,
    color,
    inkLevel: 1,
    onPress,
  });

  const scene = useMemo(
    () => ({ presses: state.presses, paperSeed: state.paperSeed, masksReady }),
    [state.presses, state.paperSeed, masksReady],
  );
  const def = stampId ? STAMPS_BY_ID[stampId] : null;

  return (
    <main className={styles.table}>
      <aside className={styles.tools}>
        <BlockTray selectedId={stampId} onSelect={setStampId} />
      </aside>

      <div
        ref={surfaceRef}
        className={`${styles.surface} ${def ? styles.armed : ''}`}
        {...handlers}
      >
        <div className={styles.paperSlot}>
          <Paper ref={paperRef} scene={scene} pressCount={state.presses.length} />
        </div>
      </div>

      <aside className={styles.controls}>
        <button type="button" onClick={() => rotate(-15)} disabled={!def} aria-label="Rotate block left">⟲ Rotate</button>
        <button type="button" onClick={() => rotate(15)} disabled={!def} aria-label="Rotate block right">Rotate ⟳</button>
        <button type="button" onClick={undo} disabled={!state.presses.length}>Undo</button>
      </aside>

      {def && ghost && (
        <GhostBlock
          def={def}
          x={ghost.x}
          y={ghost.y}
          size={def.defaultSize * paperSize.width}
          rotation={rotation}
          color={color}
          pressing={pressing}
        />
      )}
    </main>
  );
}
