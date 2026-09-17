import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { env } from "./env.js";

/**
 * Single Prisma client for the process. Prisma 7 talks to Postgres through a
 * driver adapter (node-postgres here) rather than a bundled Rust engine.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
