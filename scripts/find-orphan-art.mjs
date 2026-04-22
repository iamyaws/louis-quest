// One-off audit: find unreferenced files in public/art/ by grepping all
// code/config files for each filename. Reports total orphan size so we
// can decide how much to trim.
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out, include) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'dist-dev') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, include);
    else if (!include || include(entry.name)) out.push(full);
  }
}

const artFiles = [];
walk('public/art', artFiles);

// Include everything code/config. We specifically DO NOT scan files under
// public/art itself (which would match trivially by filesystem name).
const srcFiles = [];
walk('src', srcFiles, (n) => /\.(jsx?|tsx?|json|html|css|md)$/i.test(n));
srcFiles.push('index.html');
srcFiles.push('vite.config.js');
srcFiles.push('vite.config.dev.js');
srcFiles.push('public/manifest.json');
// Also scan website/ in case shared code references ../louis-quest/public/art
try {
  walk('website/src', srcFiles, (n) => /\.(jsx?|tsx?|json|html|css|md)$/i.test(n));
} catch {}

const blob = srcFiles.map((f) => {
  try { return fs.readFileSync(f, 'utf8'); } catch { return ''; }
}).join('\n');

const orphans = [];
const referenced = [];

for (const f of artFiles) {
  const base = path.basename(f);
  const baseNoExt = base.replace(/\.[^.]+$/, '');
  const forwardPath = f.split(path.sep).join('/').replace(/^public\//, '');
  // A file is "referenced" if any of these substrings appear in the blob:
  //   - the exact filename (bg-teal-soft.webp)
  //   - the path from public (art/bg-teal-soft.webp)
  //   - the bare stem (catches `'dragon-egg' + '.webp'` and
  //     `DRAGON_ART['dragon-egg']` patterns that concatenate at runtime)
  //
  // The stem check can introduce false positives (short stems like "egg"
  // might match unrelated tokens), so we only use it when the stem is
  // "distinctive" — ≥8 chars or contains a hyphen/underscore — to keep
  // the signal clean. Short generic stems fall back to full-filename
  // matching only.
  const stemIsDistinctive = baseNoExt.length >= 8 || /[-_]/.test(baseNoExt);
  const hit =
    blob.includes(base) ||
    blob.includes(forwardPath) ||
    (stemIsDistinctive && blob.includes(baseNoExt));
  const size = fs.statSync(f).size;
  (hit ? referenced : orphans).push({ f: forwardPath, size, base });
}

orphans.sort((a, b) => b.size - a.size);
const totalOrphanSize = orphans.reduce((s, o) => s + o.size, 0);
const totalArtSize = [...orphans, ...referenced].reduce((s, o) => s + o.size, 0);

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log('=== ORPHAN SCAN — public/art ===');
console.log(`Total art files:     ${artFiles.length}`);
console.log(`Referenced:          ${referenced.length}`);
console.log(`Orphans:             ${orphans.length}`);
console.log(`Total size:          ${mb(totalArtSize)} MB`);
console.log(`Orphan size:         ${mb(totalOrphanSize)} MB`);
console.log(`Would-be size:       ${mb(totalArtSize - totalOrphanSize)} MB`);
console.log();
console.log('=== Top orphans by size ===');
for (const o of orphans.slice(0, 40)) {
  console.log(`${String(Math.round(o.size / 1024)).padStart(6)} KB  ${o.f}`);
}
console.log();
console.log('=== By subdir (orphan MB) ===');
const bySubdir = new Map();
for (const o of orphans) {
  const subdir = o.f.replace(/^art\//, '').split('/')[0];
  const key = subdir.includes('.') ? '(top-level)' : subdir;
  bySubdir.set(key, (bySubdir.get(key) || 0) + o.size);
}
const sorted = [...bySubdir.entries()].sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) {
  console.log(`${mb(v).padStart(6)} MB  ${k}`);
}
