import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

mongoose.set('strictQuery', true);

/**
 * Connects to MongoDB Atlas (or, when USE_IN_MEMORY_DB=true, to a throwaway
 * in-memory MongoDB so the API can be developed and tested without Atlas
 * credentials).
 */
export async function connectDatabase() {
  let uri = env.mongoUri;

  if (env.useInMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server-core');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('krishi_procurement');
    console.log('[db] USE_IN_MEMORY_DB=true - using a temporary in-memory MongoDB');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true,
  });

  const { host, name } = mongoose.connection;
  console.log(`[db] connected to MongoDB (${host}/${name})`);

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export default mongoose;
