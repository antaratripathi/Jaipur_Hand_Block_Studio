export interface StampDef {
  id: string;
  name: string;
  /** Width of the printed block as a fraction of the card width. */
  defaultSize: number;
  /** SVG path data in a 100×100 viewBox, filled with the even-odd rule. */
  svgPath?: string;
  /** Alternatively, a URL to a PNG whose alpha channel is the carved face. */
  pngMask?: string;
}

export interface InkColor {
  id: string;
  name: string;
  hex: string;
}

/** One press of a block on the sheet. Coordinates are fractions of the card (0–1). */
export interface Press {
  id: string;
  stampId: string;
  color: string;
  x: number;
  y: number;
  /** Degrees. */
  rotation: number;
  /** 0–1, how much ink was on the block at the moment of pressing. */
  inkLevel: number;
  seed: number;
}
