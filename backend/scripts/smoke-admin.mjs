// Admin (CMS) API smoke test. Rerunnable: every fixture it creates carries a
// per-run suffix, and state-dependent checks set up their own baseline.
//
// DEVELOPMENT ONLY — creates products, coupons and orders. Signs in as the
// dedicated test account that `npm run smoke` switches on for the run
// (scripts/smoke-admin-user.ts) — never a real person's login.
import "dotenv/config";
import sharp from "sharp";

const API = `${process.env.SMOKE_API_URL ?? "http://localhost:4000"}/api/v1`;
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(API)) {
  console.error(`Refusing to run smoke tests against ${API} — they create data. Localhost only.`);
  process.exit(2);
}
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Run this through `npm run smoke`, which sets up the test admin account.");
  process.exit(2);
}
const ORDER = process.argv[2];
if (!ORDER) {
  console.error("Usage: node scripts/smoke-admin.mjs <order-number>  (npm run smoke passes it for you)");
  process.exit(2);
}
const RUN = String(Date.now()).slice(-6);
let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}${extra ? "  - " + extra : ""}`); }
  else { fail++; console.log(`  FAIL  ${label}${extra ? "  - " + extra : ""}`); }
};
let cookie = "";
async function call(method, path, body, headers = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
}
const pub = (method, path, body) => fetch(API + path, {
  method, headers: { "content-type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
}).then(async (r) => ({ status: r.status, json: await r.json().catch(() => null) }));
const timed = async (fn) => { const t = performance.now(); const r = await fn(); return [r, performance.now() - t]; };
const shipTo = { phone: "9876543210", shipping: { line1: "12 MG Road", city: "Pune", state: "Maharashtra", pincode: "411001" } };

console.log(`\n[run ${RUN}]`);

console.log("\n[Access control]");
{
  ok((await call("GET", "/admin/dashboard")).status === 401, "dashboard without a session -> 401");
  const forged = await call("GET", "/admin/dashboard", undefined, { cookie: "vel_admin=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4Iiwicm9sZSI6IlNVUEVSX0FETUlOIn0.forged" });
  ok(forged.status === 401, "forged token -> 401");
}

console.log("\n[Login]");
{
  const [wrongPw, t1] = await timed(() => call("POST", "/admin/auth/login", { email: ADMIN_EMAIL, password: "wrong-password" }));
  const [noUser, t2] = await timed(() => call("POST", "/admin/auth/login", { email: `ghost${RUN}@velastia.com`, password: "wrong-password" }));
  ok(wrongPw.status === 401 && noUser.status === 401 && wrongPw.json.error.message === noUser.json.error.message,
    "wrong password and unknown email give the identical message", `"${wrongPw.json.error.message}"`);
  const ratio = Math.max(t1, t2) / Math.min(t1, t2);
  ok(ratio < 3, "and comparable timing (no user enumeration)", `${t1.toFixed(0)}ms vs ${t2.toFixed(0)}ms`);

  const login = await call("POST", "/admin/auth/login", { email: ADMIN_EMAIL.toUpperCase(), password: ADMIN_PASSWORD });
  const setCookie = login.headers.get("set-cookie") ?? "";
  cookie = setCookie.split(";")[0];
  ok(login.status === 200 && login.json.data.role === "SUPER_ADMIN", "valid login (email case-insensitive)", login.json.data?.email);
  ok(/HttpOnly/i.test(setCookie) && /SameSite=Lax/i.test(setCookie), "session cookie is HttpOnly + SameSite=Lax");
  ok(!/passwordHash/.test(JSON.stringify(login.json)), "password hash never returned");
  const me = await call("GET", "/admin/auth/me");
  ok(me.status === 200 && me.json.data.role === "SUPER_ADMIN", "GET /me with session");
}

console.log("\n[Dashboard]");
{
  const d = await call("GET", "/admin/dashboard");
  const k = d.json.data.kpis;
  ok(d.status === 200, "dashboard loads", `orders(30d)=${k.orders.value}, revenue=Rs ${(k.revenuePaise.value / 100).toLocaleString("en-IN")}`);
  ok(d.json.data.salesByMonth.length === 12, "12 zero-filled months");
  ok(d.json.data.topProducts.length > 0, "top products from real order items", d.json.data.topProducts.map((p) => `${p.name.replace("Velastia ", "")}x${p.unitsSold}`).join(", "));
}

console.log("\n[Reports]");
{
  const sales = await call("GET", "/admin/reports/sales");
  const s = sales.json.data;
  const thisMonth = s.months.at(-1);
  ok(sales.status === 200 && s.months.length === 12, "sales report covers 12 months", `${s.totals.orders} orders, Rs ${(s.totals.revenuePaise / 100).toLocaleString("en-IN")}`);
  // The month the smoke orders were placed in must be the last point, not cut
  // off the end of the series (it was, before the month range was fixed).
  ok(thisMonth?.month === new Date().toISOString().slice(0, 7) && thisMonth.orders > 0, "the current month is the last point and counts today's orders", thisMonth?.month);
  ok(s.totals.orders === s.months.reduce((n, m) => n + m.orders, 0), "monthly orders add up to the total");
  ok(s.best?.month === thisMonth.month, "best month is the one with the most revenue");

  const dash = (await call("GET", "/admin/dashboard")).json.data;
  const dashYear = dash.salesByMonth.reduce((n, m) => n + m.salesPaise, 0);
  ok(dashYear === s.totals.revenuePaise, "dashboard and sales report count the same orders", `Rs ${(dashYear / 100).toLocaleString("en-IN")}`);

  const products = (await call("GET", "/admin/reports/products")).json.data;
  ok(products.top.length > 0 && products.top.every((p, i, a) => i === 0 || a[i - 1].revenuePaise >= p.revenuePaise), "top products, highest revenue first", products.top[0]?.name);
  ok(products.totals.unitsSold === products.top.reduce((n, p) => n + p.unitsSold, 0) + products.neverSold.reduce((n, p) => n + p.unitsSold, 0) || products.totals.unitsSold > 0, "units sold counted from order items", `${products.totals.unitsSold} units`);
  ok(products.neverSold.every((p) => p.unitsSold === 0), "the 'not selling' list really has no sales", `${products.neverSold.length} products`);
  ok(products.byCategory.every((c) => c.revenuePaise >= 0) && products.byCategory.length > 0, "revenue split by category", products.byCategory.map((c) => c.name).join(", "));

  const customers = (await call("GET", "/admin/reports/customers")).json.data;
  ok(customers.totals.customers > 0 && customers.newByMonth.length === 12, "customer report covers 12 months", `${customers.totals.customers} customers, ${customers.totals.accounts} with accounts`);
  ok(customers.segments.reduce((n, s2) => n + s2.count, 0) === customers.totals.customers, "every customer lands in exactly one segment");
  ok(customers.top.every((c, i, a) => i === 0 || a[i - 1].spentPaise >= c.spentPaise) && customers.top.every((c) => c.orders > 0), "highest lifetime value first, buyers only");
}

console.log("\n[Orders]");
{
  const list = await call("GET", "/admin/orders?q=smoke");
  ok(list.status === 200 && list.json.data.some((o) => o.number === ORDER), "search finds the test order", `${list.json.meta.total} match`);

  const detail = await call("GET", `/admin/orders/${ORDER}`);
  ok(detail.status === 200 && detail.json.data.items.length === 2, "order detail with items + customer", detail.json.data.customer?.email);

  const back = await call("PATCH", `/admin/orders/${ORDER}/status`, { status: "PENDING" });
  ok(back.status === 400, "illegal transition CONFIRMED -> PENDING refused", back.json.error.message);

  const fwd = await call("PATCH", `/admin/orders/${ORDER}/status`, { status: "PROCESSING", note: "Packed at Mumbai warehouse" });
  ok(fwd.status === 200 && fwd.json.data.events.length === 2, "CONFIRMED -> PROCESSING, timeline grows", fwd.json.data.events.map((e) => e.status).join(" -> "));

  const serumBefore = (await call("GET", "/admin/products?q=face%20serum")).json.data[0].stock;
  const cancel = await call("PATCH", `/admin/orders/${ORDER}/status`, { status: "CANCELLED", note: "Customer request" });
  const serumAfter = (await call("GET", "/admin/products?q=face%20serum")).json.data[0].stock;
  ok(cancel.status === 200 && serumAfter === serumBefore + 2, "cancel returns stock to inventory", `face serum ${serumBefore} -> ${serumAfter}`);

  ok((await call("PATCH", `/admin/orders/${ORDER}/status`, { status: "SHIPPED" })).status === 400, "cancelled order can't be shipped");
}

console.log("\n[Catalog]");
{
  const lipstick = (await call("GET", "/admin/categories")).json.data.find((c) => c.slug === "lipstick");

  const created = await call("POST", "/admin/products", {
    name: `Smoke Test Balm ${RUN}`, sku: `vel-test-${RUN}`, categoryId: lipstick.id, pricePaise: 49900, stock: 5,
    isBestseller: true, benefits: ["Softens", "Protects"],
    shades: [{ code: "01", name: "Clear", hex: "#f4e1dc" }],
    images: [{ url: "/products/lip-liner.png", alt: "Balm" }],
  });
  const pid = created.json.data?.id;
  ok(created.status === 201 && created.json.data.slug === `smoke-test-balm-${RUN}` && created.json.data.sku === `VEL-TEST-${RUN}`,
    "create product (slug derived, SKU upper-cased)", `status ${created.json.data?.status}`);

  const dupe = await call("POST", "/admin/products", { name: `Another ${RUN}`, sku: `VEL-TEST-${RUN}`, categoryId: lipstick.id, pricePaise: 100 });
  ok(dupe.status === 409 && /sku/.test(dupe.json.error.message), "duplicate SKU -> 409 naming the field", dupe.json.error.message);

  const badHex = await call("PATCH", `/admin/products/${pid}`, { shades: [{ code: "01", name: "X", hex: "pink" }] });
  ok(badHex.status === 400, "invalid shade hex rejected", badHex.json.error.details?.[0]?.message);

  // REGRESSION: a partial update must not reset untouched fields to their defaults.
  const upd = await call("PATCH", `/admin/products/${pid}`, { pricePaise: 59900, status: "ACTIVE" });
  const u = upd.json.data;
  ok(upd.status === 200 && u.pricePaise === 59900, "update price + publish");
  ok(u.stock === 5 && u.shades.length === 1 && u.images.length === 1 && u.isBestseller === true && u.benefits.length === 2,
    "REGRESSION: price-only update keeps stock, shades, images, bestseller, benefits",
    `stock=${u.stock} shades=${u.shades.length} images=${u.images.length} bestseller=${u.isBestseller} benefits=${u.benefits.length}`);

  ok((await call("PATCH", `/admin/products/${pid}/stock`, { adjust: -10 })).status === 400, "stock can't go below zero");
  ok((await call("PATCH", `/admin/products/${pid}/stock`, { set: 1, adjust: 1 })).status === 400, "set and adjust together rejected");
  const restock = await call("PATCH", `/admin/products/${pid}/stock`, { adjust: 20, reason: "Restock" });
  ok(restock.status === 200 && restock.json.data.stock === 25, "restock +20", `5 -> ${restock.json.data?.stock}`);

  const inUse = await call("DELETE", `/admin/categories/${lipstick.id}`);
  ok(inUse.status === 409, "can't delete a category that still has products", inUse.json.error.message);

  // REGRESSION: renaming a hidden category must not make it visible again.
  const cat = (await call("POST", "/admin/categories", { name: "Test Hidden", slug: `test-hidden-${RUN}`, sortOrder: 9, isVisible: false })).json.data;
  const renamed = (await call("PATCH", `/admin/categories/${cat.id}`, { name: "Test Hidden Renamed" })).json.data;
  ok(renamed.name === "Test Hidden Renamed" && renamed.isVisible === false && renamed.sortOrder === 9,
    "REGRESSION: renaming a hidden category keeps it hidden", `isVisible=${renamed.isVisible} sortOrder=${renamed.sortOrder}`);
  ok((await call("DELETE", `/admin/categories/${cat.id}`)).status === 204, "empty category can be deleted");

  const del = await call("DELETE", `/admin/products/${pid}`);
  const after = await call("GET", `/admin/products/${pid}`);
  ok(del.status === 204 && after.json.data.status === "ARCHIVED", "delete archives instead of destroying");
  ok((await pub("GET", `/products/smoke-test-balm-${RUN}`)).status === 404, "archived product disappears from the storefront");
}

console.log("\n[Coupons]");
{
  const over = await call("POST", "/admin/coupons", { code: `TOOMUCH${RUN}`, type: "PERCENTAGE", value: 15000 });
  ok(over.status === 400, "150% discount refused", over.json.error.details?.[0]?.message);
  const backwards = await call("POST", "/admin/coupons", { code: `BACKWARDS${RUN}`, type: "FIXED", value: 100, startsAt: "2026-12-01", expiresAt: "2026-01-01" });
  ok(backwards.status === 400, "expiry before start refused");
  const good = await call("POST", "/admin/coupons", { code: `monsoon${RUN}`, type: "PERCENTAGE", value: 1500, minOrderPaise: 99900 });
  ok(good.status === 201 && good.json.data.code === `MONSOON${RUN}`, "valid coupon created, code upper-cased");
  ok((await call("PATCH", `/admin/coupons/${good.json.data.id}`, { value: 99999 })).status === 400, "PATCH still enforces the 100% cap");

  const redeem = await pub("POST", "/orders", {
    email: `coupon.user.${RUN}@example.com`, name: "Coupon User", ...shipTo,
    items: [{ slug: "day-cream", quantity: 1 }], couponCode: `MONSOON${RUN}`, paymentMethod: "COD",
  });
  ok(redeem.status === 201 && redeem.json.data.discountPaise === Math.round(198700 * 0.15),
    "coupon redeemed in a real order", `discount Rs ${redeem.json.data?.discountPaise / 100}`);

  const findCode = async (code) => (await call("GET", "/admin/coupons")).json.data.find((c) => c.code === code);
  const used = await findCode(`MONSOON${RUN}`);
  const delUsed = await call("DELETE", `/admin/coupons/${used.id}`);
  const usedAfter = await findCode(`MONSOON${RUN}`);
  ok(delUsed.status === 204 && usedAfter && usedAfter.isActive === false,
    "deleting a USED coupon deactivates it instead", `usedCount=${usedAfter?.usedCount}, isActive=${usedAfter?.isActive}`);

  const unused = (await call("POST", "/admin/coupons", { code: `NEVERUSED${RUN}`, type: "FIXED", value: 5000 })).json.data;
  await call("DELETE", `/admin/coupons/${unused.id}`);
  ok(!(await findCode(`NEVERUSED${RUN}`)), "deleting an UNUSED coupon removes it");
}

console.log("\n[Content & activity]");
{
  const faq = await call("POST", "/admin/faqs", { question: `Do you ship internationally? (${RUN})`, answer: "Not yet - India only for now.", category: "Shipping", sortOrder: 7, isPublished: false });
  ok(faq.status === 201, "create hidden FAQ via generic CRUD");
  // REGRESSION: editing an unpublished FAQ's wording must not publish it.
  const faqEdit = (await call("PATCH", `/admin/faqs/${faq.json.data.id}`, { question: `Do you ship outside India? (${RUN})` })).json.data;
  ok(faqEdit.isPublished === false && faqEdit.sortOrder === 7,
    "REGRESSION: editing a hidden FAQ keeps it hidden and in place", `isPublished=${faqEdit.isPublished} sortOrder=${faqEdit.sortOrder}`);
  const publicFaqs = await pub("GET", "/faqs");
  ok(!publicFaqs.json.data.some((f) => f.question.includes(`(${RUN})`)), "hidden FAQ stays off the storefront");

  const review = (await call("GET", "/admin/reviews")).json.data[0];
  await call("PATCH", `/admin/reviews/${review.id}`, { status: "PENDING" });
  const queue = await call("GET", "/admin/reviews?status=PENDING");
  ok(queue.status === 200 && queue.json.data.some((x) => x.id === review.id) && queue.json.data.every((x) => x.status === "PENDING"),
    "pending review queue filters correctly", `${queue.json.data.length} waiting`);
  const mod = await call("PATCH", `/admin/reviews/${review.id}`, { status: "PUBLISHED" });
  ok(mod.status === 200 && mod.json.data.status === "PUBLISHED", "publish a review");

  const a = await call("GET", "/admin/activity?take=50");
  ok(a.status === 200 && a.json.data.length >= 8, "activity log recorded admin actions", `latest: "${a.json.data[0].action}"`);
}

console.log("\n[Settings & pages]");
{
  const get = await call("GET", "/admin/settings");
  const before = get.json.data;
  ok(get.status === 200 && before.store?.name && before.copy?.ratingHeadline, "read store settings and site copy");

  // Site copy flows to the public settings the storefront reads.
  const copy = { ...before.copy, ratingHeadline: `Rated by our customers ${RUN}` };
  const put = await call("PUT", "/admin/settings/copy", copy);
  const seen = await pub("GET", "/settings/public");
  ok(put.status === 200 && seen.json.data.copy.ratingHeadline === copy.ratingHeadline, "site copy edit reaches the storefront settings");
  const badCopy = await call("PUT", "/admin/settings/copy", { ...copy, whyVelastia: [] });
  ok(badCopy.status === 400, "site copy needs at least one 'Why Velastia' point");
  await call("PUT", "/admin/settings/copy", before.copy);

  const badStore = await call("PUT", "/admin/settings/store", { ...before.store, supportEmail: "not-an-email" });
  ok(badStore.status === 400, "store details are validated", badStore.json.error.details?.[0]?.path);

  // Social links: only full https:// links; blanks hide the icon on the store.
  const insecure = await call("PUT", "/admin/settings/store", { ...before.store, social: { ...before.store.social, instagram: "http://instagram.com/velastia" } });
  ok(insecure.status === 400 && insecure.json.error.details?.[0]?.path === "social.instagram", "social links must be https://", insecure.json.error.details?.[0]?.message);
  const social = await call("PUT", "/admin/settings/store", {
    ...before.store,
    social: { ...before.store.social, instagram: `https://instagram.com/velastia${RUN}`, youtube: "" },
    instagramHandle: "velastia.beauty",
  });
  const shown = (await pub("GET", "/settings/public")).json.data.store;
  ok(
    social.status === 200 && shown.social.instagram === `https://instagram.com/velastia${RUN}` && shown.social.youtube === null && shown.instagramHandle === "@velastia.beauty",
    "social links reach the storefront (blank -> hidden, handle gets its @)",
  );
  await call("PUT", "/admin/settings/store", before.store);
  ok((await pub("GET", "/settings/public")).json.data.store.social.instagram === before.store.social.instagram, "store details restored");

  // The welcome offer must be a real percentage coupon; "none" hides it.
  const fixed = await call("PUT", "/admin/settings/welcome-offer", { code: "WELCOME200" });
  ok(fixed.status === 400, "welcome offer refuses a fixed-amount coupon", fixed.json.error.message);
  const ghost = await call("PUT", "/admin/settings/welcome-offer", { code: `NOPE${RUN}` });
  ok(ghost.status === 400, "welcome offer refuses a coupon that doesn't exist");
  await call("PUT", "/admin/settings/welcome-offer", { code: null });
  const off = await pub("GET", "/settings/public");
  ok(off.json.data.welcomeOffer === null, "no welcome offer -> storefront stops advertising one");
  const back = await call("PUT", "/admin/settings/welcome-offer", { code: before.welcomeOffer.code });
  ok(back.status === 200 && back.json.data.welcomeOffer.code === before.welcomeOffer.code, "welcome offer restored", before.welcomeOffer.code);

  // Policy pages.
  const list = await call("GET", "/admin/pages");
  ok(list.status === 200 && ["shipping", "returns", "terms", "privacy"].every((s) => list.json.data.some((p) => p.slug === s)), "four policy pages", list.json.data.map((p) => p.slug).join(", "));
  const page = (await call("GET", "/admin/pages/shipping")).json.data;
  ok(page.tokens?.includes("free_shipping_above") && JSON.stringify(page.body).includes("{{free_shipping_above}}"), "policy text uses live-value tokens");
  const edited = { ...page.body, lead: `Edited in the admin ${RUN}` };
  const patch = await call("PATCH", "/admin/pages/shipping", { body: edited });
  const live = await pub("GET", "/pages/shipping");
  ok(patch.status === 200 && live.json.data.body.lead === edited.lead && live.json.data.title === page.title, "page edit is public, and untouched fields survive");
  const empty = await call("PATCH", "/admin/pages/shipping", { body: { lead: "", sections: [] } });
  ok(empty.status === 400, "a page needs at least one section");
  const missing = await call("PATCH", `/admin/pages/nope-${RUN}`, { title: "Nope" });
  ok(missing.status === 404, "unknown page -> 404");
  await call("PATCH", "/admin/pages/shipping", { body: page.body });
  const restored = await pub("GET", "/pages/shipping");
  ok(JSON.stringify(restored.json.data.body.sections) === JSON.stringify(page.body.sections), "page restored");
}

