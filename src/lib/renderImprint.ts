import type { Press, StampDef } from './types';
import { createCanvas } from './canvas';
import { getStampMask } from './stampMask';

const cache = new Map<string, HTMLCanvasElement>();

/**
 * Renders a single imprint (ink coloured, alpha-masked by the stamp) at `size` px.
 * Deterministic per press id + size, so it's cached.
 */
export function renderImprint(press: Press, def: StampDef, size: number): HTMLCanvasElement | null {
  const px = Math.round(size);
  const key = `${press.id}:${px}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const mask = getStampMask(def, px);
  if (!mask) return null;

  const c = createCanvas(px, px);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = press.color;
  ctx.fillRect(0, 0, px, px);

  cache.set(key, c);
  return c;
}

export function forgetImprints(keep: Set<string>): void {
  for (const key of cache.keys()) {
    if (!keep.has(key.split(':')[0])) cache.delete(key);
  }
}
