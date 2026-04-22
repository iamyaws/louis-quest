// Delete unreferenced files in public/art/. Mirror of find-orphan-art.mjs
// but with fs.unlinkSync on the orphans. Run once after verifying the
// orphan list is correct.
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out, include) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'dist-dev'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, include);
    else if (!include || include(entry.name)) out.push(full);
  }
}

const artFiles = [];
walk('public/art', artFiles);

const srcFiles = [];
walk('src', srcFiles, (n) => /\.(jsx?|tsx?|json|html|css|md)$/i.test(n));
srcFiles.push('index.html', 'vite.config.js', 'vite.config.dev.js', 'public/manifest.json');
try {
  walk('website/src', srcFiles, (n) => /\.(jsx?|tsx?|json|html|css|md)$/i.test(n));
} catch {}

const blob = srcFiles.map((f) => {
  try { return fs.readFileSync(f, 'utf8'); } catch { return ''; }
}).join('\n');

const orphans = [];
let keptSize = 0;
for (const f of artFiles) {
  const base = path.basename(f);
  const baseNoExt = base.replace(/\.[^.]+$/, '');
  const forwardPath = f.split(path.sep).join('/').replace(/^public\//, '');
  const stemIsDistinctive = baseNoExt.length >= 8 || /[-_]/.test(baseNoExt);
  const hit =
    blob.includes(base) ||
    blob.includes(forwardPath) ||
    (stemIsDistinctive && blob.includes(baseNoExt));
  const size = fs.statSync(f).size;
  if (!hit) orphans.push({ f, size });
  else keptSize += size;
}

let freed = 0;
for (const o of orphans) {
  fs.unlinkSync(o.f);
  freed += o.size;
}

// Clean up now-empty subdirs (a subdir that only held orphans)
function removeEmptyDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) removeEmptyDirs(path.join(dir, e.name));
  }
  if (fs.readdirSync(dir).length === 0 && dir !== 'public/art') {
    fs.rmdirSync(dir);
  }
}
removeEmptyDirs('public/art');

console.log(`Deleted ${orphans.length} files, freed ${(freed / 1024 / 1024).toFixed(2)} MB`);
console.log(`Kept ${(keptSize / 1024 / 1024).toFixed(2)} MB of referenced art`);
