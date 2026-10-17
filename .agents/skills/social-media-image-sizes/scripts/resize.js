#!/usr/bin/env node
/**
 * resize.js — resize an image to a named social media spec
 *
 * Usage:
 *   node resize.js <image-path> "<Platform> <Size Name>" [options]
 *   node resize.js <image-path> --list            # list all available spec names
 *
 * Options:
 *   --fit cover    Center-crop to fill exact dimensions (default)
 *   --fit contain  Letterbox — scale to fit, pad with background color
 *   --bg <hex>     Background color for contain mode (default: ffffff)
 *   --out <path>   Output file path (default: auto-named alongside input)
 *
 * Examples:
 *   node resize.js photo.jpg "Instagram Portrait Post"
 *   node resize.js photo.jpg "YouTube Custom Thumbnail"
 *   node resize.js banner.png "LinkedIn Background Photo" --fit contain --bg 000000
 *   node resize.js photo.jpg "Instagram Portrait Post" --out ./exports/ig-portrait.jpg
 */

const fs   = require('fs');
const path = require('path');
const { getAllSpecs } = require('./platform-data');

// ─── argument parsing ──────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const imgPath = args[0];

if (!imgPath || imgPath.startsWith('--')) {
  printUsage();
  process.exit(1);
}

if (args.includes('--list')) {
  listSpecs();
  process.exit(0);
}

const specQuery = args[1];
if (!specQuery || specQuery.startsWith('--')) {
  printUsage();
  process.exit(1);
}

if (!fs.existsSync(imgPath)) {
  console.error(`File not found: ${imgPath}`);
  process.exit(1);
}

const fitRaw   = args.includes('--fit')   ? args[args.indexOf('--fit') + 1]   : 'cover';
const fitMode  = ['cover', 'contain'].includes(fitRaw) ? fitRaw : (() => { console.error(`Invalid --fit value: "${fitRaw}". Use "cover" or "contain".`); process.exit(1); })();
const bgColor  = args.includes('--bg')    ? args[args.indexOf('--bg') + 1]     : 'ffffff';
const outArg   = args.includes('--out')   ? args[args.indexOf('--out') + 1]    : null;

// ─── helpers ───────────────────────────────────────────────────────────────────

function listSpecs() {
  const specs = getAllSpecs();
  console.log('\nAvailable specs (use as second argument):\n');
  let lastPlatform = null;
  for (const s of specs) {
    if (s.platform !== lastPlatform) {
      console.log(`  ${s.platform}`);
      lastPlatform = s.platform;
    }
    console.log(`    "${s.platform} ${s.name}"  →  ${s.width}×${s.height}  (${s.aspect})`);
  }
  console.log('');
}

function findSpec(query) {
  const specs = getAllSpecs();
  const q     = query.toLowerCase().trim();

  // exact match first
  let match = specs.find(s => `${s.platform} ${s.name}`.toLowerCase() === q);
  if (match) return match;

  // partial match
  match = specs.find(s => `${s.platform} ${s.name}`.toLowerCase().includes(q));
  if (match) return match;

  // fuzzy: all words present
  const words = q.split(/\s+/);
  match = specs.find(s => {
    const hay = `${s.platform} ${s.category} ${s.name}`.toLowerCase();
    return words.every(w => hay.includes(w));
  });
  return match || null;
}

function buildOutputPath(inputPath, spec) {
  const ext    = path.extname(inputPath) || '.jpg';
  const base   = path.basename(inputPath, ext);
  const suffix = `${spec.platform}-${spec.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dir    = path.dirname(inputPath);
  return path.join(dir, `${base}-${suffix}${ext}`);
}

function printUsage() {
  console.log('Usage: node resize.js <image-path> "<Platform> <Size Name>" [--fit cover|contain] [--bg hex] [--out path]');
  console.log('       node resize.js <image-path> --list');
}

function hexToRgb(hex) {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    console.error(`Invalid --bg hex color: "${hex}". Use a 3- or 6-digit hex value (e.g. fff or f0f0f0).`);
    process.exit(1);
  }
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

// ─── main ──────────────────────────────────────────────────────────────────────

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp is not installed. Run: npm install');
  process.exit(1);
}

async function run() {
  const spec = findSpec(specQuery);
  if (!spec) {
    console.error(`\nSpec not found: "${specQuery}"`);
    console.error('Run: node resize.js <image> --list\n');
    process.exit(1);
  }

  const outPath = outArg || buildOutputPath(imgPath, spec);
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const { width: W, height: H } = spec;

  let pipeline = sharp(imgPath);

  if (fitMode === 'contain') {
    const rgb = hexToRgb(bgColor);
    pipeline = pipeline.resize(W, H, {
      fit:        'contain',
      background: { r: rgb.r, g: rgb.g, b: rgb.b, alpha: 1 }
    });
  } else {
    // default: cover (center crop)
    pipeline = pipeline.resize(W, H, {
      fit:      'cover',
      position: 'centre'
    });
  }

  // preserve format from extension
  const ext = path.extname(outPath).toLowerCase();
  if      (ext === '.png')  pipeline = pipeline.png({ quality: 90 });
  else if (ext === '.webp') pipeline = pipeline.webp({ quality: 85 });
  else                      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });

  await pipeline.toFile(outPath);

  const outSize = fs.statSync(outPath).size;
  console.log(`\n✅  ${path.basename(outPath)}`);
  console.log(`    ${W} × ${H} px  (${spec.aspect})  •  ${formatSize(outSize)}`);
  console.log(`    ${spec.platform} — ${spec.category} — ${spec.name}`);
  if (spec.notes) console.log(`    💡 ${spec.notes}`);
  console.log(`    Saved to: ${outPath}\n`);
}

function formatSize(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

run().catch(e => { console.error(e.message); process.exit(1); });
