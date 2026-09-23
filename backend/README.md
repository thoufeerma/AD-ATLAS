# Velastia API

The backend shared by the storefront (repo root) and the admin CMS (`admin/`).
Neither frontend imports the other; both talk only to this API.

**Stack:** Express 5 · TypeScript · Prisma 7 · PostgreSQL · Zod · JWT (jose)

Online it runs on Render with Supabase for the database and image storage —
see [`../DEPLOY.md`](../DEPLOY.md) and [`../render.yaml`](../render.yaml).

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
The admin panel then makes you choose your own password before anything else
(the seeded one is only ever a starting point), and the seed script refuses to
create a production admin with the placeholder at all. Add the rest of the team
under **Users & Roles**.

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
| `admin:reset` | Forgotten admin password: lists the admin emails and gives one a new one-time password (`-- email` to pick one when there are several). Uses `DATABASE_URL` — see [DEPLOY.md](../DEPLOY.md) for the online database |
| `db:up` / `db:down` | Start / stop the Docker database |
| `smoke` | 287 end-to-end API checks — **dev databases only**, see below |

## API

All routes are under `/api/v1`. Every error has the same shape:
`{ "error": { "code", "message", "details?" } }`.

### Storefront (public)

| Method | Path | |
| --- | --- | --- |
| GET | `/categories` | Visible categories with product counts |
| GET | `/products?category=&bestseller=&q=&sort=` | Active + coming-soon products. `q` searches: every word must match the name, description, category or a shade (max 100 characters) |
| GET | `/products/:slug` | Detail with shades, images, rating breakdown, latest reviews |
| GET | `/reviews?limit=` · `/reviews/summary` | Published reviews; store-wide rating |
| POST | `/reviews` | Submit a review — held as pending until an admin publishes it |
| GET | `/content/home` | Testimonials, collaborators, banners |
| GET | `/banners` · `/offers` | Active banners (by placement); offers in their date window |
| GET | `/faqs` · `/pages/:slug` · `/settings/public` | CMS content. `welcomeOffer` is read from the live coupon and is `null` when it's off; `seo` carries every page's title and description, the share image and whether search engines are welcome |
| POST | `/cart/quote` | Authoritative cart pricing — writes nothing. Lists every enabled shipping option priced for the cart; pass `shippingMethodId` to price with one |
| POST | `/orders` | Place an order |
| GET | `/orders/track?number=&email=` | Needs **both** — see Security |
| POST | `/account/register` · `/login` · `/logout` | Customer accounts (cookie `vel_customer`) |
| GET · PATCH | `/account/me` | Profile |
| POST | `/account/password` · `/password/forgot` · `/password/reset` | Change, or reset by emailed link |
| POST | `/account/verify` · `/verify/resend` | Confirm the email (emailed link) |
| GET | `/account/orders` | Order history — only once the email is verified |
| GET · POST · PATCH · DELETE | `/account/addresses` (`/:id`) | Saved addresses (up to 10) |
| GET · POST · DELETE | `/account/wishlist` (`/:slug`) · `/merge` | The account's wishlist (up to 100), as product slugs. `merge` folds in what the shopper's browser had saved when they sign in |
| POST | `/contact` · `/newsletter` · `/collab-applications` | Forms |
| GET · POST | `/orders/:number/returns` (`?email=`) | Whether a return is possible and what's left to return; ask for one. Identified like order tracking — number plus email — or by the signed-in customer's own orders |
| GET | `/orders/:number/invoice?t=` · `/credit-notes/:id?t=` | The GST invoice and credit notes as printable pages. `t` is the signed link that `/orders/track` and `/account/orders` return (`invoice.url`, `invoice.creditNotes[].url`), good for 24 hours |

Public POSTs are rate-limited per IP (in memory): orders 20, reviews 5, return
requests 10 and each form 10 per 10 minutes. Behind a proxy, make sure it sets `X-Forwarded-For`.

### Admin — session cookie required (except `/auth/login`)

