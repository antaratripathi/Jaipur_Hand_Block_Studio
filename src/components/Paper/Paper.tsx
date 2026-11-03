import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { drawCard, type CardScene } from '../../lib/compositor';
import { deckledClipPath } from '../../lib/paperTexture';
import { useElementSize } from '../../hooks/useElementSize';
import styles from './Paper.module.css';

interface Props {
  scene: CardScene;
  /** Changes on every press, to trigger the small paper shift. */
  pressCount: number;
}

const Paper = forwardRef<HTMLDivElement, Props>(function Paper({ scene, pressCount }, ref) {
  const sizeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useElementSize(sizeRef);
  const clip = useMemo(() => deckledClipPath(scene.paperSeed), [scene.paperSeed]);

  // Redraw only when the scene or size changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    drawCard(canvas.getContext('2d')!, w, h, scene);
  }, [scene, width, height]);

  return (
    <div ref={ref} className={styles.stage}>
      <div ref={sizeRef} className={`${styles.shadow} ${pressCount ? (pressCount % 2 ? styles.shiftA : styles.shiftB) : ''}`}>
        <div className={styles.sheet} style={{ clipPath: clip }}>
          <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={`Card with ${scene.presses.length} prints`} />
        </div>
      </div>
    </div>
  );
});

export default Paper;
