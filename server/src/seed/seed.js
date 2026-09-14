/**
 * Seeds the database with demo centres, slots and accounts.
 *
 * Usage:   cd server && npm run seed
 * Reset:   cd server && npm run seed -- --fresh     (wipes the collections first)
 *
 * DEVELOPMENT ONLY. Never run this against a production database.
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env, validateEnv } from '../config/env.js';
import { seedDatabase } from './seedCore.js';
import { DEMO_PASSWORDS } from './seedData.js';

const fresh = process.argv.includes('--fresh');

async function run() {
  const problems = validateEnv();
  if (problems.length > 0) {
    console.error('[seed] cannot run - fix server/.env:');
    problems.forEach((problem) => console.error(`  - ${problem}`));
    process.exit(1);
  }

  if (env.useInMemoryDb) {
    console.error('[seed] USE_IN_MEMORY_DB=true - seeding a temporary database has no effect,');
    console.error('       because it is destroyed when the process exits.');
    console.error('       Set MONGODB_URI and USE_IN_MEMORY_DB=false, then run the seed again.');
    process.exit(1);
  }

  await connectDatabase();
  await seedDatabase({ fresh });

  console.log('\n[seed] done. Demo credentials (development only):');
  console.log(`  ADMIN   phone 9999999999  email admin@krishi.gov.in  password ${DEMO_PASSWORDS.admin}`);
  console.log(`  FARMER  phone 9876543210  password ${DEMO_PASSWORDS.farmer}`);
  console.log(`  FARMER  phone 9812345678  password ${DEMO_PASSWORDS.farmer}\n`);

  await disconnectDatabase();
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

run().catch(async (error) => {
  console.error('[seed] failed:', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