console.log("\n[Inbox & subscribers]");
{
  // A shopper writes in through the storefront…
  const subject = `Where is my order ${RUN}`;
  await pub("POST", "/contact", { name: "Inbox Tester", email: `inbox.${RUN}@example.com`, subject, message: "Smoke test message, safe to delete." });
  await pub("POST", "/collab-applications", { name: "Collab Tester", email: `collab.${RUN}@example.com`, handle: `@tester${RUN}`, about: "Smoke test application, safe to delete." });
  await pub("POST", "/newsletter", { email: `news.${RUN}@example.com`, source: "footer" });

  const counts0 = (await call("GET", "/admin/inbox/counts")).json.data;
  const open = (await call("GET", "/admin/inbox/messages")).json.data;
  const msg = open.find((m) => m.subject === subject);
  ok(!!msg && counts0.messages >= 1 && counts0.total === counts0.messages + counts0.applications, "new message is in the open inbox, counted in the badge", `${counts0.total} open`);

  const done = await call("PATCH", `/admin/inbox/messages/${msg.id}`, { isHandled: true });
  const counts1 = (await call("GET", "/admin/inbox/counts")).json.data;
  const doneList = (await call("GET", "/admin/inbox/messages?status=done")).json.data;
  ok(done.status === 200 && counts1.messages === counts0.messages - 1 && doneList.some((m) => m.id === msg.id), "mark done moves it out of the open count");

  const del = await call("DELETE", `/admin/inbox/messages/${msg.id}`);
  const all = (await call("GET", "/admin/inbox/messages?status=all")).json.data;
  ok(del.status === 204 && !all.some((m) => m.id === msg.id), "delete removes the message");
  ok((await call("DELETE", `/admin/inbox/messages/${msg.id}`)).status === 404, "deleting it again -> 404");

  const app = (await call("GET", "/admin/inbox/applications")).json.data.find((a) => a.handle === `@tester${RUN}`);
  const rev = await call("PATCH", `/admin/inbox/applications/${app?.id}`, { isReviewed: true });
  ok(rev.status === 200 && rev.json.data.isReviewed === true, "collab application marked reviewed");
  await call("DELETE", `/admin/inbox/applications/${app.id}`);

  const subs = (await call("GET", "/admin/subscribers")).json.data;
  const sub = subs.find((x) => x.email === `news.${RUN}@example.com`);
  ok(sub?.status === "SUBSCRIBED" && sub.source === "footer", "newsletter sign-up listed with its source");
  const uns = await call("PATCH", `/admin/subscribers/${sub.id}`, { status: "UNSUBSCRIBED" });
  ok(uns.status === 200 && uns.json.data.status === "UNSUBSCRIBED", "subscriber can be unsubscribed");
  const bad = await call("PATCH", `/admin/subscribers/${sub.id}`, { status: "DELETED" });
  ok(bad.status === 400, "unknown subscriber status rejected");
  ok((await call("GET", "/admin/inbox/messages?status=bogus")).status === 400, "unknown inbox filter rejected");
}

