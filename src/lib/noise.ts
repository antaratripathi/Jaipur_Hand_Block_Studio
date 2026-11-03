import { seededRandom } from './random';

/** Smooth 2D value noise over a cellsX × cellsY lattice; sample with u, v in 0–1. Returns 0–1. */
export function valueNoise(seed: number, cellsX: number, cellsY = cellsX) {
  const rand = seededRandom(seed);
  const w = cellsX + 1;
  const grid = new Float32Array(w * (cellsY + 1));
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = Math.min(u, 0.9999) * cellsX;
    const y = Math.min(v, 0.9999) * cellsY;
    const xi = x | 0;
    const yi = y | 0;
    const tx = fade(x - xi);
    const ty = fade(y - yi);
    const i = yi * w + xi;
    const a = grid[i] + (grid[i + 1] - grid[i]) * tx;
    const b = grid[i + w] + (grid[i + w + 1] - grid[i + w]) * tx;
    return a + (b - a) * ty;
  };
}
