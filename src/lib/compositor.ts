import type { Press } from './types';
import { STAMPS_BY_ID } from '../assets/stamps/stamps';
import { getLinenTexture } from './linenTexture';
import { renderImprint } from './renderImprint';

export interface CardScene {
  presses: Press[];
  paperSeed: number;
}

export function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  ctx.drawImage(getLinenTexture(w, h, scene.paperSeed), 0, 0, w, h);
}

/** Imprints, multiplied onto whatever is already in ctx (paper, or transparent on screen). */
export function drawInk(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  for (const press of scene.presses) {
    const def = STAMPS_BY_ID[press.stampId];
    if (!def) continue;
    const size = def.defaultSize * w;
    const imprint = renderImprint(press, def, size);
    if (!imprint) continue;
    ctx.save();
    ctx.translate(press.x * w, press.y * h);
    ctx.rotate((press.rotation * Math.PI) / 180);
    ctx.drawImage(imprint, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  ctx.restore();
}

/** The full card, used for export. */
export function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  drawPaper(ctx, w, h, scene);
  drawInk(ctx, w, h, scene);
}
