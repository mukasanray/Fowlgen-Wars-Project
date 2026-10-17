#!/usr/bin/env node
/**
 * check.js — validate an image against social media platform specs
 *
 * Usage:
 *   node check.js <image-path> [--platform <slug>] [--filter perfect|close|usable|too-small]
 *
 * Examples:
 *   node check.js photo.jpg
 *   node check.js banner.png --platform linkedin
 *   node check.js story.jpg --filter perfect
 */

const fs   = require('fs');
const path = require('path');
const { getAllSpecs } = require('./platform-data');

// ─── argument parsing ──────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const imgPath = args.find(a => !a.startsWith('--'));

if (!imgPath) {
  console.error('Usage: node check.js <image-path> [--platform <slug>] [--filter perfect|close|usable|too-small]');
  process.exit(1);
}

if (!fs.existsSync(imgPath)) {
  console.error(`File not found: ${imgPath}`);
  process.exit(1);
}

const platformFlag = args.includes('--platform') ? args[args.indexOf('--platform') + 1] : null;
const filterFlag   = args.includes('--filter')   ? args[args.indexOf('--filter')   + 1] : null;

// ─── read image dimensions ─────────────────────────────────────────────────────

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp is not installed. Run: npm install');
  process.exit(1);
}

async function run() {
  const meta     = await sharp(imgPath).metadata();
  const { width, height } = meta;
  const fileSize = fs.statSync(imgPath).size;
  const aspect   = (width / height).toFixed(2);

  // ─── classify ───────────────────────────────────────────────────────────────

  function classify(imgW, imgH, specW, specH) {
    const wRatio = imgW / specW;
    const hRatio = imgH / specH;
    if (Math.abs(wRatio - 1) <= 0.02 && Math.abs(hRatio - 1) <= 0.02) return 'perfect';

    const imgAsp  = imgW / imgH;
    const specAsp = specW / specH;
    const aspDiff = Math.abs(imgAsp - specAsp) / specAsp;
    if (aspDiff <= 0.03 && wRatio >= 0.9 && hRatio >= 0.9) return 'close';

    if (imgW >= specW && imgH >= specH) return 'usable';
    return 'too-small';
  }

  const LEVEL_ORDER = { perfect: 0, close: 1, usable: 2, 'too-small': 3 };
  const LEVEL_ICON  = { perfect: '✅', close: '🟡', usable: '🔄', 'too-small': '❌' };
  const LEVEL_LABEL = { perfect: 'PERFECT', close: 'CLOSE (scale only)', usable: 'USABLE (will crop)', 'too-small': 'TOO SMALL' };

  let specs = getAllSpecs();
  if (platformFlag) specs = specs.filter(s => s.slug === platformFlag);

  const results = specs
    .map(s => ({ ...s, level: classify(width, height, s.width, s.height) }))
    .filter(s => !filterFlag || s.level === filterFlag)
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  // ─── output ─────────────────────────────────────────────────────────────────

  const bar = '─'.repeat(60);
  console.log(`\n${bar}`);
  console.log(`  📐  ${path.basename(imgPath)}`);
  console.log(`      ${width} × ${height} px  (${aspect}:1)  •  ${formatSize(fileSize)}`);
  console.log(bar);

  if (results.length === 0) {
    console.log('\n  No matches found.\n');
  } else {
    let lastLevel = null;
    for (const r of results) {
      if (r.level !== lastLevel) {
        console.log(`\n  ${LEVEL_ICON[r.level]}  ${LEVEL_LABEL[r.level]}`);
        lastLevel = r.level;
      }
      const sizeStr  = `${r.width}×${r.height}`;
      const noteStr  = r.notes ? `  · ${r.notes}` : '';
      const resizeHint = r.level !== 'perfect'
        ? `  → node scripts/resize.js ${imgPath} "${r.platform} ${r.name}"`
        : '';
      console.log(`     ${r.platform.padEnd(12)} ${r.category.padEnd(20)} ${r.name.padEnd(28)} ${sizeStr.padEnd(12)} ${r.aspect}${noteStr}${resizeHint}`);
    }
  }

  // counts
  const counts = {};
  for (const l of ['perfect','close','usable','too-small']) counts[l] = results.filter(r => r.level === l).length;
  console.log(`\n${bar}`);
  console.log(`  ✅ ${counts.perfect} perfect   🟡 ${counts.close} close   🔄 ${counts.usable} usable   ❌ ${counts['too-small']} too small`);
  console.log(`  Full reference → branding5.com/tools/social-media-cheat-sheet`);
  console.log(`${bar}\n`);
}

function formatSize(bytes) {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

run().catch(e => { console.error(e.message); process.exit(1); });
