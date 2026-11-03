import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAMPS, STAMPS_BY_ID } from '../../assets/stamps/stamps';
import { INKS } from '../../lib/inks';
import type { Press } from '../../lib/types';
import { preloadStampMasks } from '../../lib/stampMask';
import { loadHandFonts } from '../../lib/fonts';
import { downloadPDF, downloadPNG } from '../../lib/export';
import { usePrintState } from '../../hooks/usePrintState';
import { useInk } from '../../hooks/useInk';
import { useMessage } from '../../hooks/useMessage';
import { useStamping } from '../../hooks/useStamping';
import { useElementSize } from '../../hooks/useElementSize';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import BlockTray from '../BlockTray/BlockTray';
import InkPad from '../InkPad/InkPad';
import Paper, { type SheetPhase } from '../Paper/Paper';
import GhostBlock from '../GhostBlock/GhostBlock';
import MessageTool from '../MessageTool/MessageTool';
import DraggableMessage from '../MessageTool/DraggableMessage';
import Controls from '../Controls/Controls';
import styles from './PrintTable.module.css';

const DRY_COLOR = '#6f4a2a';

export default function PrintTable() {
  const { state, addPress, undo, wash, newSheet } = usePrintState();
  const { inkId, setInkId, blocks, dab, deplete } = useInk();
  const { message, update: updateMessage, reset: resetMessage } = useMessage();
  const [stampId, setStampId] = useState<string | null>(null);
  const [assetsVersion, setAssetsVersion] = useState(0);
  const [dryShake, setDryShake] = useState(0);
  const [phase, setPhase] = useState<SheetPhase>('idle');
  const surfaceRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperSize = useElementSize(paperRef);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const bump = () => setAssetsVersion((n) => n + 1);
    preloadStampMasks(STAMPS).then(bump);
    loadHandFonts().then(bump);
  }, []);

  // Fonts may finish downloading after a font switch.
  useEffect(() => {
    document.fonts?.ready.then(() => setAssetsVersion((n) => n + 1));
  }, [message.fontId]);

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
    stampId: phase === 'idle' ? stampId : null,
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
    () => ({ presses: state.presses, paperSeed: state.paperSeed, message }),
    [state.presses, state.paperSeed, message],
  );

  const ms = (n: number) => (reducedMotion ? 0 : n);

  const onWash = () => {
    if (phase !== 'idle') return;
    setPhase('washing');
    window.setTimeout(() => {
      wash();
      resetMessage();
      setPhase('idle');
    }, ms(700));
  };

  const onNewSheet = () => {
    if (phase !== 'idle') return;
    setPhase('leaving');
    window.setTimeout(() => {
      newSheet();
      resetMessage();
      setPhase('entering');
      window.setTimeout(() => setPhase('idle'), ms(500));
    }, ms(450));
  };

  return (
    <main className={styles.table}>
      <aside className={styles.tools}>
        <BlockTray selectedId={stampId} inks={blocks} onSelect={setStampId} />
      </aside>

      <div ref={surfaceRef} className={`${styles.surface} ${def ? styles.armed : ''}`} {...handlers}>
        <div className={styles.paperSlot}>
          <Paper ref={paperRef} scene={scene} assetsVersion={assetsVersion} pressCount={state.presses.length} phase={phase}>
            <DraggableMessage
              message={message}
              paperWidth={paperSize.width}
              enabled={!def && phase === 'idle'}
              onMove={(x, y) => updateMessage({ x, y })}
            />
          </Paper>
        </div>
        {def && !blockInk && (
          <p className={styles.nudge} key={dryShake} aria-live="polite">
            Dab the block on an ink first
          </p>
        )}
      </div>

      <aside className={styles.controls}>
        <InkPad inkId={inkId} holding={def?.name ?? null} onDab={onDab} />
        <MessageTool message={message} onChange={updateMessage} />
        <Controls
          canRotate={!!def}
          canUndo={state.presses.length > 0}
          hasInk={state.presses.length > 0 || !!message.text.trim()}
          onRotate={rotate}
          onUndo={undo}
          onWash={onWash}
          onNewSheet={onNewSheet}
          onDownloadPNG={() => downloadPNG(scene)}
          onDownloadPDF={() => downloadPDF(scene)}
        />
      </aside>

      {def && ghost && phase === 'idle' && (
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
