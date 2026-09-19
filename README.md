# Velastia — Storefront

Next.js frontend for **Velastia**, a premium cosmetics brand by AD Atlas Ventures Pvt Ltd.

Built from 22 design reference PNGs. They live in a local `reference/` folder that is
**deliberately not committed** (36 MB) — ask the project owner for a copy.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first `@theme` tokens in [`app/globals.css`](app/globals.css))
- Data from the Velastia API ([`backend/`](backend/)) — products, prices, stock,
  reviews, content, settings, orders
- `zustand` for cart + wishlist (persisted to `localStorage`)
- `lucide-react` for icons — note that lucide has **dropped its brand icons**, so
  Instagram / YouTube / Facebook / X / Pinterest are hand-inlined in
  [`components/ui/SocialIcons.tsx`](components/ui/SocialIcons.tsx)

## Running

The storefront needs the API running (see [`backend/README.md`](backend/README.md)).

```bash
cp .env.example .env.local   # API_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:3000
```

`npm run build` pre-renders every page from the API, so **the API must be running
during a build** too. `npm run build` and `npm run lint` both pass clean.

## How it talks to the API

- **Pages** are server components that read from the API through
  [`lib/api/server.ts`](lib/api/server.ts). Responses are cached for 60 seconds, so
  an edit in the admin shows on the live site within about a minute. If the API
  is briefly down, the last good page keeps being served.
- **The browser** (cart pricing, checkout, forms, order tracking) calls this site's
  own `/api/v1/*`, which [`next.config.ts`](next.config.ts) forwards to the API —
  same origin, so no CORS setup is needed for the store.
- **Prices are never computed in the browser.** The cart and checkout show the
  API's quote ([`lib/cart.ts`](lib/cart.ts)); the API re-prices again when the
  order is placed.

## Project phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Storefront frontend (repo root) | **Done** |
| 2 | Admin / CMS frontend ([`admin/`](admin/)) | **Done** — 11 screens still on sample data |
| 3 | Backend API — Express + TypeScript + Prisma + PostgreSQL ([`backend/`](backend/)) | **Done** |
| 3b | Storefront connected to the API | **Done** |
| 4 | Razorpay — UPI, cards, netbanking, wallets | Not started |

Until Razorpay is connected, **cash on delivery is the only payment method** at
checkout; the online methods are shown as "Coming soon".

## What the admin controls on the site

| Admin screen | Where it shows |
| --- | --- |
| Products, Inventory, Categories | Shop, product pages, cart, wishlist — price, stock, shades, "out of stock", "only a few left" |
| Reviews | Product pages, Reviews page, homepage rating panel (published reviews only) |
| Coupons | Cart / checkout. The hero "10% OFF" medallion and Offers page callout follow the `welcomeOffer` coupon and disappear if it's switched off |
| Banners | `global.topbar` → announcement bar, `shop.sidebar` → shop offer card, `cart.inline` → cart promo |
| Offers & Deals | Offers page (display only — discounts come from coupons) |
| FAQs, Testimonials, Collaborators | FAQs page, homepage, cart, Collabs page |
| Pages | Shipping, Returns, Terms and Privacy policies |
| Settings | Support contacts and company name (header, footer, contact, policies), the welcome offer, and marketing copy ("Loved by Thousands", "10K+ Happy Customers", "Why Velastia?") |
| Shipping Methods | Delivery options at checkout (price, delivery time, free-above amount, order); the first one on is the default behind every "free shipping above…" note |
| Orders | Track Order page; marking an order shipped, out for delivery, delivered, cancelled or refunded emails the customer |
| Notifications, Email Log | Which emails go out (order confirmation, order updates, team alerts) and a copy of every one. Until an email service is connected nothing is sent — each email is kept in the log instead |

Policy text can include live values — `{{free_shipping_above}}`, `{{shipping_fee}}`,
`{{support_email}}`, `{{legal_entity}}` and others listed in the page editor — so it
stays correct when settings change.

Shoppers' reviews, contact messages, newsletter sign-ups and collab applications
are saved through the API. New reviews wait for approval on the admin Reviews
screen; contact messages and collab applications land in the admin **Inbox**
(with an open-items count in the sidebar); newsletter sign-ups are listed under
**Subscribers**, with a CSV export of everyone still subscribed.

## Where things live

