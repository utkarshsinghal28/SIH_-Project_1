import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env, validateEnv } from './config/env.js';

async function start() {
  const problems = validateEnv();
  if (problems.length > 0) {
    console.error('\n[config] cannot start - fix the following in server/.env:');
    problems.forEach((problem) => console.error(`  - ${problem}`));
    console.error('\nSee server/.env.example for a template.\n');
    process.exit(1);
  }

  try {
    await connectDatabase();
  } catch (error) {
    console.error('[db] failed to connect to MongoDB:', error.message);
    console.error('     Check MONGODB_URI and that your IP is allowed in Atlas Network Access.');
    process.exit(1);
  }

  // Demo bootstrap: populate a throwaway database so the preview has data.
  if (process.env.SEED_ON_START === 'true') {
    const { seedDatabase } = await import('./seed/seedCore.js');
    await seedDatabase();
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[api] Krishi Procurement API listening on http://localhost:${env.port}/api`);
    console.log(`[api] environment: ${env.nodeEnv}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received - shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
