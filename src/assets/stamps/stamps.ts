// Stamp block library. Swap in your own artwork here:
//   - pngMask: a PNG whose alpha is the carved face (square, transparent background; opaque parts print)
//   - svgPath: or path data in a 100×100 viewBox; overlapping shapes merge into one carved face
//   - cut: optional path carved back out of an svgPath face (eyes, veins, highlights)
//   - defaultSize: printed size as a fraction of the card width. Finer, more intricate designs
//     get a larger size so their detail still reads on the card.
//
// The PNGs were made from line art with a dark-ink-to-alpha conversion, cropped and centred on a square.
import type { StampDef } from '../../lib/types';
import flower from './flower.png';
import pomegranate from './pomegranate.png';
import lotus from './lotus.png';
import paisley from './paisley.png';
import horse from './horse.png';

export const STAMPS: StampDef[] = [
  { id: 'flower', name: 'Flower', defaultSize: 0.162, pngMask: flower },
  { id: 'pomegranate', name: 'Pomegranate', defaultSize: 0.28, pngMask: pomegranate },
  { id: 'lotus', name: 'Lotus', defaultSize: 0.52, pngMask: lotus },
  { id: 'paisley', name: 'Paisley', defaultSize: 0.3, pngMask: paisley },
  { id: 'horse', name: 'Horse', defaultSize: 0.3, pngMask: horse },
];

export const STAMPS_BY_ID: Record<string, StampDef> = Object.fromEntries(STAMPS.map((s) => [s.id, s]));