```
app/                    one folder per route
components/
  layout/               Header, Footer, Logo, NewsletterForm — the global shell
  providers/            SettingsProvider — store settings for client components
  ui/                   Button, ProductCard, PageBanner, StarRating, Avatar, …
  forms/ reviews/       contact, collab and review forms
  home/ shop/ product/ cart/ checkout/ auth/ order/
lib/
  api/server.ts         server-side reads (cached 60s)
  api/client.ts         browser-side calls via /api/v1
  api/types.ts          API response shapes (money in integer paise)
  cart.ts               cart lines vs. live catalog, server quote hook
  store.ts              cart + wishlist state (localStorage)
  content.ts            ingredient cards + Instagram tiles (not in the CMS yet)
  tokens.ts             fills {{tokens}} in CMS page text from settings
public/                 imagery cropped out of the reference PNGs
```

## Design decisions worth knowing

The reference set contains **three design generations** that disagree with each
other. These were resolved as follows:

1. **Global shell** follows **Gen B (2025)** — the Cart / Wishlist / Login /
   Order Success screens: four header icons including the wishlist heart, and the
   five-column footer with contact details. `CONTACT` was kept in the nav
   alongside `OFFERS` so the Contact page stays reachable.
2. **Homepage** follows `B-1-Home-page-1.0v.png` (Our Story + stats + collab CTA),
   not the older `A-Home-page.png`.
3. **Catalog conflicts** were resolved in favour of the newest screen when the
   catalog was seeded (see `backend/prisma/seed.ts`):
   - Foundation is priced ₹1,099 / ₹1,299 / ₹1,499 across three screens → using ₹1,499
   - Cart, Wishlist and Order Success show a shade **"Royal Rose"** that isn't in
     the product page's list of six → not seeded; "Rose Desire" is the first shade
   - Shop marks most products `COMING SOON` while Cart/Wishlist show six of them
     purchasable → those six are active, the rest coming-soon
   - Day Cream and Night Cream both at ₹1,987 looks like placeholder copy
4. **Cart arithmetic** follows `M-Cart`, which is correct. `N-Order-Success`
   prints `Subtotal ₹4,031 / Discount ₹403` for lines that sum to ₹4,830 — its
   subtotal and discount are wrong, though its total (₹4,347) is right.
   Discounts are exact to the paisa (10% of ₹799 is ₹79.90).
5. **Checkout** had no full design, only a thumbnail on `web-page-design-Passed-01.png`.
   Built as Shipping → Payment → Review in the Cart's visual language.
6. **Offers** had no design at all; it lists the offers switched on in the admin.
7. **Claims the store can't honour yet were removed**: "Buy 2 Get 1 Free" and the
   product page's "Buy all 3 & save 15%" (nothing at checkout applies them), and
   "32 answered questions". The product page's lipstick feature list, lip
   ingredients and how-to steps only show on lip products.

## Imagery

**Logo.** The official logo master is [`brand/velastia-logo.png`](brand/velastia-logo.png)
(3200×3200, transparent). The web versions were generated from it: `public/brand/logo.png`
(purple wordmark, for light backgrounds), `logo-light.png` (cream wordmark, for the
footer, phone menu and the admin sidebar), `logo-mark.png` (monogram only), and the
favicons / home-screen icons in `app/` — the admin has its own copies. If the logo
changes, regenerate all of them from the new master.

All photography in `public/` was cropped programmatically out of the reference
PNGs, so it is low resolution and carries JPEG artefacts. **Replace it with the
real brand assets before launch.** Product shots came from the Wishlist screen
(the largest clean source at 1536px wide) and the hero from `Webpage-Design=Passed.png`.

## Known gaps

- No designs exist for Account/Profile, Order History or Search results; customer
  accounts don't exist yet, so the login page is UI only
- The homepage hero slides are still in code (not banner-driven)
- Marketing claims carried over from the designs ("Loved by Thousands",
  "Trusted by 10,000+ Beautiful Souls", "10K+ Happy Customers") are editable under
  Settings → Site Copy. Confirm or reword them before launch; the review counts
  shown beside them are real
- The policy text (seeded from `backend/prisma/content/policies.json`) was written
  to match the policies stated elsewhere in the designs, because the body text in
  screens I–L is not legible at the supplied resolution. It mentions email/SMS
  tracking links and Razorpay, which aren't live yet. **Have it reviewed before
  launch** — edit it under Pages in the admin