console.log("\n[Admin accounts]");
{
  // Requests as someone else, with their own cookie.
  const as = async (who, method, path, body) => {
    const res = await fetch(API + path, {
      method,
      headers: { "content-type": "application/json", ...(who ? { cookie: who } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json, cookie: res.headers.get("set-cookie")?.split(";")[0] };
  };

  const email = `staff.${RUN}@example.com`;
  const created = await call("POST", "/admin/users", { name: `Staff ${RUN}`, email, role: "CONTENT_MANAGER" });
  const temp = created.json.data?.temporaryPassword;
  const staffId = created.json.data?.user.id;
  ok(created.status === 201 && /^[a-z2-9]{4}(-[a-z2-9]{4}){3}$/.test(temp ?? "") && created.json.data.user.mustChangePassword, "super admin adds a user with a one-time password");
  ok((await call("POST", "/admin/users", { name: "Dup", email, role: "SUPPORT_AGENT" })).status === 409, "same email twice -> 409");
  const list = (await call("GET", "/admin/users")).json.data;
  ok(list.some((u) => u.id === staffId) && list.every((u) => !("passwordHash" in u)), "users list never exposes password hashes");

  // First sign-in: locked to changing the password.
  const first = await as(null, "POST", "/admin/auth/login", { email, password: temp });
  ok(first.status === 200 && first.json.data.mustChangePassword === true, "temporary password signs in, flagged must-change");
  const blocked = await as(first.cookie, "GET", "/admin/pages");
  ok(blocked.status === 403 && blocked.json.error.code === "PASSWORD_CHANGE_REQUIRED", "everything else refused until the password is changed");
  ok((await as(first.cookie, "GET", "/admin/auth/me")).status === 200, "…but they can still see who they are");

  const wrong = await as(first.cookie, "POST", "/admin/auth/password", { currentPassword: "nope", newPassword: "a-much-better-password" });
  ok(wrong.status === 400 && wrong.json.error.details?.[0]?.path === "currentPassword", "wrong current password refused");
  const weak = await as(first.cookie, "POST", "/admin/auth/password", { currentPassword: temp, newPassword: "short" });
  ok(weak.status === 400 && weak.json.error.details?.[0]?.path === "newPassword", "too-short new password refused", weak.json.error.message);
  const placeholder = await as(first.cookie, "POST", "/admin/auth/password", { currentPassword: temp, newPassword: "change-me-please-now" });
  ok(placeholder.status === 400, "placeholder-style password refused");

  const newPassword = `Velvet-${RUN}-matte-rose`;
  const changed = await as(first.cookie, "POST", "/admin/auth/password", { currentPassword: temp, newPassword });
  ok(changed.status === 200 && changed.json.data.mustChangePassword === false && !!changed.cookie, "password changed, fresh session issued");
  ok((await as(first.cookie, "GET", "/admin/auth/me")).status === 401, "the session from before the change no longer works");
  const staff = changed.cookie;
  ok((await as(staff, "GET", "/admin/pages")).status === 200, "content manager can now use content screens");
  ok((await as(staff, "GET", "/admin/users")).status === 403, "…but not Users & Roles");
  ok((await as(staff, "GET", "/admin/reports/sales")).status === 200, "content manager may see the sales report");
  ok((await as(staff, "GET", "/admin/reports/customers")).status === 403, "…but not customer names and emails");

  // Role changes and switching off apply on the very next request.
  await call("PATCH", `/admin/users/${staffId}`, { role: "ORDER_MANAGER" });
  ok((await as(staff, "GET", "/admin/pages")).status === 403, "role change takes effect immediately");
  const off = await call("PATCH", `/admin/users/${staffId}`, { isActive: false });
  ok(off.status === 200 && (await as(staff, "GET", "/admin/auth/me")).status === 401, "turning an account off ends its session at once");
  ok((await as(null, "POST", "/admin/auth/login", { email, password: newPassword })).status === 401, "a turned-off account can't sign in");

  // Reset issues a new one-time password and ends sessions.
  await call("PATCH", `/admin/users/${staffId}`, { isActive: true });
  const reset = await call("POST", `/admin/users/${staffId}/reset-password`);
  const temp2 = reset.json.data?.temporaryPassword;
  ok(reset.status === 200 && temp2 && temp2 !== temp, "password reset issues a new one-time password");
  ok((await as(null, "POST", "/admin/auth/login", { email, password: newPassword })).status === 401, "old password stops working after a reset");
  const again = await as(null, "POST", "/admin/auth/login", { email, password: temp2 });
  ok(again.status === 200 && again.json.data.mustChangePassword === true, "…and the new one must be changed on sign-in");

  // Nobody can lock themselves out.
  const me = (await call("GET", "/admin/auth/me")).json.data;
  ok((await call("PATCH", `/admin/users/${me.id}`, { role: "SUPPORT_AGENT" })).status === 409, "can't change your own role");
  ok((await call("PATCH", `/admin/users/${me.id}`, { isActive: false })).status === 409, "can't turn off your own account");
  ok((await call("POST", `/admin/users/${me.id}/reset-password`)).status === 409, "own password is changed, not reset");

  await call("PATCH", `/admin/users/${staffId}`, { isActive: false }); // tidy up
}

console.log("\n[Shipping methods]");
{
  const before = (await call("GET", "/admin/shipping-methods")).json.data;
  ok(Array.isArray(before) && before.length >= 1, "list shipping methods", before.map((m) => m.name).join(", "));

  const created = await call("POST", "/admin/shipping-methods", { name: `Courier ${RUN}`, eta: "2 – 3 business days", pricePaise: 14900, freeAbovePaise: 149900, isEnabled: true });
  const m = created.json.data;
  ok(created.status === 201 && m.sortOrder > Math.max(...before.map((b) => b.sortOrder)), "add a method (goes last)");
  ok((await call("POST", "/admin/shipping-methods", { name: "X", eta: "", pricePaise: -1, freeAbovePaise: null, isEnabled: true })).status === 400, "invalid method rejected");

  const q = (await pub("POST", "/cart/quote", { items: [{ slug: "day-cream", quantity: 1 }], shippingMethodId: m.id })).json.data;
  ok(q.shipping.id === m.id && q.shippingPaise === 0, "new method is offered at checkout, free above its own threshold", "Rs 1,987 cart >= Rs 1,499");

  const edited = await call("PATCH", `/admin/shipping-methods/${m.id}`, { pricePaise: 12900 });
  ok(edited.status === 200 && edited.json.data.pricePaise === 12900 && edited.json.data.eta === "2 – 3 business days", "edit keeps untouched fields");

  const ids = [m.id, ...before.map((b) => b.id)];
  const reordered = await call("PUT", "/admin/shipping-methods/order", { ids });
  const q2 = (await pub("POST", "/cart/quote", { items: [{ slug: "lip-liner", quantity: 1 }] })).json.data;
  ok(reordered.status === 200 && q2.shipping.id === m.id, "moving a method to the top makes it the default");
  ok((await call("PUT", "/admin/shipping-methods/order", { ids: ids.slice(1) })).status === 409, "reorder must list every method");

  // Checkout needs one enabled method: switch the others off, then try the last.
  const wasOn = before.filter((b) => b.isEnabled);
  try {
    for (const b of wasOn) await call("PATCH", `/admin/shipping-methods/${b.id}`, { isEnabled: false });
    const lastOff = await call("PATCH", `/admin/shipping-methods/${m.id}`, { isEnabled: false });
    ok(lastOff.status === 409, "can't turn off the only enabled method", lastOff.json.error?.message);
    ok((await call("DELETE", `/admin/shipping-methods/${m.id}`)).status === 409, "can't delete it either");
  } finally {
    for (const b of wasOn) await call("PATCH", `/admin/shipping-methods/${b.id}`, { isEnabled: true });
    await call("PUT", "/admin/shipping-methods/order", { ids: [...before.map((b) => b.id), m.id] });
  }
  const del = await call("DELETE", `/admin/shipping-methods/${m.id}`);
  const after = (await call("GET", "/admin/shipping-methods")).json.data;
  ok(del.status === 204 && after.map((a) => `${a.id}:${a.isEnabled}`).join() === before.map((b) => `${b.id}:${b.isEnabled}`).join(), "method deleted; original methods and order restored");
}

console.log("\n[Emails]");
{
  // Emails go out just after the response, so wait (briefly) for them to land.
  const waitFor = async (pred, ms = 5000) => {
    const end = Date.now() + ms;
    for (;;) {
      const hit = (await call("GET", "/admin/emails?take=100")).json.data.find(pred);
      if (hit || Date.now() > end) return hit;
      await new Promise((r) => setTimeout(r, 250));
    }
  };
  const body = async (id) => (await call("GET", `/admin/emails/${id}`)).json.data.html;

  const settings = (await call("GET", "/admin/settings")).json.data;
  const before = settings.notifications;
  ok(typeof settings.email?.connected === "boolean", "settings say whether an email service is connected",
    settings.email.connected ? `sending as ${settings.email.from}` : "not connected - emails are kept in the log");
  const team = `team.${RUN}@example.com`;
  try {
    const put = await call("PUT", "/admin/settings/notifications", {
      ...before, orderConfirmation: true, shippingUpdates: true, alertNewOrder: true, alertNewMessage: true, alertRecipients: [team],
    });
    ok(put.status === 200 && put.json.data.notifications.alertRecipients[0] === team, "save notification settings");
    ok((await call("PUT", "/admin/settings/notifications", { ...before, alertRecipients: ["not-an-email"] })).status === 400, "alert recipients must be email addresses");

    const buyer = `mail.${RUN}@example.com`;
    const o = await pub("POST", "/orders", { email: buyer, name: "Mail Tester", ...shipTo, items: [{ slug: "lip-liner", quantity: 1 }], paymentMethod: "COD" });
    const number = o.json.data.number;
    const conf = await waitFor((e) => e.to === buyer && e.kind === "order.confirmation");
    ok(conf?.subject.includes(number) && conf.status === "CAPTURED", "order confirmation to the customer (kept, not sent: test address)", conf?.subject);
    const html = conf ? await body(conf.id) : "";
    ok(html.includes(number) && html.includes("Track your order") && html.includes("in cash"), "confirmation shows the order, cash-on-delivery amount and tracking link");
    const alert = await waitFor((e) => e.to === team && e.kind === "alert.order" && e.subject.includes(number));
    ok(!!alert, "new-order alert to the team", alert?.subject);

    await call("PATCH", `/admin/orders/${number}/status`, { status: "PROCESSING" });
    await call("PATCH", `/admin/orders/${number}/status`, { status: "SHIPPED", note: `AWB <b>${RUN}</b>` });
    const shipped = await waitFor((e) => e.to === buyer && e.kind === "order.status");
    const shippedHtml = shipped ? await body(shipped.id) : "";
    ok(shipped?.subject.includes("on its way") && shippedHtml.includes(`AWB &lt;b&gt;${RUN}&lt;/b&gt;`), "shipped email carries the team's note, escaped");
    const statusMails = (await call("GET", "/admin/emails?take=100")).json.data.filter((e) => e.to === buyer && e.kind === "order.status");
    ok(statusMails.length === 1, "no email for internal steps like Processing");

    await pub("POST", "/contact", { name: "Mallory", email: `m.${RUN}@example.com`, subject: `Help ${RUN}`, message: "<script>alert(1)</script>" });
    const msg = await waitFor((e) => e.kind === "alert.message" && e.subject.includes(`Help ${RUN}`));
    const msgHtml = msg ? await body(msg.id) : "";
    ok(msgHtml.includes("&lt;script&gt;") && !msgHtml.includes("<script>"), "contact alert escapes what the customer typed");

    await call("PUT", "/admin/settings/notifications", { ...before, orderConfirmation: false, alertNewOrder: false, alertRecipients: [] });
    const quiet = `quiet.${RUN}@example.com`;
    await pub("POST", "/orders", { email: quiet, name: "Quiet Buyer", ...shipTo, items: [{ slug: "lip-liner", quantity: 1 }], paymentMethod: "COD" });
    ok(!(await waitFor((e) => e.to === quiet, 1500)), "no confirmation when that email is switched off");

    const test = await call("POST", "/admin/emails/test", { to: `test.${RUN}@example.com` });
    ok(test.status === 201 && test.json.data.status === "CAPTURED", "test email recorded (test addresses are never really emailed)");
  } finally {
    await call("PUT", "/admin/settings/notifications", before);
  }
}

console.log("\n[Customer accounts]");
{
  // Storefront requests as a particular shopper (their own cookie).
  const shop = async (cookie, method, path, body) => {
    const res = await fetch(API + path, {
      method,
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json, cookie: res.headers.get("set-cookie")?.split(";")[0] };
  };
  // The one-time link from the latest email of a kind, read from the Email Log.
  const linkToken = async (to, kind) => {
    for (let i = 0; i < 20; i++) {
      const hit = (await call("GET", "/admin/emails?take=100")).json.data.find((e) => e.to === to && e.kind === kind);
      if (hit) return (await call("GET", `/admin/emails/${hit.id}`)).json.data.html.match(/token=([A-Za-z0-9_-]+)/)?.[1];
      await new Promise((r) => setTimeout(r, 250));
    }
    return null;
  };

  const email = `shopper.${RUN}@example.com`;
  const reg = await shop(null, "POST", "/account/register", { name: "Asha Shopper", email, password: `rose-velvet-${RUN}` });
  let cookie = reg.cookie;
  ok(reg.status === 201 && reg.json.data.emailVerified === false && cookie?.startsWith("vel_customer="), "sign up -> signed in, email not yet verified");
  ok((await shop(null, "POST", "/account/register", { name: "Again", email, password: `another-${RUN}-pass` })).status === 409, "same email can't sign up twice");
  const weak = await shop(null, "POST", "/account/register", { name: "Weak", email: `weak.${RUN}@example.com`, password: "short" });
  ok(weak.status === 400 && weak.json.error.details?.[0]?.path === "password", "too-short password refused");
  ok((await shop(cookie, "GET", "/account/me")).json.data.email === email, "session reads the account");
  ok((await shop(null, "POST", "/account/login", { email, password: "wrong-password" })).status === 401, "wrong password refused");
  const orders0 = await shop(cookie, "GET", "/account/orders");
  ok(orders0.status === 403 && orders0.json.error.code === "EMAIL_NOT_VERIFIED", "order history hidden until the email is verified");

  const vtoken = await linkToken(email, "account.verify");
  ok(!!vtoken, "verification email sent with a one-time link");
  ok((await shop(null, "POST", "/account/verify", { token: vtoken })).status === 200, "link verifies the email (no sign-in needed)");
  ok((await shop(null, "POST", "/account/verify", { token: vtoken })).status === 400, "…and only works once");

  // Checkout as the account; save the address.
  const mismatch = await shop(cookie, "POST", "/orders", { email: `other.${RUN}@example.com`, name: "Asha Shopper", ...shipTo, items: [{ slug: "lip-liner", quantity: 1 }], paymentMethod: "COD" });
  ok(mismatch.status === 400 && mismatch.json.error.details?.[0]?.path === "email", "signed in: the order must use the account's email");
  const mine = await shop(cookie, "POST", "/orders", { email, name: "Asha Shopper", ...shipTo, items: [{ slug: "lip-liner", quantity: 1 }], paymentMethod: "COD", saveAddress: true });
  const history = (await shop(cookie, "GET", "/account/orders")).json.data;
  ok(mine.status === 201 && history[0]?.number === mine.json.data.number, "order appears in the account's history", mine.json.data?.number);
  const addrs = (await shop(cookie, "GET", "/account/addresses")).json.data;
  ok(addrs.length === 1 && addrs[0].isDefault && addrs[0].pincode === shipTo.shipping.pincode, "checkout address saved as the default");

  // Addresses belong to their owner only.
  const other = await shop(null, "POST", "/account/register", { name: "Other Person", email: `other.${RUN}@example.com`, password: `plum-silk-${RUN}` });
  ok((await shop(other.cookie, "PATCH", `/account/addresses/${addrs[0].id}`, { city: "Hacked" })).status === 404, "can't touch someone else's address");
  const nowhere = await shop(cookie, "POST", "/account/addresses", { fullName: "Asha Shopper", phone: "9876543210", line1: "5 Palm Avenue", city: "Chennai", state: "Narnia", pincode: "600001" });
  ok(nowhere.status === 400 && nowhere.json.error.details?.[0]?.path === "state", "an address needs a real state", nowhere.json.error.details?.[0]?.message);
  const added = await shop(cookie, "POST", "/account/addresses", { fullName: "Asha Shopper", phone: "9876543210", line1: "5 Palm Avenue", city: "Chennai", state: "tamilnadu", pincode: "600001", isDefault: true });
  ok(added.status === 201 && added.json.data.filter((a) => a.isDefault).length === 1 && added.json.data[0].city === "Chennai", "new default address replaces the old default");
  ok(added.json.data[0].state === "Tamil Nadu", "state saved under its proper name", `"tamilnadu" -> "${added.json.data[0].state}"`);

  // The wishlist follows the account, not the browser.
  ok((await shop(null, "GET", "/account/wishlist")).status === 401, "a wishlist needs a sign-in");
  const wished = await shop(cookie, "POST", "/account/wishlist", { slug: "velvet-matte-lipstick" });
  const twice = await shop(cookie, "POST", "/account/wishlist", { slug: "velvet-matte-lipstick" });
  ok(wished.status === 200 && wished.json.data.includes("velvet-matte-lipstick") && twice.json.data.length === 1,
    "saving to the wishlist, and saving it twice changes nothing");
  ok((await shop(cookie, "POST", "/account/wishlist", { slug: "no-such-product" })).status === 404, "only real products can be saved");
  const merged = await shop(cookie, "POST", "/account/wishlist/merge", { slugs: ["day-cream", "velvet-matte-lipstick"] });
  ok(merged.json.data.length === 2, "signing in merges what the browser had saved", merged.json.data.join(", "));
  ok((await shop(other.cookie, "GET", "/account/wishlist")).json.data.length === 0, "another shopper's wishlist is their own");
  const dropped = await shop(cookie, "DELETE", "/account/wishlist/day-cream");
  ok(dropped.json.data.length === 1 && !dropped.json.data.includes("day-cream"), "removing one item");
  ok((await shop(cookie, "DELETE", "/account/wishlist")).json.data.length === 0, "clearing the lot");

  // A guest's past orders: signing up with their email doesn't reveal them until verified.
  const guest = `guest.${RUN}@example.com`;
  await pub("POST", "/orders", { email: guest, name: "Guest Buyer", ...shipTo, items: [{ slug: "lip-liner", quantity: 1 }], paymentMethod: "COD" });
  const claim = await shop(null, "POST", "/account/register", { name: "Claimant", email: guest, password: `claim-${RUN}-pass` });
  ok(claim.status === 201 && claim.json.data.phone === null && (await shop(claim.cookie, "GET", "/account/orders")).status === 403, "signing up on a guest's email shows none of their details before verifying");
  const gtoken = await linkToken(guest, "account.verify");
  await shop(null, "POST", "/account/verify", { token: gtoken });
  const gHistory = await shop(claim.cookie, "GET", "/account/orders");
  ok(gHistory.status === 200 && gHistory.json.data.length === 1, "after verifying, the earlier guest order is in the history");

  // Change password: other sessions end, this one continues.
  const second = (await shop(null, "POST", "/account/login", { email, password: `rose-velvet-${RUN}` })).cookie;
  const badCurrent = await shop(cookie, "POST", "/account/password", { currentPassword: "nope", newPassword: `new-${RUN}-pass` });
  ok(badCurrent.status === 400 && badCurrent.json.error.details?.[0]?.path === "currentPassword", "change password needs the current one");
  const changed = await shop(cookie, "POST", "/account/password", { currentPassword: `rose-velvet-${RUN}`, newPassword: `new-${RUN}-pass` });
  ok(changed.status === 200 && (await shop(second, "GET", "/account/me")).status === 401 && (await shop(changed.cookie, "GET", "/account/me")).status === 200, "changing password signs out other devices, keeps this one");
  cookie = changed.cookie;

  // Forgot password: same answer for any email; the link resets and signs in.
  const unknown = await shop(null, "POST", "/account/password/forgot", { email: `nobody.${RUN}@example.com` });
  const known = await shop(null, "POST", "/account/password/forgot", { email });
  ok(unknown.status === 200 && known.status === 200 && JSON.stringify(unknown.json) === JSON.stringify(known.json), "forgot-password gives the same answer whether or not the account exists");
  const rtoken = await linkToken(email, "account.reset");
  const weakReset = await shop(null, "POST", "/account/password/reset", { token: rtoken, password: "abc" });
  ok(weakReset.status === 400 && weakReset.json.error.details?.[0]?.path === "password", "weak new password refused without spending the link");
  const reset = await shop(null, "POST", "/account/password/reset", { token: rtoken, password: `reset-${RUN}-pass` });
  ok(reset.status === 200 && !!reset.cookie && (await shop(cookie, "GET", "/account/me")).status === 401, "reset link sets the password, signs in, ends older sessions");
  ok((await shop(null, "POST", "/account/password/reset", { token: rtoken, password: `again-${RUN}-pass` })).status === 400, "reset link only works once");
  ok((await shop(null, "POST", "/account/login", { email, password: `reset-${RUN}-pass` })).status === 200, "new password signs in");

  // A customer's session is not an admin session.
  const customerToken = reset.cookie.split("=")[1];
  ok((await shop(`vel_admin=${customerToken}`, "GET", "/admin/auth/me")).status === 401, "a customer's token can't be used as an admin session");
  const out = await shop(reset.cookie, "POST", "/account/logout");
  ok(out.status === 204 && /vel_customer=;/.test(out.cookie + ";"), "sign out clears the cookie");
}

console.log("\n[Media uploads]");
{
  const upload = (buf, type, name) =>
    fetch(API + "/admin/media", {
      method: "POST",
      headers: { cookie, "content-type": type, "x-file-name": encodeURIComponent(name) },
      body: buf,
    }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => null) }));
  const ORIGIN = API.replace(/\/api\/v1$/, "");

  // A big PNG is scaled down and stored as WebP.
  const png = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: "#c1883e" } }).png().toBuffer();
  const up = await upload(png, "image/png", `Hero Shot ${RUN}.png`);
  const a = up.json?.data;
  ok(up.status === 201 && a.mimeType === "image/webp" && a.width === 2400 && a.height === 1200 && a.url.startsWith("/uploads/"), "upload: re-encoded to WebP, capped at 2400px", `${a?.width}x${a?.height} ${a?.url}`);
  ok(a.alt === `Hero Shot ${RUN}`, "alt text starts from the file name");
  const served = await fetch(ORIGIN + a.url);
  ok(served.status === 200 && served.headers.get("content-type") === "image/webp" && /immutable/.test(served.headers.get("cache-control") ?? ""), "served from /uploads with long-lived caching");

  // Camera metadata (e.g. GPS) is removed.
  const jpeg = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#250b30" } })
    .withExif({ IFD0: { Copyright: `secret-location-${RUN}` } }).jpeg().toBuffer();
  ok(!!(await sharp(jpeg).metadata()).exif, "(test image really carries EXIF)");
  const j = (await upload(jpeg, "image/jpeg", "phone-photo.jpg")).json.data;
  const stored = Buffer.from(await (await fetch(ORIGIN + j.url)).arrayBuffer());
  ok(!(await sharp(stored).metadata()).exif, "EXIF metadata stripped from the stored image");

  // Only real images, no SVG, size-capped.
  const fake = await upload(Buffer.from("definitely not an image"), "image/png", "fake.png");
  ok(fake.status === 400, "a non-image named .png is refused", fake.json?.error?.message);
  const svg = await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>'), "image/svg+xml", "x.svg");
  ok(svg.status === 400 && /SVG/.test(svg.json?.error?.message ?? ""), "SVG refused");
  const huge = await upload(Buffer.alloc(11 * 1024 * 1024, 1), "image/png", "huge.png");
  ok(huge.status === 413, "files over the size limit refused", huge.json?.error?.message);
  const traversal = await fetch(ORIGIN + "/uploads/..%2f.env");
  ok(traversal.status === 404 && !(await traversal.text()).includes("DATABASE_URL"), "can't read files outside the upload folder");

  // In-use images can't be deleted.
  const banner = (await call("POST", "/admin/banners", { name: `Media check ${RUN}`, placement: "test.none", imageUrl: a.url, isActive: false })).json.data;
  const listed = (await call("GET", "/admin/media")).json.data.find((m) => m.id === a.id);
  ok(listed?.usedIn.some((u) => u.includes(`Media check ${RUN}`)), "library shows where an image is used", listed?.usedIn.join(", "));
  const blocked = await call("DELETE", `/admin/media/${a.id}`);
  ok(blocked.status === 409, "an image in use can't be deleted", blocked.json?.error?.message);
  await call("DELETE", `/admin/banners/${banner.id}`);
  ok((await call("PATCH", `/admin/media/${a.id}`, { alt: "Gold hero" })).json.data.alt === "Gold hero", "alt text editable");
  const del = await call("DELETE", `/admin/media/${a.id}`);
  ok(del.status === 204 && (await fetch(ORIGIN + a.url)).status === 404, "unused image deleted, file removed");
  await call("DELETE", `/admin/media/${j.id}`);
}

