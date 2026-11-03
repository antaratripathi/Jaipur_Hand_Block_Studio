import type { StampDef } from './types';
import { createCanvas } from './canvas';
import { subpaths } from './svgShapes';

const pngImages = new Map<string, HTMLImageElement>();
const maskCache = new Map<string, HTMLCanvasElement>();

/** Loads any PNG masks in the library. SVG masks are ready immediately. */
export function preloadStampMasks(stamps: StampDef[]): Promise<void> {
  const loads = stamps
    .filter((s) => s.pngMask && !pngImages.has(s.id))
    .map(
      (s) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            pngImages.set(s.id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = s.pngMask!;
        }),
    );
  return Promise.all(loads).then(() => undefined);
}

/** A square white-on-transparent mask of the carved face at `size` px. */
export function getStampMask(def: StampDef, size: number): HTMLCanvasElement | null {
  const px = Math.max(8, Math.round(size));
  const key = `${def.id}:${px}`;
  const cached = maskCache.get(key);
  if (cached) return cached;

  const c = createCanvas(px, px);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  if (def.svgPath) {
    ctx.scale(px / 100, px / 100);
    for (const d of subpaths(def.svgPath)) ctx.fill(new Path2D(d));
    if (def.cut) {
      ctx.globalCompositeOperation = 'destination-out';
      for (const d of subpaths(def.cut)) ctx.fill(new Path2D(d));
    }
  } else if (def.pngMask) {
    const img = pngImages.get(def.id);
    if (!img) return null;
    ctx.drawImage(img, 0, 0, px, px);
  } else {
    return null;
  }
  maskCache.set(key, c);
  return c;
}
