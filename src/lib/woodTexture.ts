import { createCanvas } from './canvas';
import { valueNoise } from './noise';
import { seededRandom } from './random';

let cached: string | null = null;

/**
 * A procedural wood-grain tile (wavy horizontal grain, like a planed block face).
 * Returned as a data URL to use as a CSS background, so every block shares one texture.
 */
export function woodTextureURL(): string {
  if (cached) return cached;
  const S = 256;
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(S, S);
  const d = img.data;
  const warp = valueNoise(11, 3, 5);
  const fine = valueNoise(12, 48, 10);
  const rand = seededRandom(13);
  const light = [204, 150, 96];
  const dark = [150, 96, 54];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const w = warp(u, v) * 1.6 + fine(u, v) * 0.25;
      // Fine grain lines: a sharpened sine so dark lines are thin, over gentle colour drift.
      const band = Math.sin((v * 30 + w) * Math.PI * 2);
      const line = Math.pow(Math.max(0, band), 10);
      const t = Math.min(1, line * 0.55 + warp(u, v) * 0.25 + fine(u, v) * 0.15 + (rand() - 0.5) * 0.08);
      const i = (y * S + x) * 4;
      d[i] = light[0] + (dark[0] - light[0]) * t;
      d[i + 1] = light[1] + (dark[1] - light[1]) * t;
      d[i + 2] = light[2] + (dark[2] - light[2]) * t;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  cached = c.toDataURL('image/png');
  return cached;
}