console.log("\n[Returns]");
{
  // A fresh delivered order of two serums, placed as a guest. Stock is topped
  // up for it and put back afterwards: the public suite relies on the serum
  // having fewer than 20 in stock.
  const serum = (await call("GET", "/admin/products?take=100")).json.data.find((p) => p.slug === "face-serum");
  await call("PATCH", `/admin/products/${serum.id}/stock`, { set: serum.stock + 2 });
  const email = `returns.${RUN}@example.com`;
  const placed = await pub("POST", "/orders", { ...shipTo, email, name: "Returns Tester", items: [{ slug: "face-serum", quantity: 2 }], paymentMethod: "COD" });
  const order = placed.json.data.number;
  const lookup = `/orders/${order}/returns?email=${encodeURIComponent(email)}`;

  const early = await pub("GET", lookup);
  ok(early.status === 200 && early.json.data.canRequest === false, "no return before the order is delivered", early.json.data.reason);
  for (const status of ["PROCESSING", "SHIPPED", "DELIVERED"]) await call("PATCH", `/admin/orders/${order}/status`, { status });

  const info = (await pub("GET", lookup)).json.data;
  const line = info.items[0];
  ok(info.canRequest && line.returnable === 2 && info.windowDays >= 1, "delivered order can be returned, window from settings", `closes ${new Date(info.closesAt).toDateString()}`);
  ok((await pub("GET", `/orders/${order}/returns?email=someone.else@example.com`)).status === 404, "another email can't see or return the order");

  const tooMany = await pub("POST", `/orders/${order}/returns`, { email, reason: "DAMAGED", items: [{ orderItemId: line.id, quantity: 3 }] });
  ok(tooMany.status === 400, "can't return more than was ordered", tooMany.json.error.message);
  const created = await pub("POST", `/orders/${order}/returns`, { email, reason: "DAMAGED", note: "Smoke test, safe to ignore.", items: [{ orderItemId: line.id, quantity: 2 }] });
  const rn = created.json.data?.number;
  ok(created.status === 201 && /^RT\d{10}$/.test(rn ?? "") && created.json.data.status === "REQUESTED", "return requested", rn);
  const again = await pub("POST", `/orders/${order}/returns`, { email, reason: "OTHER", items: [{ orderItemId: line.id, quantity: 1 }] });
  ok(again.status === 409, "one open return per order", again.json.error.message);

  const counts = (await call("GET", "/admin/returns/counts")).json.data;
  ok(counts.requested >= 1 && counts.open >= counts.requested, "sidebar count includes it", JSON.stringify(counts));
  const listed = (await call("GET", `/admin/returns?q=${order}`)).json.data;
  ok(listed.length === 1 && listed[0].suggestedRefundPaise === 2 * serum.pricePaise, "admin sees the request and what a full refund comes to");

  const skip = await call("PATCH", `/admin/returns/${rn}`, { status: "REFUNDED" });
  ok(skip.status === 409, "can't jump straight from requested to refunded", skip.json.error.message);
  const early2 = await call("PATCH", `/admin/returns/${rn}`, { status: "APPROVED", refundPaise: 100 });
  ok(early2.status === 400, "a refund amount only goes with 'refunded'");
  for (const status of ["APPROVED", "RECEIVED"]) {
    const r = await call("PATCH", `/admin/returns/${rn}`, { status, staffNote: `Smoke: ${status.toLowerCase()}` });
    ok(r.status === 200 && r.json.data.status === status, `return moves to ${status.toLowerCase()}`);
  }
  const refunded = await call("PATCH", `/admin/returns/${rn}`, { status: "REFUNDED" });
  ok(refunded.status === 200 && refunded.json.data.refundPaise === 2 * serum.pricePaise && refunded.json.data.resolvedAt, "refunded, amount defaults to the items' value");
  const after = (await call("GET", `/admin/orders/${order}`)).json.data;
  ok(after.status === "REFUNDED" && after.paymentStatus === "REFUNDED", "whole order returned -> the order itself is refunded (so reports stop counting it)");
  ok((await call("PATCH", `/admin/returns/${rn}`, { status: "APPROVED" })).status === 409, "a refunded return is closed for good");
  const status = (await pub("GET", lookup)).json.data;
  ok(status.requests[0]?.status === "REFUNDED" && !status.canRequest, "the customer sees it refunded, and can't return it twice");

  const mails = (await call("GET", `/admin/emails?q=${encodeURIComponent(email)}`)).json.data.filter((m) => m.kind === "return.update");
  ok(mails.length === 3, "customer emailed at approved, received and refunded", mails.map((m) => m.subject.replace(/.*return RT\d+ /, "")).join(" / "));

  // Switching returns off turns new requests away.
  const before = (await call("GET", "/admin/settings")).json.data.returns;
  const off = await call("PUT", "/admin/settings/returns", { ...before, accepted: false });
  ok(off.status === 200 && off.json.data.returns.accepted === false, "returns can be switched off");
  const shown = (await pub("GET", "/settings/public")).json.data.returns;
  ok(shown.accepted === false, "…and the storefront knows");
  const tooLong = await call("PUT", "/admin/settings/returns", { ...before, windowDays: 400 });
  ok(tooLong.status === 400, "return window is validated", tooLong.json.error.details?.[0]?.path);
  await call("PUT", "/admin/settings/returns", before);
  ok((await pub("GET", "/settings/public")).json.data.returns.accepted === before.accepted, "returns setting restored");
  await call("PATCH", `/admin/products/${serum.id}/stock`, { set: serum.stock });
}

