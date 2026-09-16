# Velastia — Storefront

Next.js frontend for **Velastia**, a premium cosmetics brand by AD Atlas Ventures Pvt Ltd.

Built from 22 design reference PNGs. They live in a local `reference/` folder that is
**deliberately not committed** (36 MB) — ask the project owner for a copy.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first `@theme` tokens in [`app/globals.css`](app/globals.css))
- `zustand` for cart + wishlist (persisted to `localStorage`)
- `lucide-react` for icons — note that lucide has **dropped its brand icons**, so
  Instagram / YouTube / Facebook / X / Pinterest are hand-inlined in
  [`components/ui/SocialIcons.tsx`](components/ui/SocialIcons.tsx)

## Running

```bash
npm install
npm run dev
```

`npm run build` and `npm run lint` both pass clean.

## Project phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Storefront frontend (repo root) | **Done** |
| 2 | Admin / CMS frontend ([`admin/`](admin/)) | **Done** |
| 3 | Backend API — Express + TypeScript + Prisma + PostgreSQL (`backend/`) | In progress |
| 4 | Razorpay — UPI, cards, netbanking, wallets | Not started |

Everything renders from local data. There is no backend, no database and no auth
yet: the login form, contact form, collab form and newsletter inputs are UI only,
and checkout stashes the order in `sessionStorage` instead of charging a card.

## Where things live

```
app/                    one folder per route
components/
  layout/               Header, Footer, Logo — the global shell
  ui/                   Button, ProductCard, PageBanner, StarRating, …
  home/ shop/ product/ cart/ checkout/ auth/ order/
lib/
  products.ts           CATALOG SOURCE OF TRUTH — start here
  content.ts            testimonials, collaborators, ingredients, FAQs
  legal.ts              shipping / returns / terms / privacy copy
  store.ts              cart + wishlist state and totals
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
3. **Catalog conflicts** are resolved in favour of the newest screen and flagged
   inline in `lib/products.ts`. The live ones:
   - Foundation is priced ₹1,099 / ₹1,299 / ₹1,499 across three screens → using ₹1,499
   - Cart, Wishlist and Order Success show a shade **"Royal Rose"** that isn't in
     the product page's list of six → treated as an alias of "Rose Desire"
   - Shop marks most products `COMING SOON` while Cart/Wishlist show six of them
     purchasable → those six are `active`, the rest coming-soon
   - Day Cream and Night Cream both at ₹1,987 looks like placeholder copy
4. **Cart arithmetic** follows `M-Cart`, which is correct. `N-Order-Success`
   prints `Subtotal ₹4,031 / Discount ₹403` for lines that sum to ₹4,830 — its
   subtotal and discount are wrong, though its total (₹4,347) is right.
5. **Checkout** had no full design, only a thumbnail on `web-page-design-Passed-01.png`.
   Built as Shipping → Payment → Review in the Cart's visual language.
6. **Offers** had no design at all; assembled from the promotions the other
   screens advertise.

## Imagery

All photography in `public/` was cropped programmatically out of the reference
PNGs, so it is low resolution and carries JPEG artefacts. **Replace it with the
real brand assets before launch.** Product shots came from the Wishlist screen
(the largest clean source at 1536px wide) and the hero from `Webpage-Design=Passed.png`.

## Known gaps

- No designs exist for Account/Profile, Order History or Search results
- The Track Order lookup reveals the sample order from the design; it does not query anything
- Legal copy in `lib/legal.ts` was written to match the policies stated elsewhere
  in the designs (7-day returns, free shipping above ₹999, Razorpay, Mumbai) because
  the body text in screens I–L is not legible at the supplied resolution.
  **Have it reviewed before launch.**
- Node 22.7 is below the 22.13 that ESLint 9.39 wants. Linting works; a Node
  bump would clear the `EBADENGINE` warning.
