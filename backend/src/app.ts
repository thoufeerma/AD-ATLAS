import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { requireAdmin } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { catalogRouter } from "./routes/public/catalog.js";
import { checkoutRouter } from "./routes/public/checkout.js";
import { contentRouter } from "./routes/public/content.js";
import { adminAuthRouter } from "./routes/admin/auth.js";
import { adminProductsRouter } from "./routes/admin/products.js";
import { adminOrdersRouter } from "./routes/admin/orders.js";
import { adminCustomersRouter } from "./routes/admin/customers.js";
import { adminDashboardRouter, adminActivityRouter } from "./routes/admin/dashboard.js";
import {
  adminCategoriesRouter,
  adminReviewsRouter,
  adminCouponsRouter,
  adminFaqsRouter,
  adminTestimonialsRouter,
  adminBannersRouter,
  adminCollaboratorsRouter,
  adminOffersRouter,
} from "./routes/admin/resources.js";
import { adminSettingsRouter, adminPagesRouter } from "./routes/admin/settings.js";

export function createApp() {
  const app = express();

  // Behind a proxy (Render, Railway, a load balancer) req.ip must come from
  // X-Forwarded-For, or login throttling would lump every visitor together.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      // Explicit allow-list only. `credentials: true` with a wildcard origin
      // would let any website make authenticated admin requests.
      origin: (origin, cb) => {
        if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // ── Public API (storefront) ──
  const v1 = express.Router();
  v1.use(catalogRouter);
  v1.use(checkoutRouter);
  v1.use(contentRouter);

  // ── Admin API (CMS) ── everything past /auth requires a session.
  const admin = express.Router();
  admin.use("/auth", adminAuthRouter);
  admin.use(requireAdmin);
  admin.use("/dashboard", adminDashboardRouter);
  admin.use("/products", adminProductsRouter);
  admin.use("/categories", adminCategoriesRouter);
  admin.use("/orders", adminOrdersRouter);
  admin.use("/customers", adminCustomersRouter);
  admin.use("/reviews", adminReviewsRouter);
  admin.use("/coupons", adminCouponsRouter);
  admin.use("/offers", adminOffersRouter);
  admin.use("/faqs", adminFaqsRouter);
  admin.use("/testimonials", adminTestimonialsRouter);
  admin.use("/banners", adminBannersRouter);
  admin.use("/collaborators", adminCollaboratorsRouter);
  admin.use("/activity", adminActivityRouter);
  admin.use("/settings", adminSettingsRouter);
  admin.use("/pages", adminPagesRouter);

  v1.use("/admin", admin);
  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
