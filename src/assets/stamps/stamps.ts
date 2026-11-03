// Stamp block library. Swap in your own artwork here:
//   - svgPath: path data in a 100×100 viewBox; overlapping shapes merge into one carved face
//   - cut: optional path carved back out of the face (eyes, veins, highlights)
//   - pngMask: or a URL to a PNG (e.g. import lotus from './lotus.png') whose alpha is the carved face
//   - defaultSize: printed width as a fraction of the card width
import type { StampDef } from '../../lib/types';
import { circle, crescent, ellipse, polygon, roundRect } from '../../lib/svgShapes';

const dots = (...pts: [number, number, number][]) => pts.map(([x, y, r]) => circle(x, y, r)).join('');

export const STAMPS: StampDef[] = [
  {
    id: 'sprig',
    name: 'Flower sprig',
    defaultSize: 0.3,
    svgPath:
      'M50 12C54.5 22 54.5 34 50 44C45.5 34 45.5 22 50 12Z' +
      'M49 45C39 43 31 35 28 22C37 26 44 33 49 45Z' +
      'M51 45C61 43 69 35 72 22C63 26 56 33 51 45Z' +
      roundRect(48.4, 42, 3.2, 46, 1.6) +
      'M48.6 72C39 72 30 66 25 55C35 56 43 61 48.6 67Z' +
      'M51.4 63C61 63 70 57 75 46C65 47 57 52 51.4 58Z' +
      dots([27, 82, 2.2], [73, 80, 2], [20, 36, 1.6], [80, 34, 1.6], [64, 90, 1.4]),
    cut: crescent(50, 18, 40, 1.5, 1.6) + 'M31 58C37 61 42 64 46 68L46 69.5C41 66 36 62 31 58Z' + 'M69 49C63 52 58 55 54 59L54 60.5C59 57 64 53 69 49Z',
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    defaultSize: 0.3,
    svgPath:
      ellipse(44, 66, 24, 17, -8) +
      circle(66, 46, 12) +
      ellipse(60, 24, 4.6, 14, -12) +
      ellipse(70, 25, 4.6, 14, 10) +
      circle(21, 61, 6) +
      ellipse(63, 81, 8, 3.6, 0) +
      ellipse(35, 81, 13, 3.8, 0) +
      dots([86, 74, 2], [90, 63, 1.4], [14, 38, 1.8], [22, 30, 1.2]),
    cut: circle(70.5, 44, 2.1) + circle(77, 50, 1.3) + 'M30 64C34 56 44 54 50 60C44 58 36 59 30 64Z' + ellipse(60.5, 24, 1.3, 9, -12),
  },
  {
    id: 'fish',
    name: 'Fish',
    defaultSize: 0.32,
    svgPath:
      'M12 50C26 30 58 28 76 50C58 72 26 70 12 50Z' +
      polygon([[72, 50], [92, 33], [86, 50], [92, 67]]) +
      'M36 35C42 24 54 23 62 33Z' +
      'M40 65C46 73 54 73 58 67Z' +
      dots([6, 36, 2.2], [11, 27, 1.5], [16, 20, 1.1]),
    cut:
      circle(24, 47, 2.6) +
      crescent(32, 38, 62, 7, 2.2) +
      crescent(44, 37, 63, 6, 1.6) +
      crescent(54, 38, 62, 5, 1.4) +
      crescent(63, 41, 59, 4, 1.2),
  },
  {
    id: 'lemons',
    name: 'Lemons',
    defaultSize: 0.3,
    svgPath:
      // two plump lemons with pointed tips
      ellipse(34, 64, 21, 15, -22) +
      circle(14.4, 72, 3.4) +
      circle(53.6, 56, 2.8) +
      ellipse(68, 70, 18, 13.5, 18) +
      circle(50.8, 64.4, 2.4) +
      circle(85.2, 75.6, 3.2) +
      // short stems up to a leafy branch
      polygon([[46, 52], [49, 52], [51, 40], [48, 40]]) +
      polygon([[64, 58], [67, 58], [62, 39], [59, 39]]) +
      polygon([[24, 41], [25, 43.5], [82, 32], [81, 29.5]]) +
      ellipse(36, 30, 14, 6, -30) +
      ellipse(74, 21, 13, 5.5, 20) +
      ellipse(58, 26, 9, 4, -70) +
      dots([10, 44, 1.8], [90, 48, 1.6], [86, 90, 1.8], [16, 90, 1.4]),
    cut: ellipse(27, 58, 6, 2.4, -22) + ellipse(64, 64, 5, 2.2, 18),
  },
  {
    id: 'elephant',
    name: 'Elephant',
    defaultSize: 0.34,
    svgPath:
      ellipse(44, 54, 28, 19, 0) +
      circle(71, 46, 15) +
      'M80 50C90 56 91 70 85 80L80.5 78C85 69 84 61 76 56Z' +
      roundRect(24, 62, 9, 24, 3) +
      roundRect(36, 66, 9, 20, 3) +
      roundRect(52, 66, 9, 20, 3) +
      roundRect(63, 60, 9, 26, 3) +
      polygon([[17, 50], [19, 51], [13, 64], [11, 63]]) +
      dots([12, 30, 1.8], [20, 22, 1.3], [88, 26, 1.6]),
    cut:
      'M64 36C55 42 55 54 64 60C60 52 60 44 64 36Z' +
      circle(76, 42, 2) +
      dots([34, 46, 2.2], [43, 42, 2.2], [52, 46, 2.2], [43, 51, 1.8], [34, 55, 1.6], [52, 55, 1.6]),
  },
];

export const STAMPS_BY_ID: Record<string, StampDef> = Object.fromEntries(STAMPS.map((s) => [s.id, s]));
