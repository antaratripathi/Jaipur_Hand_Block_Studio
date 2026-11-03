export interface HandFont {
  id: string;
  name: string;
  family: string;
  /** Evens out how large each face looks at the same font size. */
  scale: number;
}

export const HAND_FONTS: HandFont[] = [
  { id: 'serif', name: 'Serif', family: '"Fraunces", Georgia, serif', scale: 1 },
  { id: 'hand', name: 'Hand', family: '"Caveat", cursive', scale: 1.3 },
  { id: 'script', name: 'Script', family: '"Homemade Apple", cursive', scale: 0.8 },
];

export const FONTS_BY_ID: Record<string, HandFont> = Object.fromEntries(HAND_FONTS.map((f) => [f.id, f]));

/** Message text box: width as a fraction of the card, and line height. */
export const MESSAGE_WIDTH = 0.84;
export const LINE_HEIGHT = 1.3;

/** Resolves once all message fonts are ready for canvas drawing. */
export function loadHandFonts(): Promise<void> {
  if (!document.fonts) return Promise.resolve();
  return Promise.all(HAND_FONTS.map((f) => document.fonts.load(`300 48px ${f.family}`)))
    .then(() => undefined)
    .catch(() => undefined);
}

export function messageFont(fontId: string, size: number, cardWidth: number) {
  const font = FONTS_BY_ID[fontId] ?? HAND_FONTS[0];
  const px = size * font.scale * cardWidth;
  const weight = font.id === 'serif' ? 300 : 400;
  return { px, css: `${weight} ${px}px ${font.family}`, family: font.family, weight };
}

/** Greedy word wrap that matches how the on-card textarea wraps. */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/(\s+)/);
    let line = '';
    for (const word of words) {
      const next = line + word;
      if (line && ctx.measureText(next.trimEnd()).width > maxWidth && word.trim()) {
        out.push(line.trimEnd());
        line = word;
      } else {
        line = next;
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}
