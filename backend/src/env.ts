import "dotenv/config";
import { z } from "zod";

/**
 * Environment is parsed once, at boot. A missing or malformed variable stops
 * the server immediately with a readable message, instead of surfacing later
 * as an undefined value deep inside a request.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.url(),
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:3000,http://localhost:3001")
      .transform((s) =>
        s
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      ),
    JWT_SECRET: z.string().min(1),
    SEED_ADMIN_EMAIL: z.email().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional(),
    // ── Email ── without a key, emails are kept in the admin's Email Log
    // instead of being sent.
    RESEND_API_KEY: z.string().trim().min(1).optional(),
    EMAIL_FROM: z.string().trim().min(3).default("Velastia <onboarding@resend.dev>"),
    // ── Uploads ── where uploaded images are kept (local disk in development)
    // and the largest file accepted, in megabytes.
    UPLOAD_DIR: z.string().trim().min(1).default("uploads"),
    MAX_UPLOAD_MB: z.coerce.number().positive().max(50).default(10),
    // Public addresses of the two sites, for links and the logo in emails.
    STORE_URL: z.url().default("http://localhost:3000"),
    ADMIN_URL: z.url().default("http://localhost:3001"),
  })
  .superRefine((e, ctx) => {
    // A weak or placeholder signing secret in production would let anyone
    // forge an admin session. Refuse to boot rather than run exposed.
    if (
      e.NODE_ENV === "production" &&
      (e.JWT_SECRET.length < 32 || e.JWT_SECRET.startsWith("replace-me"))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "must be a random value of at least 32 characters in production",
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("✖ Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("  See backend/.env.example.");
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
