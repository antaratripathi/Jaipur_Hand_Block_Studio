import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAMPS, STAMPS_BY_ID } from '../../assets/stamps/stamps';
import { INKS } from '../../lib/inks';
import type { Press } from '../../lib/types';
import { preloadStampMasks } from '../../lib/stampMask';
import { loadHandFonts } from '../../lib/fonts';
import { downloadPDF, downloadPNG } from '../../lib/export';
import { sounds } from '../../lib/sound';
import { usePrintState } from '../../hooks/usePrintState';
import { useInk } from '../../hooks/useInk';
import { useMessage } from '../../hooks/useMessage';
import { useStamping } from '../../hooks/useStamping';
import { useElementSize } from '../../hooks/useElementSize';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useFirstVisit } from '../../hooks/useFirstVisit';
import BlockTray from '../BlockTray/BlockTray';
import InkPad from '../InkPad/InkPad';
import Paper, { type SheetPhase } from '../Paper/Paper';
import GhostBlock from '../GhostBlock/GhostBlock';
import MessageTool from '../MessageTool/MessageTool';
import DraggableMessage from '../MessageTool/DraggableMessage';
import { QuickControls, SheetControls } from '../Controls/Controls';
import BottomSheet from '../BottomSheet/BottomSheet';
import HintOverlay from '../HintOverlay/HintOverlay';
import styles from './PrintTable.module.css';

const DRY_COLOR = '#6f4a2a';
const COMPACT = '(max-width: 860px)';

export default function PrintTable() {
  const { state, addPress, undo, wash, newSheet } = usePrintState();
  const { inkId, setInkId, blocks, dab, deplete } = useInk();
  const { message, update: updateMessage, reset: resetMessage } = useMessage();
  const hint = useFirstVisit();
  const compact = useMediaQuery(COMPACT);
  const reducedMotion = useReducedMotion();
  const [stampId, setStampId] = useState<string | null>(null);
  const [assetsVersion, setAssetsVersion] = useState(0);
  const [dryShake, setDryShake] = useState(0);
  const [phase, setPhase] = useState<SheetPhase>('idle');
  const [sheet, setSheet] = useState<'write' | 'card' | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperSize = useElementSize(paperRef);

  useEffect(() => {
    const bump = () => setAssetsVersion((n) => n + 1);
    preloadStampMasks(STAMPS).then(bump);
    loadHandFonts().then(bump);
  }, []);

  // Fonts may finish downloading after a font switch.
  useEffect(() => {
    document.fonts?.ready.then(() => setAssetsVersion((n) => n + 1));
  }, [message.fontId]);

  useEffect(() => {
    if (!compact) setSheet(null);
  }, [compact]);

  const def = stampId ? STAMPS_BY_ID[stampId] : null;
  const blockInk = stampId ? blocks[stampId] : undefined;

  const onPress = useCallback(
    (press: Press) => {
      addPress(press);
      deplete(press.stampId);
      sounds.press();
    },
    [addPress, deplete],
  );
  const onDry = useCallback(() => setDryShake((n) => n + 1), []);
  const onPutDown = useCallback(() => setStampId(null), []);

  const { ghost, rotation, rotate, pressing, handlers } = useStamping({
    surfaceRef,
    paperRef,
    stampId: phase === 'idle' && !sheet ? stampId : null,
    color: blockInk?.color ?? DRY_COLOR,
    inkLevel: blockInk?.level ?? 0,
    reducedMotion,
    onDry,
    onPress,
    onPutDown,
  });

  const onDab = (id: string) => {
    setInkId(id);
    if (stampId) {
      dab(stampId, INKS.find((i) => i.id === id)!.hex);
      sounds.ink();
    }
  };

  const scene = useMemo(
    () => ({ presses: state.presses, paperSeed: state.paperSeed, message }),
    [state.presses, state.paperSeed, message],
  );

  // The hint follows along, and steps aside after the first print.
  const hintStep = !def ? 0 : !blockInk ? 1 : 2;
  useEffect(() => {
    if (state.presses.length && hint.show) hint.dismiss();
  }, [state.presses.length, hint]);

  const ms = (n: number) => (reducedMotion ? 0 : n);

  const onWash = () => {
    if (phase !== 'idle') return;
    setSheet(null);
    setPhase('washing');
    sounds.wash();
    window.setTimeout(() => {
      wash();
      resetMessage();
      setPhase('idle');
    }, ms(700));
  };

  const onNewSheet = () => {
    if (phase !== 'idle') return;
    setSheet(null);
    setPhase('leaving');
    sounds.slide();
    window.setTimeout(() => {
      newSheet();
      resetMessage();
      setPhase('entering');
      window.setTimeout(() => setPhase('idle'), ms(500));
    }, ms(450));
  };

  const quick = (
    <QuickControls canRotate={!!def} canUndo={state.presses.length > 0} onRotate={rotate} onUndo={undo} />
  );
  const sheetControls = (
    <SheetControls
      hasInk={state.presses.length > 0 || !!message.text.trim()}
      onWash={onWash}
      onNewSheet={onNewSheet}
      onDownloadPNG={() => downloadPNG(scene)}
      onDownloadPDF={() => downloadPDF(scene)}
    />
  );
  const messageTool = <MessageTool message={message} onChange={updateMessage} />;
  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <main className={`${styles.table} ${compact ? styles.compact : ''}`}>
      <aside className={styles.tools}>
        <BlockTray selectedId={stampId} inks={blocks} onSelect={setStampId} />
        {compact && <InkPad inkId={inkId} holding={def?.name ?? null} onDab={onDab} />}
      </aside>

      <div
        ref={surfaceRef}
        className={`${styles.surface} ${def ? styles.armed : ''}`}
        tabIndex={def ? 0 : -1}
        aria-label={def ? `Print table. Holding the ${def.name} block: arrow keys to aim, Enter to press, [ and ] to rotate, Escape to put it down.` : undefined}
        {...handlers}
      >
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
        {hint.show && <HintOverlay step={hintStep} onDismiss={hint.dismiss} />}
        {def && !blockInk && !hint.show && (
          <p className={styles.nudge} key={dryShake} aria-live="polite">
            Dab the block on an ink first
          </p>
        )}
      </div>

      {compact ? (
        <div className={styles.bar}>
          {quick}
          <div className={styles.barGroup}>
            <button type="button" onClick={() => setSheet('write')} aria-haspopup="dialog">Write</button>
            <button type="button" className={styles.barPrimary} onClick={() => setSheet('card')} aria-haspopup="dialog">Card ▴</button>
          </div>
        </div>
      ) : (
        <aside className={styles.controls}>
          <InkPad inkId={inkId} holding={def?.name ?? null} onDab={onDab} />
          {messageTool}
          {quick}
          {sheetControls}
        </aside>
      )}

      {compact && (
        <>
          <BottomSheet title="Write a message" open={sheet === 'write'} onClose={closeSheet}>
            {messageTool}
          </BottomSheet>
          <BottomSheet title="Your card" open={sheet === 'card'} onClose={closeSheet}>
            {sheetControls}
          </BottomSheet>
        </>
      )}

      {def && ghost && phase === 'idle' && !sheet && (
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
