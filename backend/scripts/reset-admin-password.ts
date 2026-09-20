/**
 * Forgot the admin password? Reset it from your own computer.
 *
 *   PowerShell, in backend/ — for the online database:
 *     $env:DATABASE_URL = Read-Host "Supabase Session pooler address"
 *     npm run admin:reset
 *
 * (Without DATABASE_URL set in the window, it uses backend/.env — the local
 * database.) It lists the admin accounts, then gives one of them a new
 * one-time password, printed here and nowhere else. Signing in with it makes
 * the admin panel ask for a new password straight away, and every existing
 * session of that account is signed out.
 *
 * With several admins, name the one to reset:
 *     npm run admin:reset -- someone@example.com
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { pgConnection } from "../src/lib/pgConnection.js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL first (see the comment at the top of this file).");
  process.exit(2);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(pgConnection(url, process.env.DATABASE_CA_CERT)) });

/** Same shape as the admin's own one-time passwords: "k7qm-2xtd-hw9p-4nbe", no look-alike characters. */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const oneTimePassword = () =>
  Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")).join("-");

try {
  // Say which database, so resetting the online one is never a surprise.
  console.log(`Database: ${new URL(url).host}\n`);

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true, role: true, isActive: true },
  });
  if (admins.length === 0) {
    console.log("There are no admin accounts yet. Create the first one with `npm run db:seed` (DEPLOY.md, step 3).");
    process.exitCode = 1;
  } else {
    console.log("Admin accounts:");
    for (const a of admins) console.log(`  ${a.email}  (${a.role}${a.isActive ? "" : ", switched off"})`);

    const wanted = process.argv[2]?.trim().toLowerCase();
    const target = wanted ? admins.find((a) => a.email === wanted) : admins.length === 1 ? admins[0] : undefined;

    if (!target) {
      console.log(
        wanted
          ? `\nNo admin has the email ${wanted}.`
          : "\nThere are several — name the one to reset:  npm run admin:reset -- their@email.com",
      );
      process.exitCode = 1;
    } else if (!target.isActive) {
      // Switched off on purpose by another admin; a reset shouldn't undo that.
      console.log(`\n${target.email} is switched off. Turn it back on under Users & Roles first.`);
      process.exitCode = 1;
    } else {
      const password = oneTimePassword();
      await prisma.adminUser.update({
        where: { email: target.email },
        data: {
          passwordHash: await bcrypt.hash(password, 12),
          mustChangePassword: true,
          sessionVersion: { increment: 1 },
        },
      });
      console.log(
        `\nDone. Sign in to the admin with:\n` +
          `  Email:              ${target.email}\n` +
          `  One-time password:  ${password}\n` +
          `You'll be asked to choose your own password straight away.`,
      );
    }
  }
} finally {
  await prisma.$disconnect();
}
