import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { drawInk, drawPaper, type CardScene } from '../../lib/compositor';
import { useElementSize } from '../../hooks/useElementSize';
import styles from './Paper.module.css';

export type SheetPhase = 'idle' | 'washing' | 'leaving' | 'entering';

interface Props {
  scene: CardScene;
  /** Bumped when fonts or PNG masks finish loading, to force a redraw. */
  assetsVersion: number;
  /** Changes on every press, to trigger the small paper shift. */
  pressCount: number;
  phase: SheetPhase;
  children?: ReactNode;
}

function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return [w, h] as const;
}

/**
 * The sheet on screen: a paper canvas with an ink canvas multiplied on top, so the
 * ink can wash away on its own. Export draws the same layers via drawCard.
 */
const Paper = forwardRef<HTMLDivElement, Props>(function Paper({ scene, assetsVersion, pressCount, phase, children }, ref) {
  const sizeRef = useRef<HTMLDivElement>(null);
  const paperCanvas = useRef<HTMLCanvasElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useElementSize(sizeRef);

  useEffect(() => {
    if (!paperCanvas.current || !width) return;
    const [w, h] = fitCanvas(paperCanvas.current, width, height);
    drawPaper(paperCanvas.current.getContext('2d')!, w, h, scene);
    // Only the paper seed and size matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.paperSeed, width, height]);

  useEffect(() => {
    if (!inkCanvas.current || !width) return;
    const [w, h] = fitCanvas(inkCanvas.current, width, height);
    const ctx = inkCanvas.current.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    drawInk(ctx, w, h, scene);
  }, [scene, assetsVersion, width, height]);

  const shift = pressCount ? (pressCount % 2 ? styles.shiftA : styles.shiftB) : '';

  return (
    <div ref={ref} data-card className={`${styles.stage} ${styles[phase]}`}>
      <div ref={sizeRef} className={`${styles.shadow} ${shift}`}>
        <div className={styles.sheet}>
          <canvas ref={paperCanvas} className={styles.canvas} aria-hidden />
          <canvas
            ref={inkCanvas}
            className={`${styles.canvas} ${styles.ink}`}
            role="img"
            aria-label={`Card with ${scene.presses.length} prints`}
          />
          <div className={styles.wash} aria-hidden />
        </div>
      </div>
      {children}
    </div>
  );
});

export default Paper;
