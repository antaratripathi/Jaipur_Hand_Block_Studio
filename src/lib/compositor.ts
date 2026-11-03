import type { Press } from './types';
import { STAMPS_BY_ID } from '../assets/stamps/stamps';
import { getPaperTexture } from './paperTexture';
import { renderImprint } from './renderImprint';

export interface CardScene {
  presses: Press[];
  paperSeed: number;
}

/** Draws the full card (paper + imprints) into ctx at w×h device pixels. Used for screen and export. */
export function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.drawImage(getPaperTexture(w, h, scene.paperSeed), 0, 0, w, h);

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
