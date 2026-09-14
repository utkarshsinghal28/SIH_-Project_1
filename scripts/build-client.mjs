/**
 * Builds the React + Vite client (`client/`) into the repository `public/` folder.
 *
 * The sandbox preview host serves `public/` as static assets, so this is the only
 * step required to make a production build of the SPA available to the preview.
 */
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  // Remove previously emitted hashed assets so `public/` never accumulates stale files.
  await rm(path.join(repoRoot, 'public', 'assets'), { recursive: true, force: true });

  await build({
    configFile: path.join(repoRoot, 'client', 'vite.config.js'),
    logLevel: 'info',
  });

  console.log('\n[build-client] SPA build emitted to public/');
}

main().catch((error) => {
  console.error('[build-client] failed:', error);
  process.exitCode = 1;
});
