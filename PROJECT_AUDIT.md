# Project Understanding Report — Velastia (AD ATLAS)

> Codebase audit written 2026-10-01 by Claude, from reading the code (read-only).
> Treat it as a map, not as ground truth: file:line references and findings
> reflect the code on that date. Check a file before relying on a detail, and
> update this document when you change something it describes.
> Items marked **[assumption]** or **[unknown]** were not verified.

## A. Purpose
An online store for **Velastia**, a premium Indian cosmetics brand (AD Atlas Ventures Pvt Ltd). It has three parts: a public **storefront**, an **admin panel / CMS**, and a shared **REST API**. It covers the catalog, cart, checkout (cash on delivery live; Razorpay built but not connected), customer accounts, returns, GST invoices and credit notes, emails and CMS content. The docs describe it as feature-complete for cash on delivery and not yet launched.

## B. Technology stack
| Part | Stack |
|---|---|
| Storefront (repo root) | Next.js **16.3.4** App Router, React 19.2, TypeScript 5, Tailwind v4 (`@theme` in `app/globals.css`), zustand 5 (cart/wishlist), lucide-react, embla-carousel |
| Admin (`admin/`) | Same Next/React/Tailwind versions; no state library; hand-written SVG charts |
| API (`backend/`) | Node ≥20.19 (Render: 22), Express 5, Prisma 7 + `@prisma/adapter-pg`, PostgreSQL, Zod 4, jose (JWT), bcryptjs, sharp, helmet, cors, TypeScript 7.0.2 |
| Package manager | npm, three separate `package-lock.json` files, no workspaces |
| Hosting | Supabase (Postgres + Storage), Render (API, `render.yaml`), Vercel (store and admin as two projects, region `sin1`) |

At audit time **`node_modules` was not installed anywhere**, so the Next 16 docs that `AGENTS.md` requires (`node_modules/next/dist/docs/`) were unavailable. The folder is **not a git repository**. It is a plain copy of GitHub `https://github.com/thoufeerma/AD-ATLAS` branch `main` at commit `5e24b87` (2026-10-01; identical apart from line endings). Pushing to `main` redeploys the live store, admin and API (Vercel + Render).

## C. Directory layout
```
/            storefront: app/, components/, lib/, public/, proxy.ts, next.config.ts
admin/       separate Next app: app/(panel)/* (~40 screens), app/login, components/, lib/
backend/     src/{server,app,env,db}.ts, lib/ (business logic), middleware/, routes/{public,admin}/
             prisma/ (schema, 11 migrations, seed.ts, content/policies.json), scripts/ (smoke, admin reset)
brand/       full-size logo and photo masters
```
The three apps share no code. The root `tsconfig.json` excludes `admin` and `backend`; the root `eslint.config.mjs` ignores both. `.claude/launch.json` defines the dev servers: `velastia-api` on 4000, `velastia-store` on 3000, `velastia-admin` on 3001.

## D. Application architecture
- **API startup** (`backend/src/server.ts`): Zod validates the environment at import (`env.ts`) and the process exits if it's invalid. Then `createApp()` runs, `startAbandonedSweep()` starts a 5-minute job (cancel unpaid online orders older than 30 minutes and restock them; purge Email Log entries older than 180 days), the server listens, and it shuts down cleanly on SIGINT/SIGTERM.
- **Middleware order** (`app.ts`): `trust proxy 1` → helmet → CORS allow-list (`CORS_ORIGINS`) → `express.json` at 1 MB (keeps `req.rawBody` for webhook signatures) → cookie-parser → `/uploads` static files → `/health` → `/api/v1` public routers → `/api/v1/admin` (`/auth`, then `requireAdmin` + `requireCurrentPassword` on everything else) → 404 → `errorHandler`.
- **Browser to API:** the browser never calls the API directly. Each Next app's `proxy.ts` (Next 16's replacement for middleware) rewrites `/api/v1/*` to `API_URL`. It strips any client-supplied `x-velastia-client-ip` / `x-velastia-proxy-secret` headers and, when `PROXY_SECRET` is set, adds the real client IP plus the secret. The API trusts that header only when the secret matches (`lib/clientIp.ts`). Cookies stay first-party.
- **Server components** fetch the API directly. The store caches for 60 seconds with React `cache()` dedup (`lib/api/server.ts`). The admin uses `no-store` and forwards only the `vel_admin` cookie (`admin/lib/api/server.ts`).
- `/uploads/*` is rewritten to the API in both `next.config.ts` files (local-disk images in development).
- **Errors:** every response is `{data}` or `{error:{code,message,details?}}`. Handlers throw `HttpError` helpers from `lib/http.ts`. Prisma P2002/P2025/P2003 map to 409/404/409. In production, 500s hide details.
- **Logging:** `console.*` only. Admin actions also go to the `activity_logs` table through `logActivity()`; failures are swallowed.
- **Background work:** an in-process `setInterval` and `afterResponse()` (`setImmediate`) for email. There's no queue or worker.

