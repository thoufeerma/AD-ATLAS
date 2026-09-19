/**
 * The admin test suite signs in as its own account, never a real person's —
 * so it keeps working after you change your password, and never needs it.
 *
 *   tsx scripts/smoke-admin-user.ts enable   → (re)creates the account with a
 *       fresh random password and prints SMOKE_ADMIN_PASSWORD=… for smoke.mjs
 *   tsx scripts/smoke-admin-user.ts disable  → turns it off again
 *
 * DEVELOPMENT ONLY: refuses to touch a database that isn't on this machine.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";

const SMOKE_ADMIN_EMAIL = "smoke-runner@velastia.test";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
  console.error("Refusing to create a test admin outside a local database.");
  process.exit(2);
}

const mode = process.argv[2];
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

try {
  if (mode === "enable") {
    const password = randomBytes(24).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.upsert({
      where: { email: SMOKE_ADMIN_EMAIL },
      update: { passwordHash, isActive: true, mustChangePassword: false, role: "SUPER_ADMIN", sessionVersion: { increment: 1 } },
      create: {
        email: SMOKE_ADMIN_EMAIL,
        name: "Smoke Test Runner",
        role: "SUPER_ADMIN",
        passwordHash,
      },
    });
    // Read by smoke.mjs and passed to the suite through the environment.
    console.log(`SMOKE_ADMIN_PASSWORD=${password}`);
  } else if (mode === "disable") {
    await prisma.adminUser.updateMany({
      where: { email: SMOKE_ADMIN_EMAIL },
      data: { isActive: false, sessionVersion: { increment: 1 } },
    });
  } else {
    console.error("Usage: tsx scripts/smoke-admin-user.ts enable|disable");
    process.exitCode = 2;
  }
} finally {
  await prisma.$disconnect();
}
