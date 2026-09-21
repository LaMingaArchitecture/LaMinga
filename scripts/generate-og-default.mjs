// One-off generator for the default social share image (public/og-default.png).
// The output PNG is committed and served as the og:image fallback (src/lib/seo.ts) — it is NOT
// regenerated at build, so `sharp` is intentionally NOT a project dependency. Re-run only when the
// logo/branding changes, with sharp available (installed globally, in node_modules, or transiently):
//   SHARP_PATH=/abs/path/to/node_modules/sharp node scripts/generate-og-default.mjs
// OG standard: 1200×630, the brand paper background with the charte V3 logotype centered.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_PATH || 'sharp');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1200;
const HEIGHT = 630;
// The OG image is only ever seen off-site, so a stale brand ground would drift unnoticed. Read the
// hex out of the token file instead of restating it, and fail loudly if the token is ever renamed.
const tokens = readFileSync(resolve(root, 'src/styles/tokens.css'), 'utf8');
const paperMatch = tokens.match(/--couleur-beige-clair:\s*(#[0-9a-f]{3,8});/i);
if (!paperMatch) {
  throw new Error('[og] --couleur-beige-clair not found in src/styles/tokens.css');
}
const PAPER = paperMatch[1];
const LOGO_WIDTH = 560;

const logoSvg = readFileSync(resolve(root, 'public/logo/logo-laminga.svg'));
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
