import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAMPS, STAMPS_BY_ID } from '../../assets/stamps/stamps';
import { INKS } from '../../lib/inks';
import type { Press } from '../../lib/types';
import { preloadStampMasks } from '../../lib/stampMask';
import { downloadPNG } from '../../lib/export';
import { sounds } from '../../lib/sound';
import { usePrintState } from '../../hooks/usePrintState';
import { useInk } from '../../hooks/useInk';
import { useStamping } from '../../hooks/useStamping';
import { useElementSize } from '../../hooks/useElementSize';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSound } from '../../hooks/useSound';
import BlockTray from '../BlockTray/BlockTray';
import InkPad from '../InkPad/InkPad';
import Paper, { type SheetPhase } from '../Paper/Paper';
import GhostBlock from '../GhostBlock/GhostBlock';
import { SheetControls } from '../Controls/Controls';
import SoundToggle from '../SoundToggle/SoundToggle';
import styles from './PrintTable.module.css';

export default function PrintTable() {
  const { state, addPress, undo, wash, newSheet } = usePrintState();
  const { inkId, setInkId, blocks, dab, deplete } = useInk();
  const sound = useSound();
  const reducedMotion = useReducedMotion();
  const [stampId, setStampId] = useState<string | null>(null);
  const [assetsVersion, setAssetsVersion] = useState(0);
  const [dryShake, setDryShake] = useState(0);
  const [phase, setPhase] = useState<SheetPhase>('idle');
  const areaRef = useRef<HTMLElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperSize = useElementSize(paperRef);

  useEffect(() => {
    const bump = () => setAssetsVersion((n) => n + 1);
    preloadStampMasks(STAMPS).then(bump);
  }, []);

  const def = stampId ? STAMPS_BY_ID[stampId] : null;
  const blockInk = stampId ? blocks[stampId] : undefined;
  const ink = INKS.find((i) => i.id === inkId) ?? INKS[0];

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

  const { ghost, rotation, pressing, handlers, focusHandlers } = useStamping({
    areaRef,
    focusRef,
    paperRef,
    stampId: phase === 'idle' ? stampId : null,
    color: blockInk?.color ?? ink.hex,
    inkLevel: blockInk?.level ?? 0,
    reducedMotion,
    onDry,
    onPress,
    onPutDown,
  });

  const onDab = (id: string) => {
    const hex = INKS.find((i) => i.id === id)!.hex;
    setInkId(id);
    if (!stampId) return;
    dab(stampId, hex);
    sounds.ink();
  };

  const scene = useMemo(
    () => ({ presses: state.presses, paperSeed: state.paperSeed }),
    [state.presses, state.paperSeed],
  );

  const ms = (n: number) => (reducedMotion ? 0 : n);

  const onWash = () => {
    if (phase !== 'idle') return;
    setPhase('washing');
    sounds.wash();
    window.setTimeout(() => {
      wash();
      setPhase('idle');
    }, ms(700));
  };

  const onNewSheet = () => {
    if (phase !== 'idle') return;
    setPhase('leaving');
    sounds.slide();
    window.setTimeout(() => {
      newSheet();
      setPhase('entering');
      window.setTimeout(() => setPhase('idle'), ms(500));
    }, ms(450));
  };

  return (
    <main ref={areaRef} className={`${styles.page} ${def ? styles.armed : ''}`} {...handlers}>
      <SoundToggle on={sound.on} onToggle={sound.toggle} className={styles.sound} />

      <div className={styles.layout}>
        <div
          ref={focusRef}
          className={styles.paperCol}
          tabIndex={def ? 0 : -1}
          aria-label={def ? `Card. Holding the ${def.name} block: arrow keys to aim, Enter to press, [ and ] to rotate, Escape to put it back.` : undefined}
          {...focusHandlers}
        >
          <Paper ref={paperRef} scene={scene} assetsVersion={assetsVersion} pressCount={state.presses.length} phase={phase} />
        </div>

        <section className={styles.panel} aria-label="Jaipur Hand Block Studio">
          <header className={styles.header}>
            <h1 className={styles.title}>Jaipur Hand Block Studio</h1>
            <p className={styles.subtitle}>Experience the authentic art of Jaipur hand block printing</p>
          </header>

          <div className={styles.step}>
            <p className={styles.label}>Select a hand block motif</p>
            <BlockTray selectedId={stampId} inks={blocks} onSelect={setStampId} />
          </div>

          <div className={styles.step}>
            <p className={styles.label}>Select an ink for your block</p>
            <InkPad inkId={inkId} holding={def?.name ?? null} onDab={onDab} />
          </div>

          <div className={styles.footer}>
            <SheetControls
              canUndo={state.presses.length > 0}
              hasInk={state.presses.length > 0}
              onUndo={undo}
              onWash={onWash}
              onNewSheet={onNewSheet}
              onDownloadPNG={() => downloadPNG(scene)}
            />
          </div>
        </section>
      </div>

      {def && ghost && phase === 'idle' && (
        <GhostBlock
          def={def}
          ink={blockInk}
          x={ghost.x}
          y={ghost.y}
          size={def.defaultSize * paperSize.width}
          rotation={rotation}
          pressing={pressing}
          shake={dryShake}
        />
      )}
    </main>
  );
}
