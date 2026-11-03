import { createCanvas } from './canvas';
import { valueNoise } from './noise';
import { seededRandom } from './random';

const cache = new Map<string, HTMLCanvasElement>();

/** Threads across the card width: about 65 per inch on a 4 in card, like a mid-weight linen. */
const THREADS_ACROSS = 260;

/**
 * Procedural white linen: a plain over-under weave whose threads vary in thickness and tone
 * along their length (slubs), with soft shading where threads dip under each other, faint
 * flax flecks and gentle colour drift. Sized in device pixels and cached per size + seed,
 * so the screen and the 1200×1800 export get the same cloth.
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
  const pitch = Math.max(2, W / THREADS_ACROSS);
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
  const warpTint = Float32Array.from({ length: warpCount }, () => (rand() - 0.5) * 4);
  const weftTint = Float32Array.from({ length: weftCount }, () => (rand() - 0.5) * 4);

  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u0 = x / W;
      const fv = y / pitch + (wanderY(u0, v) - 0.5) * 0.7;
      const j = Math.max(0, Math.floor(fv));
      const tv = fv - Math.floor(fv);
      const fu = x / pitch + (wanderX(u0, v) - 0.5) * 0.7;
      const i = Math.max(0, Math.floor(fu));
      const tu = fu - Math.floor(fu);
      const u = x / W;

      const sw = warpSlub(i / warpCount, v);
      const sf = weftSlub(j / weftCount, u);
      // Both thread directions show at once; slubs make a thread fatter and paler along a stretch.
      const warp = Math.pow(Math.sin(Math.PI * tu), 0.8) * (0.7 + 0.6 * sw);
      const weft = Math.pow(Math.sin(Math.PI * tv), 0.8) * (0.7 + 0.6 * sf);
      // Plain weave: whichever thread is on top in this cell reads a touch brighter.
      const onTop = (i + j) % 2 === 0 ? warp : weft;
      const weave = 0.5 * (warp + weft) + 0.2 * (onTop - 0.5);
      const streak = warpTint[i] * warp + weftTint[j] * weft + ((sw - 0.5) * warp + (sf - 0.5) * weft) * 14;

      let val = 228 + weave * 20 + streak + (drift(u, v) - 0.5) * 6 + (rand() - 0.5) * 4;
      // Occasional darker flax fleck in a thick slub.
      const slub = Math.max(sw * warp, sf * weft);
      const fleck = slub > 0.92 ? (slub - 0.92) * 120 : 0;
      val -= fleck;
      const k = (y * W + x) * 4;
      d[k] = val;
      d[k + 1] = val - 1.5 - fleck * 0.15;
      d[k + 2] = val - 6 - fleck * 0.4;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  cache.set(key, c);
  return c;
}

/** A slightly uneven, finely frayed edge (in %) for the cloth's clip-path on screen. */
export function frayedClipPath(seed: number): string {
  const rand = seededRandom(seed ^ 0x11ce);
  const pts: string[] = [];
  const edge = (n: number, depth: number, fn: (t: number, j: number) => [number, number]) => {
    const phase = rand() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const wave = (Math.sin(t * Math.PI * 3 + phase) * 0.5 + 0.5) * 0.25;
      const fray = rand() < 0.15 ? rand() * 0.5 : rand() * 0.12;
      const [x, y] = fn(t, Math.min(1, wave + fray) * depth);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
  };
  edge(140, 0.5, (t, j) => [t * 100, j * 0.67]); // top
  edge(200, 0.75, (t, j) => [100 - j, t * 100]); // right
  edge(140, 0.5, (t, j) => [100 - t * 100, 100 - j * 0.67]); // bottom
  edge(200, 0.75, (t, j) => [j, 100 - t * 100]); // left
  return `polygon(${pts.join(',')})`;
}
