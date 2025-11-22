/**
 * ┌─────────────────────────────────────┐
 * │      Prisma Client Singleton        │
 * └─────────────────────────────────────┘
 *
 * @module lib/prisma
 * @description Prisma Client singleton instance with Prisma 7 driver adapter
 *
 * @example
 * ```typescript
 * import { prisma } from '@/lib/prisma';
 *
 * const users = await prisma.user.findMany();
 * ```
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // Prisma 7 requires a driver adapter for PostgreSQL
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prismaGlobal: PrismaClientSingleton | undefined;
}

export const prisma = global.prismaGlobal ?? prismaClientSingleton();
export const db = prisma;

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
