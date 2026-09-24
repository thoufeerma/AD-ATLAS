# Launch checklist

Everything still standing between the built store and opening it to customers.
Tick items off as they're done; anything marked **verify** is done in code but
not yet confirmed on the live site.

The site is feature-complete for cash on delivery. Razorpay and a courier come
after launch, by decision.

## 1. Domain and addresses

- [ ] Add the domain to the **store** project in Vercel (apex + `www`)
- [ ] Add a subdomain (e.g. `admin.velastia.in`) to the **admin** project
- [ ] Store project: `SITE_URL` → the live domain
- [ ] Admin project: `NEXT_PUBLIC_STORE_URL` → the live domain
- [ ] Render (API): `STORE_URL`, `ADMIN_URL`, `CORS_ORIGINS` → both addresses
- [ ] Redeploy all three, then sign in to the admin again (cookies are tied to
      the address, so the old session ends)

## 2. Emails

Nothing reaches customers until this is done: order confirmations, the
confirmation link that unlocks order history, return updates and invoice links
all sit in the admin's **Email Log** instead.

- [ ] Create a Resend account and verify the domain (add the DNS records)
- [ ] Render: `RESEND_API_KEY`, and `EMAIL_FROM` on the same domain, e.g.
      `Velastia <orders@velastia.in>`
- [ ] Send a test email from the admin (Settings → Notifications)
- [ ] Add the team's addresses under Notifications, so order and return alerts
      reach someone
- [ ] Place a test order and confirm the confirmation email arrives

## 3. Words and details

- [x] Support email → `hello@velastia.in`, phone → `+91 86066 30088` — live
      and confirmed in the footer (2026-09-24)
- [ ] Support hours — still the placeholder "Mon - Sat | 10AM - 7PM"
- [ ] City — still the placeholder "Mumbai, India"
- [ ] Legal name on invoices — "AD Atlas Ventures Private Limited", confirm it
      matches the GST registration exactly
- [ ] Social links (Settings → Store): only the ones filled in are shown
- [ ] Marketing claims (Settings → Site Copy): "Loved by Thousands", "Trusted
      by 10,000+ Beautiful Souls", "10K+ Happy Customers" — make them true or
      reword them
- [x] Policy pages no longer promise SMS tracking or Razorpay card payments;
      they describe cash on delivery, emailed tracking and credit notes. Seeded
      to the live database on 2026-09-24; **verify** by reading the shipping,
      returns and privacy pages. Put the payment wording back when Razorpay
      goes live
- [ ] Have someone read the shipping, returns, terms and privacy pages properly
      — they were written to match the designs, not by a lawyer
- [x] Ran `npm run db:seed` against Supabase on 2026-09-24 (collaborator
      photos, returns wording, the perfume's HSN code, contact details)

## 4. Tax and invoices

- [ ] Enter the GSTIN, legal name and registered address under Settings → Tax.
      Invoices start the moment this is saved
- [ ] Set the HSN code and rate for the brushes, beauty blender and cleansing
      tissues — they're on the make-up default (3304 at 18%)
- [ ] Have your accountant check the first invoice and the first credit note,
      and the monthly GST Summary export

## 5. Photographs

Measured widths of what's in `public/` today. Anything under about 800px looks
soft on a modern screen. Replace by uploading in the admin's Media Library and
choosing the new image on each product, banner or testimonial.

- [ ] **Product photos — the worst of it:** 160–206px wide, shown several times
      larger (lip liner and night cream are 160px; day cream, face serum,
      foundation, hyper gloss and matte lipstick are 206px)
- [ ] Testimonial faces: 58px
- [ ] Instagram strip on the home page: 104px
- [ ] Ingredient icons: 118px
- [ ] About page: hero 609px, lab 253px, our-story 352px
- [ ] Page banners: shop 464px, track order 480px, cart 497px, wishlist 776px
- [ ] Login page artwork: 592px; home "Behind the Beauty" tile: 552px

Already fine: the logo (1200px), home hero slides (1800px), coming-soon card,
founder's photo (851px) and the share image (1200px).

## 6. Before announcing it

- [ ] Place a real order on the live site, end to end, and check the emails
- [ ] Mark it processing → shipped, and check the invoice looks right
- [ ] Try a return on it, refund it, and check the credit note
- [ ] Switch on "Let search engines list the store" (SEO Settings)
- [ ] Submit the sitemap in Google Search Console
- [ ] Move Render off the free plan, so the site doesn't sleep between visits
- [ ] Turn on Supabase's daily backups
- [ ] Change the admin password set during deployment, and give each person
      their own account with the right role instead of sharing one login

## 7. Razorpay and the courier

Both are built and tested; what's left is the accounts.

- [ ] Open the Razorpay account and finish its checks
- [ ] Put `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and
      `RAZORPAY_WEBHOOK_SECRET` on the API (Render), and redeploy
- [ ] Add the webhook in Razorpay: `<your api>/api/v1/webhooks/razorpay`, for
      the payment events. Settings → Payment Methods shows when it's connected
- [ ] Try it with Razorpay's test keys first, then switch to live ones
- [ ] Choose which methods to offer under Settings → Payment Methods
- [ ] Choose a courier. Tracking, package weights and the pickup address are
      already in the admin, so you can ship by hand from day one and connect a
      courier's API later
- [ ] Fill in the pickup address under Settings → Shipping Methods
- [ ] Weigh the products and record it on each one

## 8. Later

- [ ] Invoices carrying a business customer's GSTIN, if salons or resellers
      start buying