## E. Frontend
**Storefront**
- Routes are one folder per page under `app/`: home, shop, product/[slug], cart, checkout, order-success, wishlist, login, account (+ forgot/reset/verify), track-order, search, blog (+[slug]), offers, reviews, faqs, ingredients, about, collabs, contact, shipping, returns, terms, privacy, sitemap.ts, robots.ts, error/global-error/not-found.
- `app/layout.tsx` fetches settings and the `global.topbar` banner headlines, then wraps the page in `SettingsProvider` (context) and `AccountLoader` → Header → main → Footer.
- Pages are server components; about 27 client components.
- **State:**
  - `lib/store.ts` is the persisted zustand store (localStorage key `velastia-store`) holding cart lines, wishlist and coupon; `useHydrated()` avoids hydration mismatches.
  - `lib/account.ts` is a zustand store loaded from `GET /account/me` once per page load.
  - `lib/wishlist.ts` merges the browser's wishlist into the account the first time someone signs in on a device (key `velastia-wishlist-synced`), then the account is authoritative. Sign-out clears the browser copy.
- **Pricing comes only from the server:** `useQuote()` in `lib/cart.ts` calls `POST /cart/quote`, debounced at 200 ms. `resolveCart()` flags lines that no longer match the catalog.
- **Checkout** (`components/checkout/CheckoutFlow.tsx`): Shipping → Payment → Review → `POST /orders`. Online payments then go through `lib/razorpay.ts` (`payForOrder`, with a simulator path). The address is handed to `/order-success` through sessionStorage (`velastia-last-order`).
- `app/product/[slug]` uses `generateStaticParams`, so **builds need the API running**.
- **SEO:** `lib/seo.ts` builds metadata from admin SEO settings. `ALLOW_INDEXING=false` overrides for staging. `lib/tokens.ts` fills `{{tokens}}` in policy text.
- **Hardcoded content:** `lib/content.ts` (ingredients, Instagram tiles) and the home hero slides.
- **Ingredients page** (`app/ingredients/page.tsx`) is a server component built from the 1024px design (vw on xl+). Its copy and lists are local constants in the file. A `Photo` helper checks `public/` with `existsSync` and shows a soft placeholder until each image file exists, so dropping a file in with the expected name is all that is needed.
- **Collabs page** (`app/collabs/page.tsx`, 1024px design, vw on xl+). Photos via `OptionalPhoto`: `/images/collabs hero.png`, `collabs impact band.png`, `collabs why collage.png`, `collabs cta band.png`, and one per card (`/images/collab influencers.png`, `collab makeup artists.png`, `collab content creators.png`, `collab brand ambassadors.png`, `collab beauty bloggers.png`). "What our collaborators say" lists collaborators that have a `quote` (admin → Collaborators, a screen added for this). Every apply button opens `components/collabs/ApplyDialog` (`CollabForm`, whose `applyingAs` prefixes the message with "Applying as: …"). Impact figures are constants in the page; "Join our community" links to the Instagram URL from settings.
- **Reviews page** (`app/reviews/page.tsx`, 1024px design, vw on xl+). Server page plus client parts in `components/reviews/`: `ReviewsBrowser` (category tabs from `/reviews/summary` `categories`, filters and sort applied in the browser over the latest 60 published reviews, card row / View all grid), `MediaStrip` + `Lightbox` (customer photos and videos: files in `public/images/customer-media/` plus photos attached to reviews), `WriteReviewDialog` (`ReviewForm`, which now takes a title and up to 3 photos). Hero and trust-band images use `components/ui/OptionalPhoto` (`/images/reviews hero.png`, `/images/your trust our biggest reward banner.png`). "Happy customers" and "Products loved" are constants in the page; the rating, bars, recommend % and counts are real. The page tolerates an API without titles, photos or categories.
- **Fonts:** headings use `font-display` (Cormorant Garamond), body text Jost, prices `font-price` (Montserrat). Digits in the display font are drawn in Montserrat: `app/layout.tsx` loads `app/fonts/montserrat-latin.woff2` as a digits-only face (`unicode-range` 0–9, %, +; `adjustFontFallback: false`), placed first in `--font-display` in `app/globals.css`.
- **Footers:** two designs. `components/layout/Footer.tsx` is used on every page except `/shop`, which gets `components/layout/ShopFooter.tsx`, and `/about`, `/ingredients`, `/reviews` and `/collabs`, which have no site footer (their closing bands end the page). The root layout renders both and `FooterSwitch.tsx` (client, `usePathname`) shows one. They share `FooterBar` (copyright row) and `NewsletterForm` (`variant="button" | "arrow"`). The shop footer's logo is `public/brand/footer-logo-light.png`, generated from `public/images/shop page footer logo.png` (cropped, purple wordmark recoloured cream). The trust strip (`TrustStrip`) is on the homepage only.
- **Sliders:** `lib/loop.ts` (`useLoop`) is the shared infinite slider used by the homepage Bestsellers (`components/home/BestsellersBlock.tsx`), Collaborations (`components/home/Collabs.tsx`) and Instagram (`components/home/InstagramStrip.tsx`, `whenFull: true`) rows. Social links (Instagram, YouTube, Facebook, Threads, X, Pinterest) are admin settings (`store.social`), not code; the brand's handle on every network is `@velastiaofficial`. The header shows Instagram, YouTube and Facebook; the footer shows every network that's filled in. The Instagram section only renders once an Instagram link is saved in admin Settings → Store; its tiles are the files listed in `lib/content.ts`. It renders the list three times, moves with a transform and silently re-centres, so it never rewinds. The Hero slider has its own similar code. The Testimonials row still uses the old `scrollBy` approach.

