import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const pkgPath = resolve(__dirname, '../package.json');
const nvmrcPath = resolve(__dirname, '../.nvmrc');

const nvmrc = readFileSync(nvmrcPath, 'utf-8').trim();
const pkgRaw = readFileSync(pkgPath, 'utf-8');
const pkg = JSON.parse(pkgRaw);

pkg.engines = pkg.engines || {};
pkg.engines.node = nvmrc;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✅ package.json engines.node set to ${nvmrc}`);
