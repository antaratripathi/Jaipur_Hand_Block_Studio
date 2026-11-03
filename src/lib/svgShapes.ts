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

/** Rounded rectangle. */
export function roundRect(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** A thin crescent between two arcs, handy for carved detail lines. */
export function crescent(x: number, y0: number, y1: number, bulge: number, thickness: number): string {
  const mid = (y0 + y1) / 2;
  return `M${x} ${y0}Q${x + bulge} ${mid} ${x} ${y1}Q${x + bulge - thickness} ${mid} ${x} ${y0}Z`;
}

/**
 * Splits path data into its subpaths (each starts with an absolute M), so they can be
 * filled one by one and always merge, whatever direction each shape was drawn in.
 */
export function subpaths(d: string): string[] {
  return d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
}