**Admin**
- `admin/proxy.ts` is only an optimistic cookie-presence guard (redirects to `/login`; `?reason=expired` clears the cookie). The real gate is `requireAdmin()` in `app/(panel)/layout.tsx`, which calls `/admin/auth/me` and shows a forced password-change screen when `mustChangePassword` is set.
- The UI hides screens by role using `can.*` in `admin/lib/api/types.ts`, which mirrors the backend `ROLES`.
- The browser client (`admin/lib/api/client.ts`) does a full-page redirect on 401 and shrinks images over 4 MB in the browser before uploading.
- **Sample data only** (`lib/mock.ts`, flagged `sample: true` in `lib/nav.ts`): Email Campaigns, Traffic Analytics, Backup & Restore.

## F. Backend
- Routes do validation inline: `parse()`, `parsePatch()`, `param()` from `lib/http.ts`.
- Business logic is in `lib/`:
  - `pricing.ts` — `quoteCart`, `evaluateCoupon`, `gstInside`
  - `payments.ts` — Razorpay
  - `invoices.ts`, `gst.ts`, `creditNotes.ts`, `invoiceHtml.ts`
  - `returns.ts`
  - `emails.ts` (templates) and `mail.ts` (sending and logging)
  - `media.ts` (sharp + storage)
  - `settings.ts` (Zod schemas and defaults for every settings key)
  - `auth.ts`, `customerAuth.ts`, `abandoned.ts`, `activity.ts`, `revenue.ts`, `money.ts`, `validate.ts`
- Routes call Prisma directly; there's no repository layer. Simple CMS resources go through the generic `routes/admin/crud.ts`.
- External calls use plain `fetch` with no SDKs.

