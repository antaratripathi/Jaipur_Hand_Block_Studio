// Stamp block library. Swap in your own artwork here:
//   - svgPath: path data drawn in a 100×100 viewBox (even-odd fill, so inner shapes cut out)
//   - pngMask: or a URL to a PNG (e.g. import leaf from './leaf.png') whose alpha is the carved face
//   - defaultSize: printed width as a fraction of the card width
import type { StampDef } from '../../lib/types';
import { circle, ellipse, polygon, rays, waveBand } from '../../lib/svgShapes';

const flowerPetals = Array.from({ length: 6 }, (_, i) => {
  const deg = i * 60 - 90;
  const a = (deg * Math.PI) / 180;
  return ellipse(50 + Math.cos(a) * 29, 50 + Math.sin(a) * 29, 16, 9.5, deg);
}).join('');

const dotCluster = [
  [50, 50, 8], [50, 30, 6.5], [50, 70, 6.5], [32.7, 40, 6.5], [67.3, 40, 6.5],
  [32.7, 60, 6.5], [67.3, 60, 6.5], [50, 12, 4], [50, 88, 4], [17, 30, 4],
  [83, 30, 4], [17, 70, 4], [83, 70, 4],
].map(([x, y, r]) => circle(x, y, r)).join('');

export const STAMPS: StampDef[] = [
  {
    id: 'leaf',
    name: 'Leaf',
    defaultSize: 0.3,
    svgPath:
      'M50 5C80 22 88 60 50 95C12 60 20 22 50 5Z' +
      'M48.5 18L48.5 90L51.5 90L51.5 18Z' +
      polygon([[51.5, 40], [70, 28], [71, 31], [51.5, 44]]) +
      polygon([[48.5, 40], [30, 28], [29, 31], [48.5, 44]]) +
      polygon([[51.5, 60], [72, 47], [73, 50], [51.5, 64]]) +
      polygon([[48.5, 60], [28, 47], [27, 50], [48.5, 64]]),
  },
  {
    id: 'sun',
    name: 'Sun',
    defaultSize: 0.32,
    svgPath: circle(50, 50, 22) + circle(50, 50, 15) + circle(50, 50, 7) + rays(50, 50, 26, 47, 14, 6),
  },
  {
    id: 'paisley',
    name: 'Paisley',
    defaultSize: 0.3,
    svgPath:
      'M42 92C14 88 8 54 28 36C44 22 66 26 70 6C90 30 92 64 72 82C64 89 54 93 42 92Z' +
      'M44 82C26 80 22 60 34 48C44 40 58 40 66 30C76 48 74 66 64 74C58 79 52 82 44 82Z' +
      circle(48, 62, 9) + circle(48, 62, 4),
  },
  {
    id: 'bird',
    name: 'Bird',
    defaultSize: 0.34,
    svgPath:
      'M10 60C22 44 42 40 57 46C61 34 71 28 81 30L93 25L86 36C88 53 76 70 56 72L40 87L42 72C29 72 17 68 10 60Z' +
      circle(79, 36, 2.6) +
      'M38 54C48 49 60 51 65 60C54 63 45 61 38 54Z',
  },
  {
    id: 'flower',
    name: 'Flower',
    defaultSize: 0.3,
    svgPath: flowerPetals + circle(50, 50, 10) + circle(50, 50, 4.5),
  },
  {
    id: 'border',
    name: 'Geometric border',
    defaultSize: 0.34,
    svgPath:
      polygon([[5, 5], [95, 5], [95, 95], [5, 95]]) +
      polygon([[14, 14], [86, 14], [86, 86], [14, 86]]) +
      polygon([[50, 20], [80, 50], [50, 80], [20, 50]]) +
      polygon([[50, 32], [68, 50], [50, 68], [32, 50]]) +
      polygon([[50, 42], [58, 50], [50, 58], [42, 50]]) +
      circle(22, 22, 3) + circle(78, 22, 3) + circle(22, 78, 3) + circle(78, 78, 3),
  },
  {
    id: 'dots',
    name: 'Dot cluster',
    defaultSize: 0.26,
    svgPath: dotCluster,
  },
  {
    id: 'wave',
    name: 'Wave',
    defaultSize: 0.36,
    svgPath: waveBand(26, 7, 9) + waveBand(50, 7, 9) + waveBand(74, 7, 9),
  },
];

export const STAMPS_BY_ID: Record<string, StampDef> = Object.fromEntries(STAMPS.map((s) => [s.id, s]));
