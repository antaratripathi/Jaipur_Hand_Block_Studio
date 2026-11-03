import { createCanvas } from './canvas';
import { seededRandom } from './random';

const cache = new Map<string, HTMLCanvasElement>();

/**
 * Procedural handmade paper: warm base, soft cloudy mottling, fine grain and
 * scattered fibres. Sized in device pixels; cached per size + seed.
 */
export function getPaperTexture(w: number, h: number, seed: number): HTMLCanvasElement {
  const key = `${Math.round(w)}x${Math.round(h)}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 6) cache.clear();

  const rand = seededRandom(seed);
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d')!;
  const W = c.width;
  const H = c.height;

  ctx.fillStyle = '#f4ecdc';
  ctx.fillRect(0, 0, W, H);

  // Cloudy mottling: a tiny random canvas scaled up smoothly.
  const m = createCanvas(12, 18);
  const mctx = m.getContext('2d')!;
  const md = mctx.createImageData(m.width, m.height);
  for (let i = 0; i < md.data.length; i += 4) {
    const v = rand();
    md.data[i] = 200 + v * 40;
    md.data[i + 1] = 180 + v * 40;
    md.data[i + 2] = 150 + v * 40;
    md.data[i + 3] = 34;
  }
  mctx.putImageData(md, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(m, 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  // Fine grain.
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n * 0.9;
  }
  ctx.putImageData(img, 0, 0);

  // Fibres: short, faint curved strokes, some lighter, some darker.
  const scale = W / 1200;
  const fibres = Math.round(900 * (W * H) / (1200 * 1800)) + 60;
  ctx.lineCap = 'round';
  for (let i = 0; i < fibres; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const len = (6 + rand() * 26) * scale;
    const a = rand() * Math.PI * 2;
    const bend = (rand() - 0.5) * len;
    const dark = rand() < 0.6;
    ctx.strokeStyle = dark ? `rgba(120, 95, 60, ${0.06 + rand() * 0.1})` : `rgba(255, 252, 240, ${0.25 + rand() * 0.3})`;
    ctx.lineWidth = (0.4 + rand() * 0.9) * scale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 - Math.sin(a) * bend,
      y + Math.sin(a) * len * 0.5 + Math.cos(a) * bend,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    ctx.stroke();
  }

  // Slightly warmer, darker edges like handmade sheets.
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(150, 115, 70, 0.14)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  cache.set(key, c);
  return c;
}

/** A jittered polygon (in %) used as the paper's deckled clip-path on screen. */
export function deckledClipPath(seed: number): string {
  const rand = seededRandom(seed ^ 0x5eed);
  const pts: string[] = [];
  const edge = (n: number, fn: (t: number, j: number) => [number, number]) => {
    for (let i = 0; i < n; i++) {
      const j = rand() * 0.9;
      const [x, y] = fn(i / n, j);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
  };
  edge(40, (t, j) => [t * 100, j * 0.67]); // top
  edge(60, (t, j) => [100 - j, t * 100]); // right
  edge(40, (t, j) => [100 - t * 100, 100 - j * 0.67]); // bottom
  edge(60, (t, j) => [j, 100 - t * 100]); // left
  return `polygon(${pts.join(',')})`;
}