| Path | Methods | Roles beyond Super Admin |
| --- | --- | --- |
| `/admin/auth/login` · `/logout` · `/me` | POST · POST · GET | — |
| `/admin/auth/password` | POST (change your own) | any signed-in admin |
| `/admin/users` · `/:id` · `/:id/reset-password` | GET · POST · PATCH · POST | super admin only |
| `/admin/shipping-methods` · `/:id` · `/order` | GET · POST · PATCH · DELETE · PUT | super admin only |
| `/admin/settings/notifications` | PUT | super admin only |
| `/admin/emails` · `/:id` | GET (the Email Log; filter by `status`, `q`, `orderId`) | Order Manager, Support |
| `/admin/emails/test` | POST (send a test email) | super admin only |
| `/admin/media` · `/:id` | GET · POST (raw image body, `X-File-Name`) · PATCH (alt) · DELETE | Content Manager |
| `/admin/dashboard` | GET | all |
| `/admin/reports/sales` · `/products` | GET | all (revenue, no customer details) |
| `/admin/reports/customers` | GET | Order Manager, Support |
| `/admin/returns` · `/counts` · `/:number` | GET | Order Manager, Support |
| `/admin/returns/:number` | PATCH `{ status, staffNote?, refundPaise? }` | Order Manager |
| `/admin/settings/returns` · `/tax` | PUT | super admin only |
| `/admin/reports/gst?month=YYYY-MM` | GET (invoices, and totals by state and HSN) | Order Manager, Support |
| `/admin/products` · `/:id` | GET · POST · PATCH · DELETE (archives) | read: Order Manager, Support |
| `/admin/products/:id/stock` | PATCH `{ set }` or `{ adjust }` | Order Manager |
| `/admin/orders` · `/:number` | GET | Order Manager, Support |
| `/admin/orders/:number/status` | PATCH (marking it `SHIPPED` issues the invoice) | Order Manager |
| `/admin/orders/:number/invoice` | GET (printable page) · POST (issue it now) | read: Support |
| `/admin/orders/:number/credit-notes/:id` | GET (printable page) | Order Manager, Support |
| `/admin/customers` · `/:id` | GET | Order Manager, Support |
| `/admin/reviews` · `/:id` | GET · PATCH · DELETE | Support Agent |
| `/admin/categories` · `/coupons` · `/offers` | CRUD | — |
| `/admin/faqs` · `/testimonials` · `/banners` · `/collaborators` | CRUD | Content Manager |
| `/admin/activity` | GET | — |
| `/admin/settings` | GET | Content Manager |
| `/admin/settings/store` · `/welcome-offer` | PUT | super admin only |
| `/admin/settings/copy` · `/seo` | PUT | Content Manager |
| `/admin/pages` · `/:slug` | GET · PATCH | Content Manager |
| `/admin/inbox/counts` · `/messages` · `/applications` (+ `/:id`) | GET · PATCH · DELETE | all staff |
| `/admin/subscribers` · `/:id` | GET · PATCH | Content Manager |

Roles follow the permissions drawn on the admin's Users & Roles screen.
Uploaded images are served at **`/uploads/…`** (outside `/api/v1`); both
frontends pass `/uploads/*` through to the API.

## Email

The store emails customers an **order confirmation** and **order updates**
(shipped, out for delivery, delivered, cancelled, refunded — with any note the
team adds, such as a tracking number) and **return updates** (approved, turned
down, received, refunded), and emails the team **alerts** for new orders,
return requests, contact messages and collab applications. Each can be switched off, and
alert recipients set, under Settings → Notifications in the admin.

