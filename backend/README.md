# Velastia API

The backend shared by the storefront (repo root) and the admin CMS (`admin/`).
Neither frontend imports the other; both talk only to this API.

**Stack:** Express 5 · TypeScript · Prisma 7 · PostgreSQL · Zod · JWT (jose)

## Setup

Requires **Node 20.19+ / 22.12+ / 24+** (Prisma 7 refuses to install on older).

```bash
cd backend
npm install
cp .env.example .env        # then set JWT_SECRET — see the file
```

### Database — pick one

**Native PostgreSQL** (default in `.env.example`, port 5432). Create the role and
database once, as the `postgres` superuser. PowerShell:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE ROLE velastia WITH LOGIN PASSWORD 'velastia_dev' CREATEDB;" -c "CREATE DATABASE velastia OWNER velastia;"
```

**Docker** (port 5433): `npm run db:up`, then switch `DATABASE_URL` in `.env` to
the 5433 line. `CREATEDB` matters either way — `prisma migrate dev` creates a
temporary shadow database.

### Then

```bash
npm run db:migrate          # create tables
npm run db:seed             # catalog, content, settings, first admin
npm run dev                 # http://localhost:4000
```

Sign in to the admin with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.
**Change that password before this goes anywhere near production** — the seed
script refuses to create a production admin with the placeholder.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | API with auto-reload |
| `build` / `start` | Compile to `dist/` and run it |
| `typecheck` | `tsc --noEmit` |
| `db:migrate` | Create + apply a migration from schema changes |
| `db:deploy` | Apply existing migrations (production) |
| `db:seed` | Idempotent seed — safe to rerun, never overwrites edited data |
| `db:studio` | Prisma Studio, a GUI over the database |
| `db:up` / `db:down` | Start / stop the Docker database |
| `smoke` | 78 end-to-end API checks — **dev databases only**, see below |

## API

All routes are under `/api/v1`. Every error has the same shape:
`{ "error": { "code", "message", "details?" } }`.

### Storefront (public)

| Method | Path | |
| --- | --- | --- |
| GET | `/categories` | Visible categories with product counts |
| GET | `/products?category=&bestseller=&sort=` | Active + coming-soon products |
| GET | `/products/:slug` | Detail with shades, images, rating breakdown, latest reviews |
| GET | `/reviews?limit=` · `/reviews/summary` | Published reviews; store-wide rating |
| POST | `/reviews` | Submit a review — held as pending until an admin publishes it |
| GET | `/content/home` | Testimonials, collaborators, banners |
| GET | `/banners` · `/offers` | Active banners (by placement); offers in their date window |
| GET | `/faqs` · `/pages/:slug` · `/settings/public` | CMS content. `welcomeOffer` is read from the live coupon and is `null` when it's off |
| POST | `/cart/quote` | Authoritative cart pricing — writes nothing |
| POST | `/orders` | Place an order |
| GET | `/orders/track?number=&email=` | Needs **both** — see Security |
| POST | `/contact` · `/newsletter` · `/collab-applications` | Forms |

Public POSTs are rate-limited per IP (in memory): orders 20, reviews 5 and each
form 10 per 10 minutes. Behind a proxy, make sure it sets `X-Forwarded-For`.

### Admin — session cookie required (except `/auth/login`)

| Path | Methods | Roles beyond Super Admin |
| --- | --- | --- |
| `/admin/auth/login` · `/logout` · `/me` | POST · POST · GET | — |
| `/admin/dashboard` | GET | all |
| `/admin/products` · `/:id` | GET · POST · PATCH · DELETE (archives) | read: Order Manager, Support |
| `/admin/products/:id/stock` | PATCH `{ set }` or `{ adjust }` | Order Manager |
| `/admin/orders` · `/:number` | GET | Order Manager, Support |
| `/admin/orders/:number/status` | PATCH | Order Manager |
| `/admin/customers` · `/:id` | GET | Order Manager, Support |
| `/admin/reviews` · `/:id` | GET · PATCH · DELETE | Support Agent |
| `/admin/categories` · `/coupons` · `/offers` | CRUD | — |
| `/admin/faqs` · `/testimonials` · `/banners` · `/collaborators` | CRUD | Content Manager |
| `/admin/activity` | GET | — |
| `/admin/settings` | GET | Content Manager |
| `/admin/settings/store` · `/welcome-offer` | PUT | super admin only |
| `/admin/settings/copy` | PUT | Content Manager |
| `/admin/pages` · `/:slug` | GET · PATCH | Content Manager |

Roles follow the permissions drawn on the admin's Users & Roles screen.

## Conventions that matter

- **Money is integer paise.** ₹799 is `79900`. Never floats. Razorpay uses paise too.
  Percent coupons are basis points: `1000` = 10%.
- **Orders snapshot** product name, SKU, price and the shipping address, so
  editing the catalog never rewrites a customer's order history.
- **Partial updates use `parsePatch()`, never `parse(schema.partial())`.** Zod's
  `.partial()` still applies `.default()` values, which silently reset untouched
  fields — a price-only edit once wiped a product's stock, shades and images.
  `parsePatch` keeps only the keys the request actually sent.
- **Route params use `param(req, name)`** — Express 5 types them as
  `string | string[]`.

## Security properties

Each of these is exercised by `npm run smoke`.

- **Server-authoritative pricing.** Totals are always recomputed from the
  database; prices sent by a client are ignored.
- **No overselling.** Stock is decremented with a conditional update inside the
  order transaction, so concurrent buyers can't both take the last units.
- **Order tracking requires number *and* email**, and returns the same 404 for
  either being wrong — order numbers can't be enumerated.
- **Admin login** returns one message for every failure, runs a bcrypt compare
  even for unknown emails (no timing leak), and locks after 5 failures per
  IP + email for 15 minutes.
- **Sessions** are HS256 JWTs in an `HttpOnly`, `SameSite=Lax` cookie. The user
  is re-read on every request, so deactivating an admin takes effect immediately.
- **CORS** is an explicit allow-list (`CORS_ORIGINS`) — never a wildcard with
  credentials.
- **Refuses to boot in production** with a missing, short or placeholder
  `JWT_SECRET`.
- Order status can only move forward along valid transitions; cancelling
  returns stock. Products are archived, never hard-deleted. Used coupons are
  deactivated rather than deleted.

## Testing

```bash
npm run dev      # in one terminal
npm run smoke    # in another
```

Runs 30 storefront and 48 admin checks, including a concurrent-purchase race and
regression tests for the partial-update bug. Rerunnable against a used database:
every fixture it creates is suffixed per run. It **refuses to target anything
but localhost**, because it places orders and edits stock.

## Not built yet

- **Razorpay.** Online-payment orders are created as `PENDING` and reserve stock.
  The gateway integration must also *release* that stock on payment failure or
  after an expiry window — see the `TODO(payments)` in `routes/public/checkout.ts`.
- **Customer accounts.** Checkout works as a guest; customer login, saved
  addresses and order history are not wired.
- **Media uploads.** Image URLs are stored as storefront-relative paths. Real
  uploads need object storage (S3, Cloudinary, R2).
- **Email / SMS** for order confirmations and shipping updates.
- **Remaining CMS resources**: blog posts, media library, campaigns, subscribers,
  shipping/tax editing, admin user management. The tables exist; the routes don't.
  (Pages and store settings are done.)
- **Login throttling and rate limits are in-memory** — correct for one instance,
  need Redis once the API runs on several.
- The smoke suite is end-to-end only; there are no unit tests yet.
