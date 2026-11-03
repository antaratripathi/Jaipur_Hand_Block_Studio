// Helpers that build SVG path strings for the placeholder motifs (100×100 viewBox).

const f = (n: number) => n.toFixed(2);

export function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

/** Ellipse centred at (cx, cy), major axis rotated by `deg`. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a) * rx;
  const dy = Math.sin(a) * rx;
  return `M${f(cx - dx)} ${f(cy - dy)}A${rx} ${ry} ${deg} 1 0 ${f(cx + dx)} ${f(cy + dy)}A${rx} ${ry} ${deg} 1 0 ${f(cx - dx)} ${f(cy - dy)}Z`;
}

export function polygon(points: [number, number][]): string {
  return 'M' + points.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

/** A ring of `count` triangular rays between radii r1 and r2. */
export function rays(cx: number, cy: number, r1: number, r2: number, count: number, halfWidthDeg: number): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const w = (halfWidthDeg * Math.PI) / 180;
    d += polygon([
      [cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1],
      [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2],
      [cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1],
    ]);
  }
  return d;
}

/** A horizontal wavy band from x0 to x1, centred on y. */
export function waveBand(y: number, amp: number, thickness: number, x0 = 6, x1 = 94, cycles = 2): string {
  const steps = 48;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const yy = y + Math.sin((i / steps) * Math.PI * 2 * cycles) * amp;
    top.push([x, yy - thickness / 2]);
    bottom.unshift([x, yy + thickness / 2]);
  }
  return polygon([...top, ...bottom]);
}
