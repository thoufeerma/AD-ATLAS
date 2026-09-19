import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { storageName } from "./lib/media.js";
import { emailServiceConnected } from "./lib/mail.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Velastia API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  console.log(`  images: ${storageName} · email: ${emailServiceConnected() ? "Resend" : "Email Log only (no RESEND_API_KEY)"}`);
});

/** Finish in-flight requests and release database connections before exiting. */
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Don't hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
