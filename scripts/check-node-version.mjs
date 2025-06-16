import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rawVersion = readFileSync(
  resolve(__dirname, '../.nvmrc'),
  'utf-8',
).trim();
const requiredVersion = rawVersion.replace(/^v/, ''); // v 제거
const currentVersion = process.version.replace(/^v/, ''); // v 제거

if (currentVersion !== requiredVersion) {
  console.error(
    `❌ Required Node.js version: ${requiredVersion}, but current is ${currentVersion}`,
  );
  process.exit(1);
} else {
  console.log(`✅ Node.js version: ${currentVersion}`);
}
