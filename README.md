# Jaipur Hand Block Studio

A calm, tactile hand-block printing table in the browser, in the spirit of Jaipur's Sanganeri block printers. Pick up a carved wooden block, ink it in navy blue, red, pink or leaf green, press it onto a 4×6 card of white linen, and download the result as a print-ready PNG or PDF.

Built with Vite, React, TypeScript and CSS Modules. No backend.

## Run locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

```bash
npm run build     # type-check and build to dist/
npm run preview   # serve the production build locally
```

## Deploy

**Vercel:** import the GitHub repo at vercel.com/new. `vercel.json` already sets the build command and the `dist` output, so accept the defaults.

**Netlify:** "Add new site → Import an existing project", pick the repo. `netlify.toml` sets `npm run build` and the `dist` publish folder.

Any static host works: upload the `dist/` folder after `npm run build`.

## How to use

1. **Pick up a block** from the tray.
2. **Ink it**: tap one of the four ink pads. The block takes the colour, and one dab lasts five presses, each fainter than the last. Then the block is dry and needs inking again (set `PRESSES_PER_DAB` in `src/hooks/useInk.ts`).
3. **Press it**: click or tap on the card. On touch, drag to aim and lift to press. Tap the empty slot in the tray to put the block back.

Rotate with the scroll wheel, the ⟲ ⟳ buttons, or a two-finger twist on touch.

**Keyboard:** with a block in hand, the arrow keys move it (hold Shift for bigger steps), Enter or Space presses, `[` and `]` (or R / Shift+R) rotate, and Escape puts it down.

Sound effects are off by default. Use the speaker icon in the top right.

The ink colours are defined in [`src/lib/inks.ts`](src/lib/inks.ts) and mirrored as tokens in [`src/styles/tokens.css`](src/styles/tokens.css).

## Adding your own stamps

All blocks live in [`src/assets/stamps/stamps.ts`](src/assets/stamps/stamps.ts). Each entry has:

| Field | Meaning |
| --- | --- |
| `id` | Unique key |
| `name` | Label shown under the block |
| `defaultSize` | Printed width as a fraction of the card width (0.3 = 30%) |
| `svgPath` | SVG path data in a 100×100 viewBox. Overlapping shapes merge into one carved face |
| `cut` | Optional path carved back out of the face (eyes, veins, highlights) |
| `pngMask` | Or, instead of `svgPath`: a PNG whose alpha channel is the carved face |

The five current stamps (flower, pomegranate, lotus, paisley, horse) are PNG masks. For a new PNG, put the file in `src/assets/stamps/` and import it:

```ts
import lotus from './lotus.png';

{ id: 'lotus', name: 'Lotus', defaultSize: 0.3, pngMask: lotus },
```

Use a square PNG with a transparent background, where opaque areas are the parts that print.

## Project structure

```
src/
  assets/stamps/stamps.ts   stamp library (swap your artwork here)
  styles/tokens.css         design tokens: colours, spacing, type, radii, shadows, motion
  lib/                      canvas rendering and pure logic
    linenTexture.ts         procedural white linen (plain weave, slubs, flax flecks, frayed edge)
    woodTexture.ts          procedural wood grain shared by all blocks
    renderImprint.ts        one imprint: stamp mask × seeded noise, rim darkening, ink level
    compositor.ts           paper + imprints, shared by the screen and export
    export.ts               1200×1800 PNG and 4×6 in PDF (jsPDF)
    sound.ts                synthesised sound effects (Web Audio)
  hooks/                    state and interaction (prints, ink, aiming, sound)
  components/               UI, one folder per component with its own .module.css
```

The sheet is stored as an array of presses `{ stampId, color, x, y, rotation, inkLevel, seed }`. Each press has its own random seed, so every imprint renders identically on each redraw and in the export. The canvas redraws only when something changes.
