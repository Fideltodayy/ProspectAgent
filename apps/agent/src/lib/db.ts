import { PrismaClient } from '@prisma/client';

// Lazily created — ensures env vars are loaded before the client is instantiated
let _db: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!_db) {
    _db = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  return _db;
}

// Convenience alias — use getDb() in code that runs at startup
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