## G. Database
- PostgreSQL through Prisma 7. The generated client goes to `backend/src/generated/prisma` (gitignored; created by `db:generate`). `prisma.config.ts` reads `DATABASE_URL`.
- **Models:**
  - Catalog: Category, Product, ProductImage, Shade
  - Customers: Customer, Address, WishlistItem, CustomerToken
  - Orders: Order, OrderItem, OrderEvent, ReturnRequest, ReturnItem, CreditNote, DocumentSequence
  - Marketing: Coupon, Offer, ShippingMethod
  - Content: Review, Page (JSON body), BlogPost, Banner, Testimonial, Collaborator, Faq, MediaAsset, Subscriber, Campaign, ContactMessage, CollabApplication
  - System: AdminUser, ActivityLog, Setting (key → JSON), EmailLog
- **Rules:**
  - Money is **integer paise**; percentages are **basis points**.
  - Orders **snapshot** product names, SKUs, prices, HSN codes and GST rates, the shipping address and the shipping method.
  - Products are archived, never deleted.
  - Unique: slugs, SKU, customer/admin email, order/return/invoice/credit-note numbers, `razorpayOrderId`, media url/storageKey.
  - Indexed: foreign keys, status and email.
- **Migrations:** 13, from 2026-09-16 to 2026-10-03 (the last two add `reviews.title`/`reviews.images` and `collaborators.quote`). `invoice_sequences` was renamed to `document_sequences` (series `INV-2627`, `CN-2627`), and `tax_rates` was dropped.
- **Seed** (`prisma/seed.ts`):
  - Idempotent: upserts keyed rows, fills keyless tables only when empty, never overwrites edited data.
  - Creates the first SUPER_ADMIN from `SEED_ADMIN_*` with `mustChangePassword`, and refuses a weak password on a non-local database.
  - Policy text comes from `prisma/content/policies.json`.
- `docker-compose.yml`: Postgres 18 on host port 5433 (development only).

## H. Authentication and authorization
- **Admin:**
  - HS256 JWT with audience `admin`, valid 8 hours, in an httpOnly SameSite=Lax cookie `vel_admin` (`secure` in production).
  - The user is re-read on every request.
  - `sessionVersion` is bumped on password change, reset or deactivation, which kills older sessions.
  - `mustChangePassword` is enforced server-side (`requireCurrentPassword`).
  - bcrypt cost 12. Login runs a dummy hash for unknown emails. Throttled to 5 attempts per IP+email per 15 minutes, in memory.
  - Password rules: at least 12 characters, not the placeholder, doesn't contain the email.
- **Roles** (`middleware/auth.ts` `ROLES`; SUPER_ADMIN passes every gate):
  - CONTENT_MANAGER: pages, blog, media, banners, testimonials, FAQs, SEO, copy, subscribers
  - ORDER_MANAGER: orders and returns (write), inventory
  - SUPPORT_AGENT: read-only orders and customers, reviews
  - Catalog, coupons, offers, categories, users, shipping, store/tax/payments/notifications settings: SUPER_ADMIN only
  - Nobody can demote or deactivate themselves or the last super admin.
- **Customers:**
  - Cookie `vel_customer`, audience `customer`: 30 days with "remember me", otherwise a session cookie with a 12-hour token.
  - Password at least 8 characters.
  - Verify and reset tokens are random values stored as SHA-256 hashes, single-use, valid 48 h / 1 h.
  - Order history (and the phone number) stays hidden until the email is verified.
  - Sign-up and forgot-password never reveal whether an account exists.
- **Invoice and credit-note links:** JWT with audience `invoice`, valid 30 minutes. The invoice page sends its own strict CSP and no referrer.
- **Rate limits** (in memory, per IP, fixed window): orders 30, payments 30, reviews 5, review photos 12, returns 10, forms 10, sign-up 10, email-sending 5 per 10 minutes. Lookups (track, returns, invoice) allow 20 *misses* per 10 minutes.
- **CSRF:** no tokens. Relies on SameSite=Lax, JSON bodies and same-origin proxying. CSP and hardening headers are in both `next.config.ts` files.
- **Boot refusals:** production refuses to start with a weak `JWT_SECRET` or no `PROXY_SECRET`. `ALLOW_PAYMENT_SIMULATOR` is refused in production, against a non-local database, or alongside real Razorpay keys.

