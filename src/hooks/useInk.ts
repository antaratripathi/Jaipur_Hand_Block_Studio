import { useCallback, useState } from 'react';
import { INKS } from '../lib/inks';

export interface BlockInk {
  color: string;
  /** 0 = dry, 1 = freshly inked. */
  level: number;
}

/** One dab of ink lasts this many presses, each fainter than the last; then the block is dry. */
export const PRESSES_PER_DAB = 5;

export function useInk() {
  const [inkId, setInkId] = useState(INKS[0].id);
  const [blocks, setBlocks] = useState<Record<string, BlockInk>>({});

  const dab = useCallback((stampId: string, color: string) => {
    setBlocks((b) => ({ ...b, [stampId]: { color, level: 1 } }));
  }, []);

  const deplete = useCallback((stampId: string) => {
    setBlocks((b) => {
      const ink = b[stampId];
      if (!ink) return b;
      const level = Math.max(0, ink.level - 1 / PRESSES_PER_DAB);
      if (level < 0.001) {
        const { [stampId]: _dry, ...rest } = b;
        return rest;
      }
      return { ...b, [stampId]: { ...ink, level } };
    });
  }, []);

  return { inkId, setInkId, blocks, dab, deplete };
}