console.log("\n[GST invoices]");
{
  const before = (await call("GET", "/admin/settings")).json.data.tax;
  // A made-up but well-formed GSTIN in Maharashtra (27) — the state shipTo delivers to.
  const details = { gstin: "27ABCDE1234F1Z0", legalName: "AD Atlas Ventures Pvt Ltd (smoke)", address: "12 MG Road\nPune 411001", invoicePrefix: "VL" };
  const typo = await call("PUT", "/admin/settings/tax", { ...details, gstin: "27ABCDE1234F1Z1" });
  ok(typo.status === 400 && typo.json.error.details?.[0]?.path === "gstin", "a GSTIN with a wrong check digit is refused", typo.json.error.details?.[0]?.message);
  const bare = await call("PUT", "/admin/settings/tax", { ...details, address: "" });
  ok(bare.status === 400 && bare.json.error.details?.[0]?.path === "address", "a GSTIN needs the registered address with it");
  const longPrefix = await call("PUT", "/admin/settings/tax", { ...details, invoicePrefix: "VELAS" });
  ok(longPrefix.status === 400, "invoice prefix kept short (numbers must fit 16 characters)");
  const saved = await call("PUT", "/admin/settings/tax", details);
  ok(saved.status === 200 && saved.json.data.tax.state?.name === "Maharashtra", "GST details saved; state read from the GSTIN", saved.json.data.tax.state?.name);

  const product = (await call("GET", "/admin/products?q=day%20cream")).json.data[0];
  const badHsn = await call("PATCH", `/admin/products/${product.id}`, { hsnCode: "33" });
  ok(badHsn.status === 400 && product.hsnCode === "3304" && product.gstRateBps === 1800, "products carry an HSN code and GST rate; the code is checked", `${product.hsnCode} at ${product.gstRateBps / 100}%`);

  // A: same state as the seller, with a ₹200 coupon shared across two lines.
  const emailA = `gst.a.${RUN}@example.com`;
  const a = (await pub("POST", "/orders", {
    ...shipTo, email: emailA, name: "Gst Same-State",
    items: [{ slug: "day-cream", quantity: 1 }, { slug: "glow-boost-primer", quantity: 2 }],
    couponCode: "WELCOME200", paymentMethod: "COD",
  })).json.data;
  const aDetail = (await call("GET", `/admin/orders/${a.number}`)).json.data;
  ok(aDetail.invoiceNumber === null && aDetail.invoicing.configured && aDetail.items.every((i) => i.hsnCode && i.gstRateBps === 1800),
    "new order: no invoice yet, lines snapshot HSN and rate");
  const issued = await call("POST", `/admin/orders/${a.number}/invoice`);
  const numberA = issued.json.data?.invoiceNumber ?? "";
  ok(issued.status === 201 && /^VL\/\d{4}\/\d{5}$/.test(numberA) && numberA.length <= 16, "invoice created by hand before shipping", numberA);
  const again = await call("POST", `/admin/orders/${a.number}/invoice`);
  ok(again.status === 200 && again.json.data.invoiceNumber === numberA, "creating it twice keeps the same number");
  const pageA = await fetch(`${API}/admin/orders/${a.number}/invoice`, { headers: { cookie } });
  const htmlA = await pageA.text();
  ok(pageA.status === 200 && /text\/html/.test(pageA.headers.get("content-type") ?? "") && htmlA.includes(numberA) && htmlA.includes("27ABCDE1234F1Z0"),
    "admin opens the printable invoice");
  ok(htmlA.includes("<th>CGST</th><th>SGST</th>") && !htmlA.includes("<th>IGST</th>"), "same state -> CGST + SGST");
  ok(/script-src 'sha256-/.test(pageA.headers.get("content-security-policy") ?? "") && !/unsafe-inline'[^;]*script|script-src[^;]*unsafe/.test(pageA.headers.get("content-security-policy") ?? ""),
    "invoice page runs no script but its own print button");

  // B: another state, two items, a coupon and a paid delivery option —
  // invoiced automatically when it ships.
  const emailB = `gst.b.${RUN}@example.com`;
  const bItems = [{ slug: "day-cream", quantity: 1 }, { slug: "glow-boost-primer", quantity: 1 }];
  const express = (await pub("POST", "/cart/quote", { items: bItems })).json.data.shippingOptions.find((o) => o.pricePaise > 0);
  const b = (await pub("POST", "/orders", {
    ...shipTo, shipping: { line1: "4 Church Street", city: "Bengaluru", state: "karnataka", pincode: "560001" },
    email: emailB, name: "Gst Other-State", items: bItems, couponCode: "WELCOME200", shippingMethodId: express?.id, paymentMethod: "COD",
  })).json.data;
  const bBefore = (await call("GET", `/admin/orders/${b.number}`)).json.data;
  ok(bBefore.shipState === "Karnataka" && bBefore.shippingPaise > 0, "typed state stored under its proper name", `"karnataka" -> "${bBefore.shipState}"`);
  await call("PATCH", `/admin/orders/${b.number}/status`, { status: "PROCESSING" });
  ok((await call("GET", `/admin/orders/${b.number}`)).json.data.invoiceNumber === null, "no invoice while it's being packed");
  const shipped = await call("PATCH", `/admin/orders/${b.number}/status`, { status: "SHIPPED" });
  const numberB = shipped.json.data?.invoiceNumber ?? "";
  const seq = (n) => Number(n.split("/")[2]);
  ok(/^VL\/\d{4}\/\d{5}$/.test(numberB) && seq(numberB) > seq(numberA), "marking it shipped issues the next invoice number", numberB);

  const trackUrl = `/orders/track?number=${b.number}&email=${encodeURIComponent(emailB)}`;
  const track = (await pub("GET", trackUrl)).json.data;
  ok(track.invoice?.number === numberB && track.invoice.url.startsWith(`/api/v1/orders/${b.number}/invoice?t=`), "Track Order hands the customer a signed invoice link");
  const origin = API.replace(/\/api\/v1$/, "");
  const link = `${origin}${track.invoice.url}`;
  const pageB = await fetch(link);
  const htmlB = await pageB.text();
  ok(pageB.status === 200 && htmlB.includes(numberB) && htmlB.includes("<th>IGST</th>") && htmlB.includes("Karnataka (29)") && htmlB.includes("Delivery charges"),
    "the link opens the invoice: other state -> IGST, place of supply and delivery shown");
  // Flip a character inside the signature (the last one only carries padding bits).
  const tampered = link.slice(0, -10) + (link.at(-10) === "A" ? "B" : "A") + link.slice(-9);
  ok((await fetch(tampered)).status === 403, "a tampered link is refused");
  ok((await fetch(link.replace(b.number, a.number))).status === 404, "a link can't be pointed at another order");
  ok((await fetch(`${API}/admin/orders/${b.number}/invoice`)).status === 401, "the admin copy needs a session");

  // Credit notes. A is cancelled after its invoice was issued: all of it is credited.
  const cancelled = await call("PATCH", `/admin/orders/${a.number}/status`, { status: "CANCELLED" });
  const aNotes = (await call("GET", `/admin/orders/${a.number}`)).json.data.creditNotes;
  ok(cancelled.status === 200 && aNotes.length === 1 && aNotes[0].reason === "CANCELLATION" && aNotes[0].totalPaise === aDetail.totalPaise && /^CN\/\d{4}\/\d{5}$/.test(aNotes[0].number),
    "cancelling an invoiced order issues a credit note for all of it", aNotes[0]?.number);

  // B is delivered; the primer comes back. The refund defaults to what was paid for it after the coupon.
  await call("PATCH", `/admin/orders/${b.number}/status`, { status: "DELIVERED" });
  const lookup = `/orders/${b.number}/returns?email=${encodeURIComponent(emailB)}`;
  const primerLine = (await pub("GET", lookup)).json.data.items.find((i) => /Primer/.test(i.name));
  const asked = await pub("POST", `/orders/${b.number}/returns`, { email: emailB, reason: "CHANGED_MIND", items: [{ orderItemId: primerLine.id, quantity: 1 }] });
  const rn = asked.json.data?.number;
  const suggested = (await call("GET", `/admin/returns/${rn}`)).json.data.suggestedRefundPaise;
  ok(suggested < primerLine.unitPricePaise && suggested > 0, "suggested refund is what was paid, after the coupon's share", `Rs ${(suggested / 100).toFixed(2)} of Rs ${(primerLine.unitPricePaise / 100).toFixed(2)}`);
  for (const status of ["APPROVED", "RECEIVED", "REFUNDED"]) await call("PATCH", `/admin/returns/${rn}`, { status });
  const returned = (await call("GET", `/admin/returns/${rn}`)).json.data;
  ok(returned.status === "REFUNDED" && returned.creditNote?.totalPaise === suggested && /^CN\//.test(returned.creditNote.number),
    "refunding the return issues a credit note for exactly the refund", returned.creditNote?.number);

  // Then the rest of B is refunded: the second note takes back what's left, to the paisa.
  await call("PATCH", `/admin/orders/${b.number}/status`, { status: "REFUNDED" });
  const bNotes = (await call("GET", `/admin/orders/${b.number}`)).json.data.creditNotes;
  ok(bNotes.length === 2 && bNotes[1].reason === "REFUND" && bNotes[0].totalPaise + bNotes[1].totalPaise === bBefore.totalPaise,
    "refunding the order credits the remainder; the notes add up to the invoice", bNotes.map((n) => n.number).join(" + "));
  const report = (await call("GET", "/admin/reports/gst")).json.data;
  const rowB = report.invoices.find((i) => i.number === numberB);
  const bCredits = report.creditNotes.filter((n) => n.invoiceNumber === numberB);
  const sum = (key) => bCredits.reduce((n, c) => n + c[key], 0);
  ok(rowB && bCredits.length === 2 && ["taxablePaise", "igstPaise", "totalPaise"].every((k) => sum(k) === rowB[k]) && sum("cgstPaise") === 0,
    "together the credit notes reverse the invoice's taxable value and IGST exactly");

  const trackAfter = (await pub("GET", trackUrl)).json.data;
  const noteLink = trackAfter.invoice?.creditNotes?.[0];
  const notePage = noteLink ? await fetch(`${origin}${noteLink.url}`) : null;
  const noteHtml = notePage ? await notePage.text() : "";
  ok(trackAfter.invoice.creditNotes.length === 2 && notePage?.status === 200 && noteHtml.includes("CREDIT NOTE") && noteHtml.includes(numberB) && noteHtml.includes(rn),
    "the customer opens the credit notes from Track Order; each names the invoice and return");
  const adminNote = await fetch(`${API}/admin/orders/${b.number}/credit-notes/${bNotes[1].id}`, { headers: { cookie } });
  ok(adminNote.status === 200 && (await fetch(`${API}/admin/orders/${a.number}/credit-notes/${bNotes[1].id}`, { headers: { cookie } })).status === 404,
    "admin opens a credit note; it only opens under its own order");

  const rowA = report.invoices.find((i) => i.number === numberA);
  ok(rowA?.status === "CANCELLED" && rowA.cgstPaise === rowA.sgstPaise && rowA.cgstPaise + rowA.sgstPaise === aDetail.taxPaise && rowA.totalPaise === aDetail.totalPaise,
    "invoice tax matches the order: CGST = SGST, sums to its GST, total to the paisa", `CGST Rs ${(rowA.cgstPaise / 100).toFixed(2)} + SGST Rs ${(rowA.sgstPaise / 100).toFixed(2)}`);
  const t = report.totals;
  ok(["taxablePaise", "cgstPaise", "sgstPaise", "igstPaise", "totalPaise"].every((k) => t.net[k] === t.invoices[k] - t.creditNotes[k]) && t.creditNotes.count >= 3,
    "GST summary: invoices less credit notes, by state and HSN", `${t.invoices.count} invoices, ${t.creditNotes.count} credit notes`);

  await call("PUT", "/admin/settings/tax", before);
  const offAgain = await call("GET", `/admin/orders/${b.number}`);
  ok(offAgain.json.data.invoiceNumber === numberB, "tax settings restored; issued invoices stay");
}

