import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAMPS, STAMPS_BY_ID } from '../../assets/stamps/stamps';
import { INKS } from '../../lib/inks';
import type { Press } from '../../lib/types';
import { preloadStampMasks } from '../../lib/stampMask';
import { usePrintState } from '../../hooks/usePrintState';
import { useInk } from '../../hooks/useInk';
import { useStamping } from '../../hooks/useStamping';
import { useElementSize } from '../../hooks/useElementSize';
import BlockTray from '../BlockTray/BlockTray';
import InkPad from '../InkPad/InkPad';
import Paper from '../Paper/Paper';
import GhostBlock from '../GhostBlock/GhostBlock';
import styles from './PrintTable.module.css';

const DRY_COLOR = '#6f4a2a';

export default function PrintTable() {
  const { state, addPress, undo } = usePrintState();
  const { inkId, setInkId, blocks, dab, deplete } = useInk();
  const [stampId, setStampId] = useState<string | null>(null);
  const [masksReady, setMasksReady] = useState(0);
  const [dryShake, setDryShake] = useState(0);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperSize = useElementSize(paperRef);

  useEffect(() => {
    preloadStampMasks(STAMPS).then(() => setMasksReady((n) => n + 1));
  }, []);

  const def = stampId ? STAMPS_BY_ID[stampId] : null;
  const blockInk = stampId ? blocks[stampId] : undefined;

  const onPress = useCallback(
    (press: Press) => {
      addPress(press);
      deplete(press.stampId);
    },
    [addPress, deplete],
  );
  const onDry = useCallback(() => setDryShake((n) => n + 1), []);

  const { ghost, rotation, rotate, pressing, handlers } = useStamping({
    surfaceRef,
    paperRef,
    stampId,
    color: blockInk?.color ?? DRY_COLOR,
    inkLevel: blockInk?.level ?? 0,
    onDry,
    onPress,
  });

  const onDab = (id: string) => {
    setInkId(id);
    if (stampId) dab(stampId, INKS.find((i) => i.id === id)!.hex);
  };

  const scene = useMemo(
    () => ({ presses: state.presses, paperSeed: state.paperSeed, masksReady }),
    [state.presses, state.paperSeed, masksReady],
  );

  return (
    <main className={styles.table}>
      <aside className={styles.tools}>
        <BlockTray selectedId={stampId} inks={blocks} onSelect={setStampId} />
      </aside>

      <div ref={surfaceRef} className={`${styles.surface} ${def ? styles.armed : ''}`} {...handlers}>
        <div className={styles.paperSlot}>
          <Paper ref={paperRef} scene={scene} pressCount={state.presses.length} />
        </div>
        {def && !blockInk && (
          <p className={styles.nudge} key={dryShake} aria-live="polite">
            Dab the block on an ink first
          </p>
        )}
      </div>

      <aside className={styles.controls}>
        <InkPad inkId={inkId} holding={def?.name ?? null} onDab={onDab} />
        <div className={styles.buttons}>
          <button type="button" onClick={() => rotate(-15)} disabled={!def} aria-label="Rotate block left">⟲ Rotate</button>
          <button type="button" onClick={() => rotate(15)} disabled={!def} aria-label="Rotate block right">Rotate ⟳</button>
          <button type="button" onClick={undo} disabled={!state.presses.length}>Undo</button>
        </div>
      </aside>

      {def && ghost && (
        <GhostBlock
          def={def}
          x={ghost.x}
          y={ghost.y}
          size={def.defaultSize * paperSize.width}
          rotation={rotation}
          color={blockInk?.color ?? DRY_COLOR}
          pressing={pressing}
          dry={!blockInk}
          shake={dryShake}
        />
      )}
    </main>
  );
}