## I. API routes (all under `/api/v1`)
- **Public:**
  - `GET /products?category=&bestseller=&q=&sort=`, `/products/:slug`, `/categories`, `/reviews`, `/reviews/summary`, `/settings/public`, `/content/home`, `/banners`, `/offers`, `/faqs`, `/pages`, `/pages/:slug`, `/blog`, `/blog/:slug`
  - `POST /reviews` (optional `title`, up to 3 `images` URLs from `POST /reviews/photos`, checked with `storedImageKey`), `/reviews/photos` (raw image body, re-encoded like admin uploads), `/cart/quote`, `/orders`, `/orders/:n/payment`, `/orders/:n/payment/simulate` (development only), `/webhooks/razorpay`
  - `GET /orders/track?number=&email=`, `GET`/`POST /orders/:n/returns`, `GET /orders/:n/invoice?t=`, `/orders/:n/credit-notes/:id?t=`
  - `/account/*`: register, login, logout, me, password, password/forgot, password/reset, verify, verify/resend, orders, addresses, wishlist (+ merge)
  - `POST /contact`, `/newsletter`, `/collab-applications`
- **Admin:** auth (login, logout, me, password), dashboard, activity, products (+ `/:id/stock`), categories, orders (`/:n/status`, `/tracking`, `/invoice`, `/credit-notes/:id`), customers, reviews, coupons, offers, faqs, testimonials, banners, collaborators, settings (store, welcome-offer, notifications, returns, tax, pickup, payments, seo, copy), pages, blog, inbox, subscribers, users, shipping-methods, emails (+ test), media, reports (sales, products, customers, gst), returns.
- The route table in `backend/README.md` is accurate, apart from the stale items in O.