Emails are sent through [Resend](https://resend.com) when `RESEND_API_KEY` is set
(see `.env.example`). **Without it nothing is sent**: every email is still built
and kept in the admin's Email Log, marked "Not sent", so you can see exactly
what customers would receive. Addresses on reserved test domains
(`example.com`, `*.test`, …) are never really emailed, so the smoke suite can't
bounce mail off a real provider.

Emails go out after the API has answered, and a failure is only logged — email
can never slow down, fail or undo an order. Everything a shopper typed is
HTML-escaped in the templates (`src/lib/emails.ts`).

## Conventions that matter

- **Money is integer paise.** ₹799 is `79900`. Never floats. Razorpay uses paise too.
  Percent coupons are basis points: `1000` = 10%.
- **Orders snapshot** product name, SKU, price, the shipping address and the delivery method, so
  editing the catalog never rewrites a customer's order history.
- **Partial updates use `parsePatch()`, never `parse(schema.partial())`.** Zod's
  `.partial()` still applies `.default()` values, which silently reset untouched
  fields — a price-only edit once wiped a product's stock, shades and images.
  `parsePatch` keeps only the keys the request actually sent.
- **Route params use `param(req, name)`** — Express 5 types them as
  `string | string[]`.
- **States are stored by their proper name.** Addresses must name a real state
  or union territory (`IndianState` in `src/lib/validate.ts` accepts "tamilnadu"
  or "TN" and stores "Tamil Nadu"): the invoice's tax depends on it.

## GST invoices

Switched on by saving a GSTIN under Settings → Tax (`/admin/settings/tax`). From
then on:

- **Each product has an HSN code and GST rate** (default 3304 at 18%), copied
  onto the order line at purchase. Prices include GST; the invoice shows the tax
  inside them.
- **An order gets its invoice when it's marked shipped**, or earlier with
  `POST /admin/orders/:number/invoice`. Numbers read `PREFIX/2627/00001`, in
  sequence through each April–March financial year (`invoice_sequences`), never
  reused. Unpaid online orders and cancelled ones get none.
- **Same state as the GSTIN → CGST + SGST; any other state → IGST.** The
  coupon discount is shared across the lines by value; delivery is taxed at the
  highest item rate. The rules live in `src/lib/gst.ts` (`taxLines`).
- **Invoices aren't stored as files.** They're rendered from the order's
  snapshots plus the seller details frozen when the invoice was issued
  (`orders.invoiceSeller`), so they read the same each time. Changing
  `taxLines` changes past invoices too.
- **Credit notes are issued automatically** (`src/lib/creditNotes.ts`),
  numbered `CN/2627/00001` in their own series:
  - a return marked refunded → the returned items, for the amount refunded
    (anything beyond what was paid for them goes to delivery, then the rest
    of the order);
  - an invoiced order cancelled, or refunded as a whole → whatever of the
    invoice hasn't been credited yet.

  Unlike invoices, their lines are stored as issued. Tax is reversed in the
  form the invoice charged it, and crediting everything that's left reverses
  exactly what's left, so a fully credited invoice nets to zero to the paisa.
  A return's suggested refund is what was paid for the items after the
  order's coupon, not their list price.
- **`/admin/reports/gst`** gives each month's invoices and credit notes, and
  totals by place of supply and rate, and by HSN — net of credit notes, the
  shape GST returns ask for.
- **Not covered:** B2B invoices with the buyer's GSTIN, and e-invoicing
  (IRN/QR), which only applies above ₹5 crore turnover. Refunds are recorded,
  not paid: once Razorpay is connected, online orders' refunds can be sent
  from the Returns screen and attached to the same credit note.

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
  is re-read on every request, so a role change or deactivation takes effect
  immediately. Each token carries the account's `sessionVersion`; changing or
  resetting a password, or turning an account off, bumps it and ends every
  older session.
- **Passwords**: at least 12 characters, not the placeholder, not containing the
  email. New accounts and admin resets get a one-time password (shown once,
  stored only as a bcrypt hash), and an account on a one-time or placeholder
  password can do nothing but change it — enforced by the API, not just the
  admin panel. Nobody can demote or turn off themselves, or the last super admin.
- **Customer accounts** use their own cookie and token audience — a customer's
  token is rejected by the admin API and vice versa. Order history (and any
  phone number from earlier guest orders) stays hidden until the email is
  verified, so signing up with someone else's address reveals nothing.
  Emailed links are single-use, expire (48 h to verify, 1 h to reset) and are
  stored only as SHA-256 hashes. Forgot-password answers the same whether or
  not the account exists; sign-in uses the same timing-safe, throttled check
  as the admin. Password changes and resets end every other session.
- **Uploads** are decoded and re-encoded (WebP, max 2400px) rather than stored
  as sent: that proves each file is really an image whatever its name or type
  claims, strips metadata such as a phone's GPS location, and defuses files
  crafted to be two things at once. SVG is refused; files over `MAX_UPLOAD_MB`
  and images over 50 megapixels are rejected. Stored names are random, served
  only from inside the upload folder, and an image still in use can't be deleted.
  Online (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) they go to a public
  Supabase Storage bucket and are served from its CDN; the key stays on the API.
- **Rate limits see the real visitor.** Online, the store and admin forward
  browser calls from their servers, so they send the visitor's IP in
  `X-Velastia-Client-IP` with `PROXY_SECRET`. The API believes that header only
  when the secret matches (compared in constant time), so a direct caller can't
  pick its own address. Without the secret it uses the connection's address.
- **Database TLS.** `?sslmode=require` in `DATABASE_URL` encrypts the
  connection; adding Supabase's CA certificate (`DATABASE_CA_CERT`) also
  verifies it. See `src/lib/pgConnection.ts`.
- **CORS** is an explicit allow-list (`CORS_ORIGINS`) — never a wildcard with
  credentials.
- **Refuses to boot in production** with a missing, short or placeholder
  `JWT_SECRET`, or without `PROXY_SECRET`. The seed refuses to create an admin
  with the placeholder password on any database that isn't on this machine.
- Order status can only move forward along valid transitions; cancelling
  returns stock. Products are archived, never hard-deleted. Used coupons are
  deactivated rather than deleted.

## Testing

```bash
npm run dev      # in one terminal
npm run smoke    # in another
```

Runs 53 storefront and 234 admin checks, including a concurrent-purchase race,
the admin account lifecycle and regression tests for the partial-update bug.
Rerunnable against a used database: every fixture it creates is suffixed per
run. It **refuses to target anything but localhost**, because it places orders
and edits stock.

The admin checks sign in as their own account, `smoke-runner@velastia.test`,
which the run switches on with a fresh random password and switches off again
afterwards (`scripts/smoke-admin-user.ts`). They never use or need your login,
so they keep working after you change your password. Accounts the tests create
show up, turned off, on the Users & Roles screen.

## Not built yet

- **Razorpay.** Online-payment orders are created as `PENDING` and reserve stock.
  The gateway integration must also *release* that stock on payment failure or
  after an expiry window — see the `TODO(payments)` in `routes/public/checkout.ts`.
- **SMS / WhatsApp** order updates (email only for now).
- **Remaining CMS resources**: blog posts and campaigns. The tables
  exist; the routes don't. (Pages, store settings, the inbox, subscribers,
  Users & Roles, shipping methods and the media library are done.)
- **Login throttling and rate limits are in-memory** — correct for one instance,
  need Redis once the API runs on several.
- The smoke suite is end-to-end only; there are no unit tests yet.