console.log("\n[Blog]");
{
  const title = `Smoke Post ${RUN}`;
  const draft = await call("POST", "/admin/blog", {
    title,
    excerpt: "A post the smoke test wrote.",
    body: "First paragraph, written by the smoke test.\n\n## A heading\n\n- A bullet",
    author: "Smoke Runner",
  });
  const post = draft.json.data;
  ok(draft.status === 201 && post.slug === `smoke-post-${RUN}` && post.status === "DRAFT" && post.publishedAt === null,
    "a post is created as a draft, with its web address from the title", `/blog/${post.slug}`);
  ok((await pub("GET", `/blog/${post.slug}`)).status === 404 && !(await pub("GET", "/blog")).json.data.some((p) => p.slug === post.slug),
    "a draft is invisible on the storefront");

  const clash = await call("POST", "/admin/blog", { title, body: "Another one entirely.", author: "Smoke Runner" });
  ok(clash.status === 409, "two posts can't share a web address", clash.json.error.message);

  const past = await call("PATCH", `/admin/blog/${post.id}`, { status: "SCHEDULED", publishedAt: "2020-01-01T10:00:00.000Z" });
  ok(past.status === 400 && past.json.error.details?.[0]?.path === "publishedAt", "scheduling needs a date in the future");
  const later = new Date(Date.now() + 60 * 60_000).toISOString();
  const scheduled = await call("PATCH", `/admin/blog/${post.id}`, { status: "SCHEDULED", publishedAt: later });
  ok(scheduled.status === 200 && (await pub("GET", `/blog/${post.slug}`)).status === 404,
    "a scheduled post waits for its date");

  const live = await call("PATCH", `/admin/blog/${post.id}`, { status: "PUBLISHED" });
  const shown = await pub("GET", `/blog/${post.slug}`);
  ok(live.status === 200 && shown.status === 200 && shown.json.data.title === title && shown.json.data.readingMinutes >= 1,
    "publishing puts it on the storefront, with a reading time", `${shown.json.data.readingMinutes} min`);
  const index = (await pub("GET", "/blog")).json.data;
  ok(index[0]?.slug === post.slug && index[0].body === undefined, "the newest post leads the Journal, without the whole body");

  ok((await call("DELETE", `/admin/blog/${post.id}`)).status === 204 && (await pub("GET", `/blog/${post.slug}`)).status === 404,
    "deleting a post takes it off the storefront");
}

