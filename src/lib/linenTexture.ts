import { createCanvas } from './canvas';
import { valueNoise } from './noise';
import { seededRandom } from './random';

const cache = new Map<string, HTMLCanvasElement>();

/** Threads across the card width: about 75 per inch on a 4 in card, a fine, even linen. */
const THREADS_ACROSS = 300;
/** Never draw a thread finer than this many device pixels, so the weave stays smooth, not pixelated. */
const MIN_PITCH = 3;

/**
 * Procedural white linen: a fine, even plain weave in soft, low-contrast white, with only a
 * hint of thread-to-thread variation, so it reads as cloth without being busy.
 * Sized in device pixels and cached per size + seed, so the screen and the 1200×1800 export
 * get the same cloth.
 */
export function getLinenTexture(w: number, h: number, seed: number): HTMLCanvasElement {
  const key = `${Math.round(w)}x${Math.round(h)}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 6) cache.clear();

  const c = createCanvas(w, h);
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;
  const pitch = Math.max(MIN_PITCH, W / THREADS_ACROSS);
  const warpCount = Math.ceil(W / pitch) + 2;
  const weftCount = Math.ceil(H / pitch) + 2;

  // Slubs: noise that is independent per thread (one lattice cell per thread) and slow along it.
  const warpSlub = valueNoise(seed + 1, warpCount, 70);
  const weftSlub = valueNoise(seed + 2, weftCount, 50);
  const drift = valueNoise(seed + 3, 4, 6);
  // Threads wander a little, so the weave never looks like a printed grid.
  const wanderX = valueNoise(seed + 4, 9, 40);
  const wanderY = valueNoise(seed + 5, 40, 9);
  const rand = seededRandom(seed);
  const warpTint = Float32Array.from({ length: warpCount }, () => (rand() - 0.5) * 2.5);
  const weftTint = Float32Array.from({ length: weftCount }, () => (rand() - 0.5) * 2.5);

  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u0 = x / W;
      const fv = y / pitch + (wanderY(u0, v) - 0.5) * 0.25;
      const j = Math.max(0, Math.floor(fv));
      const tv = fv - Math.floor(fv);
      const fu = x / pitch + (wanderX(u0, v) - 0.5) * 0.25;
      const i = Math.max(0, Math.floor(fu));
      const tu = fu - Math.floor(fu);
      const u = x / W;

      const sw = warpSlub(i / warpCount, v);
      const sf = weftSlub(j / weftCount, u);
      // Both thread directions show at once; slight slubs keep it from looking printed.
      const warp = Math.pow(Math.sin(Math.PI * tu), 0.6) * (0.88 + 0.24 * sw);
      const weft = Math.pow(Math.sin(Math.PI * tv), 0.6) * (0.88 + 0.24 * sf);
      // Plain weave: whichever thread is on top in this cell reads a touch brighter.
      const onTop = (i + j) % 2 === 0 ? warp : weft;
      const weave = 0.5 * (warp + weft) + 0.12 * (onTop - 0.5);
      const streak = warpTint[i] * warp + weftTint[j] * weft + ((sw - 0.5) * warp + (sf - 0.5) * weft) * 4;

      // Bright white threads with soft, shallow gaps between them.
      const val = 233 + weave * 13 + streak + (drift(u, v) - 0.5) * 3 + (rand() - 0.5) * 2;
      const k = (y * W + x) * 4;
      d[k] = val;
      d[k + 1] = val - 0.5;
      d[k + 2] = val - 2;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  cache.set(key, c);
  return c;
}