## J. External integrations
| Service | Code | How |
|---|---|---|
| Razorpay | `backend/src/lib/payments.ts`, `lib/razorpay.ts` | REST with Basic auth: create order, refund. HMAC checks on payment signatures and webhooks (`x-razorpay-signature` over `rawBody`). Disabled without keys. Development simulator otherwise. |
| Resend | `backend/src/lib/mail.ts` | `POST api.resend.com/emails`. Without `RESEND_API_KEY`, or for reserved test domains, emails are only logged as CAPTURED. One-time tokens are removed from logged copies. |
| Supabase Storage | `backend/src/lib/media.ts` | REST upload and delete into a public bucket (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`). Otherwise local disk under `UPLOAD_DIR`. |
| Supabase Postgres | `backend/src/lib/pgConnection.ts` | Strips `sslmode` from the URL and sets TLS manually; `DATABASE_CA_CERT` adds verification. |
| Google Fonts | `next/font/google` in `app/layout.tsx` | Cormorant Garamond, Jost, Dancing Script, Montserrat |

There is no Redis, no analytics and no OAuth.

**Environment variables** (names only; see the `.env.example` files):
- Backend: `DATABASE_URL`, `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `ALLOW_PAYMENT_SIMULATOR`, `RESEND_API_KEY`, `EMAIL_FROM`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `DATABASE_CA_CERT`, `PROXY_SECRET`, `STORE_URL`, `ADMIN_URL`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- Store: `API_URL`, `SITE_URL`, `ALLOW_INDEXING`, `SUPABASE_URL`, `PROXY_SECRET`
- Admin: `API_URL`, `NEXT_PUBLIC_STORE_URL`, `PROXY_SECRET` (`SUPABASE_URL` is read by its CSP)

## K. Key data flows
1. **Placing an order:**
   - CheckoutFlow → `POST /api/v1/orders` → store `proxy.ts` → `orderLimit` → Zod `OrderBody`.
   - `payableMethods()` checks the method is offered; a signed-in customer's email must match.
   - One `$transaction`: `quoteCart(tx)` re-prices; a changed shipping method or a coupon that no longer applies is refused; stock is decremented with a conditional `updateMany` (`stock >= qty`); coupon `usedCount` is bumped conditionally; the customer is upserted; the address is optionally saved; the GST split is computed (seller state from the GSTIN vs ship-to state); the order, items and event are created.
   - Outside the transaction, online orders get a Razorpay order and `razorpayOrderId`.
   - Cash-on-delivery orders send their emails with `afterResponse`.
   - Response 201 → the client stores the order in sessionStorage, clears the cart and opens `/order-success`.
2. **Online payment:**
   - `payForOrder` opens Razorpay → `POST /orders/:n/payment` → `verifyPaymentSignature` → `markPaid` (conditional PENDING→CONFIRMED/PAID) → emails.
   - The webhook (`payment.captured` / `order.paid`) does the same independently.
   - Payment for a cancelled or refunded order goes to `recordLatePayment`, which adds a timeline note and alerts the team.
3. **Admin order status:**
   - `PATCH /admin/orders/:n/status`.
   - For REFUNDED, the Razorpay refund happens first, outside the transaction.
   - Transaction: `TRANSITIONS` check, restock on CANCELLED, `issueInvoice` on SHIPPED (if a GSTIN is saved), `issueCreditNote` on CANCELLED/REFUNDED, update plus event.
   - Then `logActivity` and the customer email.
   - Transitions: PENDING→CONFIRMED|CANCELLED; CONFIRMED→PROCESSING|CANCELLED; PROCESSING→SHIPPED|CANCELLED; SHIPPED→OUT_FOR_DELIVERY|DELIVERED; OUT_FOR_DELIVERY→DELIVERED; DELIVERED→REFUNDED. Cash-on-delivery orders become PAID on DELIVERED.
4. **Returns:**
   - The customer calls `GET`/`POST /orders/:n/returns` (number + email, or a session). `returnability()` checks the window counted from the DELIVERED event date, any open request, and the remaining quantities.
   - The admin moves it APPROVED → RECEIVED → REFUNDED (or REJECTED). The refund goes through the gateway first, then a credit note is issued, and the order is auto-marked REFUNDED once every item has been returned.
5. **Media:** the admin shrinks the image → raw-body `POST /admin/media` (`X-File-Name`) → sharp checks it and re-encodes to WebP (max 2400 px, 50 MP limit, SVG refused) → Supabase or disk → `MediaAsset`. Deleting is blocked while the image is still in use.
6. **Invoices:** never stored. Re-rendered each time from the order snapshots plus the frozen `invoiceSeller` through `taxLines()`. Numbers look like `PREFIX/2627/00001`, sequential per April–March financial year.

## L. Scripts
- **Store and admin:** `dev`, `build` (API must be running), `start`, `lint`.
- **Backend:**
  - `dev` (tsx watch), `build` (tsc → `dist/`), `start` (`node dist/src/server.js`), `typecheck`
  - `db:up` / `db:down` (Docker Postgres)
  - `db:generate`, `db:migrate` (migrate dev; needs CREATEDB for the shadow database), `db:deploy`, `db:seed`
  - `db:studio`, `admin:reset` (one-time admin password; `-- email` to pick an account)
  - `db:reset` — **DESTRUCTIVE**: `migrate reset --force` then seed
  - `smoke` — 330 end-to-end checks; refuses anything but localhost; places orders and changes stock; uses the `smoke-runner@velastia.test` admin
- **Render build:** `npm ci --include=dev && npm run db:generate && npm run build && npx prisma migrate deploy`; start with `npm start`; health check `/health`.
- There's no CI/CD config, no app Dockerfiles, no Prettier, and no unit tests (only the smoke suite).

## M. Implementation status
- **Done:** catalog, search, cart, cash-on-delivery checkout, accounts, wishlist sync, returns, GST invoices and credit notes, tracking, email log, media library, CMS, roles, reports, abandoned-order release.
- **Built but not connected:** Razorpay (needs keys), Resend (needs a key).
- **Sample data only:** admin Campaigns, Traffic Analytics, Backup.
- **Schema with no code behind it:** the `Campaign` table (no routes); `Banner.clicks` and `BlogPost.views` (never written); `Coupon.perCustomerLimit` (not enforced).
- **Hardcoded:** home hero slides, ingredient cards, Instagram tiles.

## N. Known issues and suspicious areas (documented, NOT fixed)
1. **`perCustomerLimit` isn't enforced.** It can be set in the admin and is stored, but `evaluateCoupon` never checks it (`backend/src/lib/pricing.ts:214`).
2. **A Razorpay refund can be sent before the status change is validated.** In `backend/src/routes/admin/orders.ts` (~line 216) the refund is sent before the transition check (~238). Marking a non-delivered paid order REFUNDED refunds the money, then the change is rejected. There's no double-click guard.
3. **Return refunds can be sent twice.** `backend/src/routes/admin/returns.ts:182` refunds outside the transaction, so two concurrent clicks can both refund. `refundPaise` isn't capped at what was paid.
4. **Stock edits can overwrite live orders.** `PATCH /products/:id/stock` reads stock then writes an absolute value (`backend/src/routes/admin/products.ts:207`), so a concurrent order's decrement can be lost.
5. **Admin can confirm an unpaid online order.** PENDING→CONFIRMED by an admin leaves payment PENDING. The sweep then skips it, and a real payment arriving later is treated as "late" and flagged for refund.
6. **Order numbers can be probed.** `POST /orders/:number/payment` answers 404 for unknown numbers and 400/409 for real ones, and isn't on `lookupLimit` (`backend/src/routes/public/checkout.ts:359`).
7. **Guest checkout can attach orders to someone else's account.** Checking out with a registered email while signed out links the order to that account and overwrites its phone (`checkout.ts:175`).
8. **"Verified buyer" can be faked.** The flag depends only on the email the reviewer types (`backend/src/routes/public/catalog.ts` POST `/reviews`, ~line 203).
9. **Return requests have a race.** Remaining quantities are checked outside the insert transaction (`backend/src/routes/public/returns.ts`).
10. **Cancel can race the sweep.** Admin cancel of a PENDING order and the abandoned sweep could both restock, because the admin update isn't conditional.
11. **Logout doesn't revoke tokens.** Admin and customer logout only clear the cookie; `sessionVersion` isn't bumped.
12. **Hidden-category products are still reachable.** `GET /products/:slug` ignores `category.isVisible`; the product list respects it.
13. **The order's tax figure can differ from its invoice by a paisa.** `Order.taxPaise` at checkout comes from quote lines without ids, so `inOrder()` doesn't sort them; the invoice sorts by id.
14. **[unknown]**
    - `app/error.tsx` takes a `retry` prop instead of the classic `reset`. This may be correct for Next 16.3; it couldn't be checked without `node_modules`.
    - Whether Vercel's ~4.5 MB body limit affects the proxy rewrites.

## O. Technical debt and stale docs
- **Stale docs:**
  - The `TODO(payments)` at `checkout.ts:149` and backend README's "Not built yet: Razorpay" — both already done in `lib/abandoned.ts`.
  - Backend README says `invoice_sequences`; the table is now `document_sequences`.
  - Admin README lists Payment Methods as sample (it's live), says "30 routes", and references a storefront `lib/products.ts` that doesn't exist.
  - Root README says "7 screens on sample data"; it's 3.
  - The seed header comment references the storefront `lib/products.ts`.
  - The comment at `lib/api/client.ts:3` says `next.config.ts` forwards requests; it's `proxy.ts`.
  - `DEPLOY.md` hardcodes `C:\Users\thouf\Downloads\PIXIE\AD ATLAS`.
- **Duplicated logic:**
  - The Indian state list exists in three places (`backend/src/lib/gst.ts`, `lib/states.ts`, inline in admin).
  - Role rules are written twice (backend `ROLES` and admin `can`).
  - The proxy code is copied between store and admin.
  - Order and return number generators are near-identical.
  - The `ApiError` classes are written per app.
  - API response types are hand-copied into both frontends' `lib/api/types.ts`.
- **Single-instance assumptions:** rate limits, login throttles and the sweep all live in process memory (Redis would be needed for more than one instance).
- **Formatting hazards:** `backend/src/lib/media.ts:156` contains raw control bytes in a regex (intentional `\0-\x1f\x7f`), so `grep` treats the file as binary; use `grep -a`. Source files use CRLF line endings.
- **The pickup address state** is free text, unlike every other address.

## P. Conventions to follow
- **Money:** integer paise only. Rupee conversion only in `backend/src/lib/money.ts` / storefront `inr*` helpers. Coupons in basis points.
- **Validation:** Zod inline in each handler with `parse()`. **For every PATCH use `parsePatch()`, never `schema.partial()`** (defaults would wipe fields). Route params through `param(req, name)`.
- **Errors:** throw `badRequest` / `unauthorized` / `forbidden` / `notFound` / `conflict` / `tooMany`, never ad-hoc JSON. Responses are always `{data}` or `{error}`.
- **Admin writes:** `allow(...ROLES.x)` per route, plus `logActivity(req, ...)` after every write.
- **Integrity:** race safety through conditional `updateMany` plus count checks inside `$transaction`. Gateway and network calls stay outside transactions.
- **Email:** always through `afterResponse(() => Email[])`, never awaited in the request. All user input passes through `esc()`.
- **Settings:** one row per settings key, with a Zod schema, `DEFAULT_*` values and a lenient `read*()` in `lib/settings.ts`. Old rows must keep parsing.
- **Addresses:** states stored by proper name through `IndianState`; phone numbers through `IndianMobile`.
- **Backend imports:** ESM with `.js` import suffixes.
- **Frontend imports:** the `@/*` alias. Components are PascalCase files; route folders are kebab-case.
- **Prisma:** PascalCase models mapped to snake_case tables.
- **Comments:** long, explaining *why*. Error copy is plain English for shoppers.
- **Styling:** Tailwind v4 tokens (`plum-*`, `gold-*`, `cream-*`, `ink`, `container-vel`) and the `cn()` helper. The admin uses CSS variables such as `--radius-card`, `series-1`.

## Q. Not determined at audit time
- Whether the code currently builds, lints or type-checks (nothing installed or run).
- Exact Next 16.3 API behaviour without its bundled docs.
- What's in the live Supabase database; whether real `.env` files exist elsewhere (only `.env.example` files are here).
- Vercel and Render runtime limits; whether it was deployed as `DEPLOY.md` describes.
- The `reference/` design PNGs (gitignored, absent).
- Whether the smoke suite passes today.

---

# CHANGE SAFETY RULES
1. **Changing `gst.ts` changes past invoices.** Invoices are re-rendered from `taxLines` / `split` / `allocate` / `inOrder` every time. Credit notes depend on line `key` matching order-item ids. Rounding is part of the legal output.
2. **Pricing must stay identical in three places.** `quoteCart` is used by both `/cart/quote` and `POST /orders` (inside the transaction). Checkout refuses to silently change the coupon or shipping method; keep that.
3. **Order status logic is spread out.** `TRANSITIONS`, the `REVENUE` filter (dashboard and reports), `markPaid`, the abandoned sweep, invoice and credit-note issuance, return eligibility (DELIVERED event date), `STATUS_MAIL` emails and the storefront timelines all assume today's statuses.
4. **API response shapes are hand-copied** into both frontends' `lib/api/types.ts`. A backend change needs both updated.
5. **Only keys in `PUBLIC_SETTING_KEYS` reach the storefront.** Settings must stay backward-compatible through `read*()` defaults.
6. **Auth is coupled across apps.** Cookie names (`vel_admin`, `vel_customer`), JWT audiences (`admin`, `customer`, `invoice`), `sessionVersion`, the `proxy.ts` header-stripping and `PROXY_SECRET` must agree between the API and both apps.
7. **Schema changes go through `prisma migrate dev` against a local database only.** Render runs `migrate deploy` on every push. Never run `db:reset`, `smoke` or `seed` with a remote `DATABASE_URL`.
8. **Store builds need a running API** (static params and metadata). A broken endpoint breaks the build.
9. **Security fences are intentional; don't loosen them casually:** CSP in both `next.config.ts` files, simulator locks in `env.ts`, token removal in `mail.ts`, upload re-encoding, constant-time comparisons, identical answers for "no such order" and "wrong email".
10. **Follow the conventions in P.** Install dependencies (with approval) before Next.js work so the version-specific docs in `node_modules/next/dist/docs/` can be read, as `AGENTS.md` requires.