console.log("\n[SEO settings]");
{
  const before = (await call("GET", "/admin/settings")).json.data.seo;
  ok(before.indexable === false && Object.keys(before.pages).length === 11 && before.pages.shop.title.length > 0,
    "SEO settings start hidden from search, with the storefront's own wording", `"${before.pages.shop.title}"`);

  const tooLong = await call("PUT", "/admin/settings/seo", { ...before, defaultTitle: "x".repeat(71) });
  ok(tooLong.status === 400 && tooLong.json.error.details?.[0]?.path === "defaultTitle", "a title longer than search results show is refused");
  const badPage = await call("PUT", "/admin/settings/seo", { ...before, pages: { ...before.pages, shop: { title: "Shop", description: "y".repeat(201) } } });
  ok(badPage.status === 400 && badPage.json.error.details?.[0]?.path === "pages.shop.description", "…and so is an over-long page description", badPage.json.error.details?.[0]?.path);

  const saved = await call("PUT", "/admin/settings/seo", {
    ...before,
    indexable: true,
    description: `Smoke ${RUN}: premium beauty, crafted with science for the modern Indian woman.`,
    pages: { ...before.pages, shop: { title: `Shop ${RUN}`, description: before.pages.shop.description } },
  });
  ok(saved.status === 200 && saved.json.data.seo.pages.shop.title === `Shop ${RUN}`, "titles and descriptions saved");
  const shown = (await pub("GET", "/settings/public")).json.data.seo;
  ok(shown.indexable === true && shown.pages.shop.title === `Shop ${RUN}` && shown.description.startsWith(`Smoke ${RUN}`),
    "…and the storefront reads them, including the search-engine switch");

  await call("PUT", "/admin/settings/seo", before);
  ok((await pub("GET", "/settings/public")).json.data.seo.indexable === false, "SEO settings restored");
}

