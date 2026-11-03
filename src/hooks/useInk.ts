import { useCallback, useState } from 'react';
import { INKS } from '../lib/inks';

export interface BlockInk {
  color: string;
  /** 0 = dry, 1 = freshly inked. */
  level: number;
}

/** Each press uses up some ink, so later prints fade until the block is re-inked. */
const DEPLETION = 0.8;
const MIN_LEVEL = 0.12;

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
      return { ...b, [stampId]: { ...ink, level: Math.max(MIN_LEVEL, ink.level * DEPLETION) } };
    });
  }, []);

  return { inkId, setInkId, blocks, dab, deplete };
}
