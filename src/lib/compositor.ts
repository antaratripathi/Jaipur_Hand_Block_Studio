import type { Message, Press } from './types';
import { STAMPS_BY_ID } from '../assets/stamps/stamps';
import { FONTS_BY_ID, HAND_FONTS, messageFontPx } from './fonts';
import { getPaperTexture } from './paperTexture';
import { renderImprint } from './renderImprint';

export interface CardScene {
  presses: Press[];
  paperSeed: number;
  message: Message;
}

export const LINE_HEIGHT = 1.15;

export function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  ctx.drawImage(getPaperTexture(w, h, scene.paperSeed), 0, 0, w, h);
}

/** Imprints and message, multiplied onto whatever is already in ctx (paper, or transparent on screen). */
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

  const m = scene.message;
  if (m.text.trim()) {
    const font = FONTS_BY_ID[m.fontId] ?? HAND_FONTS[0];
    const px = messageFontPx(m.text, m.fontId, m.size, w);
    const lines = m.text.split('\n');
    ctx.font = `${px}px ${font.family}`;
    ctx.fillStyle = m.color;
    ctx.globalAlpha = 0.9;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const top = m.y * h - ((lines.length - 1) * px * LINE_HEIGHT) / 2;
    lines.forEach((line, i) => ctx.fillText(line, m.x * w, top + i * px * LINE_HEIGHT));
  }
  ctx.restore();
}

/** The full card, used for export. */
export function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number, scene: CardScene): void {
  drawPaper(ctx, w, h, scene);
  drawInk(ctx, w, h, scene);
}