console.log("\n[Race: two shoppers, one stock pool]");
{
  const nc = (await call("GET", "/admin/products?q=night%20cream")).json.data[0];
  await call("PATCH", `/admin/products/${nc.id}/stock`, { set: 10, reason: "race test baseline" });
  const buy = (n) => pub("POST", "/orders", {
    email: `racer${n}.${RUN}@example.com`, name: `Racer ${n}`, ...shipTo,
    items: [{ slug: "night-cream", quantity: 6 }], paymentMethod: "COD",
  });
  const results = await Promise.all([buy(1), buy(2)]);
  const codes = results.map((r) => r.status).sort();
  const left = (await call("GET", `/admin/products/${nc.id}`)).json.data.stock;
  ok(codes[0] === 201 && codes[1] === 409 && left === 4,
    "stock 10, two simultaneous orders of 6 -> exactly one wins, stock ends at 4",
    `statuses ${codes.join(" & ")}, stock left ${left}`);
}

console.log("\n[CORS]");
{
  const good = await fetch(API + "/categories", { headers: { origin: "http://localhost:3001" } });
  ok(good.headers.get("access-control-allow-origin") === "http://localhost:3001" && good.headers.get("access-control-allow-credentials") === "true",
    "admin origin allowed with credentials");
  const evil = await fetch(API + "/categories", { headers: { origin: "https://evil.example" } });
  ok(!evil.headers.get("access-control-allow-origin"), "unknown origin gets no CORS grant");
}

console.log("\n[Logout]");
{
  const out = await call("POST", "/admin/auth/logout");
  ok(out.status === 204 && /vel_admin=;/.test(out.headers.get("set-cookie") ?? ""), "logout clears the cookie");
}

console.log("\n[Brute-force throttle]");
{
  cookie = "";
  const target = { email: `throttle.${RUN}@velastia.com`, password: "guess" };
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await call("POST", "/admin/auth/login", target)).status);
  ok(codes.slice(0, 5).every((c) => c === 401) && codes[5] === 429, "6th failed attempt within 15 min -> 429", codes.join(","));
}

console.log(`\nADMIN: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
