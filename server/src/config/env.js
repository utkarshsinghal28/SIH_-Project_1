import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const bool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  /**
   * Development convenience: start a throwaway in-memory MongoDB instead of
   * connecting to Atlas. Never enable this in production - all data is lost on
   * shutdown.
   */
  useInMemoryDb: bool(process.env.USE_IN_MEMORY_DB, false),
  serverRoot,
};

export const isProduction = () => env.nodeEnv === 'production';

/**
 * Fails fast on missing configuration rather than starting a half-working API.
 * Returns the list of problems so the caller can decide how loudly to complain.
 */
export function validateEnv() {
  const problems = [];

  if (!env.jwtSecret) {
    problems.push('JWT_SECRET is not set.');
  } else if (env.jwtSecret.length < 16) {
    problems.push('JWT_SECRET is too short (use at least 16 characters).');
  }

  if (!env.mongoUri && !env.useInMemoryDb) {
    problems.push('MONGODB_URI is not set (or set USE_IN_MEMORY_DB=true for local development).');
  }

  if (isProduction() && env.useInMemoryDb) {
    problems.push('USE_IN_MEMORY_DB must not be enabled in production.');
  }

  return problems;
}

export default env;
