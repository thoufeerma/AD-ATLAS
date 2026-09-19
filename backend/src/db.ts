import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { env } from "./env.js";
import { pgConnection } from "./lib/pgConnection.js";

/**
 * Single Prisma client for the process. Prisma 7 talks to Postgres through a
 * driver adapter (node-postgres here) rather than a bundled Rust engine.
 */
const adapter = new PrismaPg(pgConnection(env.DATABASE_URL, env.DATABASE_CA_CERT));

export const prisma = new PrismaClient({ adapter });
