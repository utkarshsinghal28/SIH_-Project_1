/**
 * Starts the full stack for the sandbox preview:
 *
 *   1. the Express + MongoDB API   (server/, port 5000)
 *   2. the Next.js static host     (serves the built SPA + proxies /api)
 *
 * The preview has no MongoDB Atlas credentials, so the API is started with
 * USE_IN_MEMORY_DB=true and SEED_ON_START=true. That gives a genuinely working
 * end-to-end demo whose data resets whenever the process restarts.
 *
 * For real local development run the two processes yourself:
 *   cd server && npm run dev
 *   cd client && npm run dev
 */
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

const API_PORT = process.env.API_PORT || '5000';
const children = [];

function run(name, command, args, env) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const prefix = (line) => `[${name}] ${line}`;
  child.stdout.on('data', (chunk) =>
    String(chunk)
      .trimEnd()
      .split('\n')
      .forEach((line) => console.log(prefix(line))),
  );
  child.stderr.on('data', (chunk) =>
    String(chunk)
      .trimEnd()
      .split('\n')
      .forEach((line) => console.error(prefix(line))),
  );

  child.on('exit', (code, signal) => {
    console.error(`[preview] ${name} exited (code=${code} signal=${signal})`);
    if (name === 'web') shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
  setTimeout(() => process.exit(code), 500).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// ---- 1. API ---------------------------------------------------------------
run('api', process.execPath, ['server/src/server.js'], {
  NODE_ENV: 'development',
  PORT: API_PORT,
  USE_IN_MEMORY_DB: 'true',
  SEED_ON_START: 'true',
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
});

// ---- 2. web host ----------------------------------------------------------
run('web', process.execPath, ['node_modules/next/dist/bin/next', 'start'], {
  API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}`,
});
