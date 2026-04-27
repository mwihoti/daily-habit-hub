/**
 * PWA Icon Generator
 * Run once before build: node scripts/generate-icons.mjs
 * Requires: npm install --save-dev sharp
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const outputDir = join(projectRoot, 'public', 'icons');
const svgPath = join(projectRoot, 'public', 'fitness-workout-healthy-svgrepo-com.svg');

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
// Dark background matching the app's theme (#09090b = zinc-950)
const BACKGROUND = { r: 9, g: 9, b: 11, alpha: 1 };

async function generateIcon(size) {
  const padding = Math.floor(size * 0.18);
  const iconSize = size - padding * 2;

  const svgBuffer = await sharp(svgPath).resize(iconSize, iconSize).toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: svgBuffer, gravity: 'center' }])
    .png()
    .toFile(join(outputDir, `icon-${size}x${size}.png`));

  console.log(`  ✓ icon-${size}x${size}.png`);
}

console.log('Generating PWA icons...');
try {
  await Promise.all(SIZES.map(generateIcon));
  console.log('Done — icons saved to public/icons/');
} catch (err) {
  console.warn('Icon generation failed (non-fatal):', err.message);
  process.exit(0);
}
