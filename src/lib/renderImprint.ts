import type { Press, StampDef } from './types';
import { createCanvas } from './canvas';
import { getStampMask } from './stampMask';
import { valueNoise } from './noise';
import { seededRandom } from './random';

const cache = new Map<string, HTMLCanvasElement>();

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Soft-edged copy of the mask (down- then up-scaled), used to find the rim of the carving. */
function blurredAlpha(mask: HTMLCanvasElement, px: number): Uint8ClampedArray {
  const small = createCanvas(Math.max(4, px / 8), Math.max(4, px / 8));
  const sctx = small.getContext('2d')!;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(mask, 0, 0, small.width, small.height);
  const big = createCanvas(px, px);
  const bctx = big.getContext('2d')!;
  bctx.imageSmoothingQuality = 'high';
  bctx.drawImage(small, 0, 0, px, px);
  return bctx.getImageData(0, 0, px, px).data;
}

/**
 * Renders one block-printed imprint at `size` px:
 * - patchy coverage from layered seeded noise (blotches, wood-grain streaks, fine grain, pinholes)
 * - ink pooling and darkening at the rim of the carving
 * - fainter and gappier as the block's ink level drops
 * Deterministic per press, so it's cached by press id + size.
 */
export function renderImprint(press: Press, def: StampDef, size: number): HTMLCanvasElement | null {
  const px = Math.round(size);
  const key = `${press.id}:${px}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const mask = getStampMask(def, px);
  if (!mask) return null;

  const rand = seededRandom(press.seed);
  const blotch = valueNoise(press.seed + 1, 5);
  const mid = valueNoise(press.seed + 2, 16);
  const streak = valueNoise(press.seed + 3, 3, 36); // wood grain of the block face
  const baseOpacity = 0.8 + rand() * 0.15;
  const ink = press.inkLevel;
  const threshold = 0.2 + (1 - ink) * 0.42;
  const [r, g, b] = hexToRgb(press.color);

  const mctx = mask.getContext('2d')!;
  const A = mctx.getImageData(0, 0, px, px).data;
  const B = blurredAlpha(mask, px);

  const c = createCanvas(px, px);
  const ctx = c.getContext('2d')!;
  const out = ctx.createImageData(px, px);
  const d = out.data;

  for (let y = 0; y < px; y++) {
    const v = y / px;
    for (let x = 0; x < px; x++) {
      const i = (y * px + x) * 4;
      const a = A[i + 3];
      if (a === 0) continue;
      const u = x / px;
      const edge = Math.min(1, Math.max(0, (1 - B[i + 3] / 255) * 2.2));
      const m = mid(u, v);
      const grain = rand();
      let cov = 0.45 * blotch(u, v) + 0.3 * m + 0.25 * streak(u, v) + (grain - 0.5) * 0.35 + edge * 0.3;
      let alpha = smoothstep(threshold - 0.07, threshold + 0.07, cov);
      if (grain > 0.985) alpha *= 0.15; // pinholes where ink didn't take
      alpha *= (a / 255) * baseOpacity * (0.5 + 0.5 * ink) * (0.85 + 0.15 * m);
      if (alpha <= 0.004) continue;
      const shade = 1 - 0.32 * edge - 0.08 * (1 - m);
      d[i] = r * shade;
      d[i + 1] = g * shade;
      d[i + 2] = b * shade;
      d[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(out, 0, 0);

  if (cache.size > 400) cache.clear();
  cache.set(key, c);
  return c;
}
