import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Press } from '../lib/types';
import { randomSeed, seededRandom } from '../lib/random';

const PRESS_MS = 140;

interface Options {
  /** Where the block follows the pointer and the wheel rotates it. */
  areaRef: RefObject<HTMLElement>;
  /** Takes focus for keyboard aiming. */
  focusRef: RefObject<HTMLElement>;
  paperRef: RefObject<HTMLElement>;
  stampId: string | null;
  color: string;
  /** 0 means the block is dry and won't print. */
  inkLevel: number;
  reducedMotion: boolean;
  onDry: () => void;
  onPress: (press: Press) => void;
  onPutDown: () => void;
}

type Point = { x: number; y: number };

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);

const angle = (a: Point, b: Point) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

/**
 * Aiming and pressing the block.
 * - Pointer (mouse, touch, pen): down starts aiming, move adjusts, release presses — so a click
 *   and a tap both press, and on touch you can drag to aim first.
 * - Two fingers: twist to rotate the block (no press when the fingers lift).
 * - Keyboard: arrows move (Shift = bigger steps), Enter/Space press, [ ] or R rotate, Esc puts it down.
 * - Scroll wheel rotates.
 */
export function useStamping(o: Options) {
  const { areaRef, focusRef, paperRef, stampId, color, inkLevel, reducedMotion, onDry, onPress, onPutDown } = o;
  const [ghost, setGhost] = useState<Point | null>(null);
  const [rotation, setRotation] = useState(0);
  const [pressing, setPressing] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const aiming = useRef<number | null>(null);
  const twist = useRef<number | null>(null);

  const rotate = useCallback((deg: number) => setRotation((r) => (r + deg + 360) % 360), []);

  const press = useCallback(
    (clientX: number, clientY: number) => {
      const paper = paperRef.current;
      if (!paper || !stampId || pressing) return;
      const rect = paper.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      // The block may hang off the edge, but its centre must be over the sheet.
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
      }, reducedMotion ? 0 : PRESS_MS);
    },
    [paperRef, stampId, pressing, rotation, color, inkLevel, reducedMotion, onDry, onPress],
  );

  // Scroll wheel rotates the block in hand.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!stampId) return;
      e.preventDefault();
      rotate(e.deltaY > 0 ? 5 : -5);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [areaRef, stampId, rotate]);

  // Keyboard aiming, from anywhere except text fields.
  useEffect(() => {
    if (!stampId) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTextField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const rect = paperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const step = rect.width * (e.shiftKey ? 0.08 : 0.02);
      const moves: Record<string, Point> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      };
      const mv = moves[e.key];
      if (mv) {
        e.preventDefault();
        focusRef.current?.focus({ preventScroll: true });
        setGhost((g) => {
          const from = g ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          return {
            x: Math.min(rect.right, Math.max(rect.left, from.x + mv.x)),
            y: Math.min(rect.bottom, Math.max(rect.top, from.y + mv.y)),
          };
        });
      } else if (e.key === '[' || (e.key.toLowerCase() === 'r' && e.shiftKey)) {
        rotate(-15);
      } else if (e.key === ']' || e.key.toLowerCase() === 'r') {
        rotate(15);
      } else if (e.key === 'Escape') {
        onPutDown();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stampId, paperRef, focusRef, rotate, onPutDown]);

  useEffect(() => {
    if (!stampId) setGhost(null);
  }, [stampId]);

  const endPointer = (id: number) => {
    pointers.current.delete(id);
    if (pointers.current.size < 2) twist.current = null;
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (!stampId || (e.pointerType === 'mouse' && e.button !== 0)) return;
      // Aim and press only on the paper; elsewhere (tray, ink pad) clicks work as normal.
      if (!paperRef.current?.contains(e.target as Node)) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) {
        // Second finger: switch from aiming to twisting.
        aiming.current = null;
        const [a, b] = [...pointers.current.values()];
        twist.current = angle(a, b);
        return;
      }
      aiming.current = e.pointerId;
      setGhost({ x: e.clientX, y: e.clientY });
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!stampId) return;
      if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (twist.current !== null && pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const next = angle(a, b);
        rotate(((next - twist.current + 540) % 360) - 180);
        twist.current = next;
        setGhost({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        return;
      }
      // Touch and pen only report movement while down; a mouse hovers.
      if (e.pointerType !== 'mouse' && aiming.current !== e.pointerId) return;
      setGhost({ x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: React.PointerEvent) => {
      const wasAiming = aiming.current === e.pointerId;
      endPointer(e.pointerId);
      if (!wasAiming) return;
      aiming.current = null;
      press(e.clientX, e.clientY);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      endPointer(e.pointerId);
      aiming.current = null;
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setGhost(null);
    },
  };

  const focusHandlers = {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!stampId || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      const rect = paperRef.current?.getBoundingClientRect();
      const at = ghost ?? (rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
      if (!at) return;
      setGhost(at);
      press(at.x, at.y);
    },
  };

  return { ghost, rotation, rotate, pressing, handlers, focusHandlers };
}
