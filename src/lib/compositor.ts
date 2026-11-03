import type { Message, Press } from './types';
import { STAMPS_BY_ID } from '../assets/stamps/stamps';
import { LINE_HEIGHT, MESSAGE_WIDTH, messageFont, wrapLines } from './fonts';
import { getPaperTexture } from './paperTexture';
import { renderImprint } from './renderImprint';

export interface CardScene {
  presses: Press[];
  paperSeed: number;
  message: Message;
}

export function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  ctx.drawImage(getPaperTexture(w, h, scene.paperSeed), 0, 0, w, h);
}

/**
 * Imprints (and optionally the message), multiplied onto whatever is already in ctx.
 * On screen the message is a live textarea instead, so it is left out there.
 */
export function drawInk(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene, withMessage = true): void {
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

  const m = scene.message;
  if (withMessage && m.text.trim()) {
    const font = messageFont(m.fontId, m.size, w);
    ctx.font = font.css;
    ctx.fillStyle = m.color;
    ctx.globalAlpha = 0.92;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const lineH = font.px * LINE_HEIGHT;
    wrapLines(ctx, m.text, MESSAGE_WIDTH * w).forEach((line, i) =>
      ctx.fillText(line, m.x * w, m.y * h + lineH * (i + 0.5)),
    );
  }
  ctx.restore();
}

/** The full card, used for export. */
export function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  drawPaper(ctx, w, h, scene);
  drawInk(ctx, w, h, scene);
}
