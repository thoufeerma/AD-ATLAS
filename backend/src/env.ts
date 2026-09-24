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
    // ── Razorpay ── without these, checkout offers cash on delivery only.
    // The key id is public (the browser needs it); the other two are secrets.
    RAZORPAY_KEY_ID: z.string().trim().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().trim().min(1).optional(),
    /** From the webhook you add in the Razorpay dashboard. */
    RAZORPAY_WEBHOOK_SECRET: z.string().trim().min(1).optional(),
    /**
     * Development only: lets the API stand in for Razorpay so the payment
     * path can be exercised without an account. Refused outright against any
     * database that isn't on this machine — see lib/payments.ts.
     */
    ALLOW_PAYMENT_SIMULATOR: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
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
    // ── Image storage online ── with these set, uploads go to a public
    // Supabase Storage bucket instead of the local disk.
    SUPABASE_URL: z.url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
    SUPABASE_BUCKET: z.string().trim().min(1).default("media"),
    // ── Database TLS ── Supabase's CA certificate (PEM), so the connection
    // is verified as well as encrypted (see lib/pgConnection.ts).
    DATABASE_CA_CERT: z.string().trim().min(1).optional(),
    // ── Behind the store/admin proxies ── shared with both websites, which
    // pass each visitor's real IP address with it (see lib/clientIp.ts).
    PROXY_SECRET: z.string().trim().min(32, "must be at least 32 characters").optional(),
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
    // A simulator that ever ran against a real store would let anyone mark
    // their own order paid. Two locks: never in production, and never against
    // a database that isn't local.
    if (e.ALLOW_PAYMENT_SIMULATOR) {
      const localDb = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(e.DATABASE_URL);
      if (e.NODE_ENV === "production" || !localDb) {
        ctx.addIssue({
          code: "custom",
          path: ["ALLOW_PAYMENT_SIMULATOR"],
          message: "can only be used in development against a local database",
        });
      }
      if (e.RAZORPAY_KEY_ID) {
        ctx.addIssue({
          code: "custom",
          path: ["ALLOW_PAYMENT_SIMULATOR"],
          message: "can't be used together with real Razorpay keys — remove one",
        });
      }
    }
    // Half-configured payments would take orders it can't charge for.
    if (Boolean(e.RAZORPAY_KEY_ID) !== Boolean(e.RAZORPAY_KEY_SECRET)) {
      ctx.addIssue({
        code: "custom",
        path: ["RAZORPAY_KEY_SECRET"],
        message: "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set together",
      });
    }
    if (e.RAZORPAY_KEY_ID && !/^rzp_(test|live)_/.test(e.RAZORPAY_KEY_ID)) {
      ctx.addIssue({
        code: "custom",
        path: ["RAZORPAY_KEY_ID"],
        message: "should start with rzp_test_ or rzp_live_",
      });
    }
    if (e.SUPABASE_URL && !e.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
        message: "is required when SUPABASE_URL is set",
      });
    }
    // Online, every request arrives through the store's or admin's server;
    // without the shared secret all shoppers would share one rate limit.
    if (e.NODE_ENV === "production" && !e.PROXY_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["PROXY_SECRET"],
        message: "is required in production (the same value as on both websites)",
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
