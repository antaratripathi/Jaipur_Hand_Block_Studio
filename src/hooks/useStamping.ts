import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Press } from '../lib/types';
import { randomSeed, seededRandom } from '../lib/random';

const PRESS_MS = 140;

interface Options {
  surfaceRef: RefObject<HTMLElement>;
  paperRef: RefObject<HTMLElement>;
  stampId: string | null;
  color: string;
  /** 0 means the block is dry and won't print. */
  inkLevel: number;
  onDry: () => void;
  onPress: (press: Press) => void;
}

/**
 * Ghost-block aiming and pressing with pointer events (mouse, touch, pen).
 * Pointer down starts aiming, moving adjusts, release presses — so a tap and a click both press,
 * and on touch you can drag to aim before letting go.
 */
export function useStamping({ surfaceRef, paperRef, stampId, color, inkLevel, onDry, onPress }: Options) {
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [pressing, setPressing] = useState(false);
  const aiming = useRef<number | null>(null);

  const rotate = useCallback((deg: number) => setRotation((r) => (r + deg + 360) % 360), []);

  const press = useCallback(
    (clientX: number, clientY: number) => {
      const paper = paperRef.current;
      if (!paper || !stampId || pressing) return;
      const rect = paper.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      // Allow the block to hang off the edge, but its centre must be over the sheet.
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      if (inkLevel <= 0) {
        onDry();
        return;
      }

      const seed = randomSeed();
      const jitter = (seededRandom(seed)() - 0.5) * 6; // ±3°
      setPressing(true);
      window.setTimeout(() => {
        onPress({ id: `p${seed.toString(36)}${Date.now().toString(36)}`, stampId, color, x, y, rotation: rotation + jitter, inkLevel, seed });
        setPressing(false);
      }, PRESS_MS);
    },
    [paperRef, stampId, pressing, rotation, color, inkLevel, onDry, onPress],
  );

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!stampId) return;
      e.preventDefault();
      rotate(e.deltaY > 0 ? 5 : -5);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [surfaceRef, stampId, rotate]);

  useEffect(() => {
    if (!stampId) setGhost(null);
  }, [stampId]);

  const handlers = {
    onPointerMove: (e: React.PointerEvent) => {
      if (!stampId) return;
      // Touch only reports movement while the finger is down.
      if (e.pointerType !== 'mouse' && aiming.current !== e.pointerId) return;
      setGhost({ x: e.clientX, y: e.clientY });
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (!stampId || e.button !== 0) return;
      aiming.current = e.pointerId;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setGhost({ x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (aiming.current !== e.pointerId) return;
      aiming.current = null;
      press(e.clientX, e.clientY);
    },
    onPointerCancel: () => {
      aiming.current = null;
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setGhost(null);
    },
  };

  return { ghost, rotation, rotate, pressing, handlers };
}
