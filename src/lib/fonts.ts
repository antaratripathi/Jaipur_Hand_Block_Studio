export interface HandFont {
  id: string;
  name: string;
  family: string;
  /** Evens out how large each face looks at the same font size. */
  scale: number;
}

export const HAND_FONTS: HandFont[] = [
  { id: 'caveat', name: 'Caveat', family: '"Caveat", cursive', scale: 1 },
  { id: 'kalam', name: 'Kalam', family: '"Kalam", cursive', scale: 0.8 },
  { id: 'apple', name: 'Homemade Apple', family: '"Homemade Apple", cursive', scale: 0.62 },
];

export const FONTS_BY_ID: Record<string, HandFont> = Object.fromEntries(HAND_FONTS.map((f) => [f.id, f]));

/** Resolves once all handwriting fonts are ready for canvas drawing. */
export function loadHandFonts(): Promise<void> {
  if (!document.fonts) return Promise.resolve();
  return Promise.all(HAND_FONTS.map((f) => document.fonts.load(`48px ${f.family}`)))
    .then(() => undefined)
    .catch(() => undefined);
}

let measureCtx: CanvasRenderingContext2D | null = null;

/** Font size in px for a message on a card `cardWidth` px wide, shrunk so the widest line fits. */
export function messageFontPx(text: string, fontId: string, size: number, cardWidth: number): number {
  const font = FONTS_BY_ID[fontId] ?? HAND_FONTS[0];
  let px = size * font.scale * cardWidth;
  measureCtx ??= document.createElement('canvas').getContext('2d');
  if (!measureCtx || !px) return px;
  measureCtx.font = `${px}px ${font.family}`;
  const widest = Math.max(...text.split('\n').map((l) => measureCtx!.measureText(l).width));
  const max = cardWidth * 0.88;
  if (widest > max) px *= max / widest;
  return px;
}
