// One-off generator for the default social share image (public/og-default.png).
// The output PNG is committed and served as the og:image fallback (src/lib/seo.ts) — it is NOT
// regenerated at build, so `sharp` is intentionally NOT a project dependency. Re-run only when the
// logo/branding changes, with sharp available (installed globally, in node_modules, or transiently):
//   SHARP_PATH=/abs/path/to/node_modules/sharp node scripts/generate-og-default.mjs
// OG standard: 1200×630, the brand paper background with the violet logo centered.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = '#f9f7f2'; // --couleur-beige-clair
const LOGO_WIDTH = 560;

const logoSvg = readFileSync(resolve(root, 'public/logo/logo-violet.svg'));
// density lifts the SVG rasterization resolution so the logo stays crisp at LOGO_WIDTH.
const logo = await sharp(logoSvg, { density: 300 }).resize({ width: LOGO_WIDTH }).png().toBuffer();

const png = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 4, background: PAPER },
})
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toBuffer();

const dest = resolve(root, 'public/og-default.png');
writeFileSync(dest, png);
console.log(`[og] ${dest} written (${WIDTH}x${HEIGHT}).`);
