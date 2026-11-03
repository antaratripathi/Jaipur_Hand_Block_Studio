import { createCanvas } from './canvas';
import { drawCard, type CardScene } from './compositor';

/** 4×6 in at 300 dpi. */
export const EXPORT_W = 1200;
export const EXPORT_H = 1800;

function renderExport(scene: CardScene): HTMLCanvasElement {
  const c = createCanvas(EXPORT_W, EXPORT_H);
  drawCard(c.getContext('2d')!, EXPORT_W, EXPORT_H, scene);
  return c;
}

function save(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadPNG(scene: CardScene): Promise<void> {
  const canvas = renderExport(scene);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        save(url, 'block-print-card.png');
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      resolve();
    }, 'image/png');
  });
}
