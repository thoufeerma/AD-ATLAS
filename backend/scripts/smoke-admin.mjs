// Admin (CMS) API smoke test. Rerunnable: every fixture it creates carries a
// per-run suffix, and state-dependent checks set up their own baseline.
//
// DEVELOPMENT ONLY — creates products, coupons and orders. Signs in with the
// SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.
import "dotenv/config";

const API = `${process.env.SMOKE_API_URL ?? "http://localhost:4000"}/api/v1`;
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(API)) {
  console.error(`Refusing to run smoke tests against ${API} — they create data. Localhost only.`);
  process.exit(2);
}
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to run the admin suite.");
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
