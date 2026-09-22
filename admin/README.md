# Velastia Admin

The store management panel and CMS for **Velastia**, built from
`M-Admin-Panel-1.0v.png` (in the uncommitted local `reference/` folder).

## This is a separate application

It lives inside the storefront's folder but shares nothing with it:

| | Storefront | Admin |
| --- | --- | --- |
| Location | repo root | `admin/` |
| `package.json` | own | own |
| `node_modules` | own | own |
| Dev port | 3000 | 3001 |
| Imports from the other app | none | none |

Enforced rather than assumed:

- The root `tsconfig.json` **excludes** `admin`, and the root `eslint.config.mjs`
  ignores `admin/**` — the storefront's typecheck and lint never see this code.
- `next.config.ts` here pins `turbopack.root` to this directory, so the admin
  resolves against `admin/node_modules` and never reaches into the store's.
- `lib/mock.ts` keeps its **own** copy of the catalog. It deliberately does not
  import the storefront's `lib/products.ts`.

The only link between the two is the "Visit Website" button, which is a plain
URL (`NEXT_PUBLIC_STORE_URL`, default `http://localhost:3000`).

The intended meeting point is a shared API in the backend phase — not a shared
folder.

## Running

```bash
cd admin && npm install && npm run dev
```

`npm run build` and `npm run lint` both pass clean.

## What's here

30 routes across the five sidebar groups drawn in the reference:

- **Main** — Dashboard, Orders (+ order detail), Customers, Products (+ new/edit
  form), Categories, Inventory, Reviews, Coupons, Offers & Deals
- **Content Management** — Pages, Blog Posts, Media Library, Banners,
  Testimonials, FAQs
- **Marketing** — Email Campaigns, Subscribers, SEO Settings
- **Reports & Analytics** — Sales, Product, Customer, GST Summary, Traffic
- **System Settings** — Users & Roles, Settings, Payment Methods, Shipping
  Methods, Tax Settings, Notifications, Activity Logs, Backup & Restore

Only the **Dashboard** had a design. The other 29 screens were designed to match
it — same shell, same card language, same type scale.

## Charts

Hand-rolled SVG, no charting dependency. They follow a specific set of rules:

- **Colours are validated, not chosen by eye.** The categorical slots
  (violet `#6d4ae0`, orange `#eb6834`, aqua `#1baf7a`) and the single-hue violet
  ordinal ramp were run through a palette validator against the `#ffffff` chart
  surface. Violet/orange clears adjacent CVD ΔE 30.3; all three clear all-pairs
  CVD ΔE 9.2. Aqua sits at 2.82:1 contrast, just under the 3:1 bar, so every
  chart using it carries visible direct labels and a table view.
- **Sales Overview is two plots, not one.** The reference draws revenue (₹) and
  order count on a single ₹ axis, which makes an order count read as a rupee
  figure. They are small multiples here — each measure keeps its own scale.
- **Every chart has a table-view twin** (the toggle in each chart header), so no
  value is reachable by hover alone.
- **Axis labels are HTML, not SVG text.** Text inside a scaled `viewBox` shrinks
  with the container and became unreadable at ~5px in narrow cards.
- Ordered shares (traffic sources) use the single-hue ramp; nominal categories
  use one colour per series, never a value-ramp.

## What is not real yet

Most of the panel reads the live database through the API: the dashboard,
orders, customers, inbox, products, categories, inventory, reviews, coupons,
offers, pages, media, banners, testimonials, FAQs, subscribers, users, settings,
shipping, email log, activity, returns, tax settings with each order's GST
invoice — and the reports (Sales, Products, Customers, and the GST Summary for
filing returns), which count the same orders as the dashboard.

These screens still show sample figures from [`lib/mock.ts`](lib/mock.ts) and
are marked **Sample** in the sidebar, so nothing is mistaken for the store's own
numbers:

| Screen | Why it isn't real yet |
| --- | --- |
| Traffic Analytics | Needs an analytics provider; the store collects no visitor data |
| Blog Posts, Email Campaigns, SEO Settings | Tables and routes not built |
| Payment Methods | Waiting on Razorpay |
| Backup & Restore | Backups belong to the database host |

Each entry is removed from `lib/mock.ts` as its screen is connected.
