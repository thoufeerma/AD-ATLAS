// Public (storefront) API smoke test. Rerunnable: creates only its own orders,
// never assumes exact stock levels.
//
// DEVELOPMENT ONLY. It places real orders and moves stock, so it refuses to
// point at anything other than localhost.
//
//   npm run smoke          (runs this, then the admin suite)
import "dotenv/config";

const API = `${process.env.SMOKE_API_URL ?? "http://localhost:4000"}/api/v1`;
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(API)) {
  console.error(`Refusing to run smoke tests against ${API} — they create orders. Localhost only.`);
  process.exit(2);
}
let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}${extra ? "  - " + extra : ""}`); }
  else { fail++; console.log(`  FAIL  ${label}${extra ? "  - " + extra : ""}`); }
};
async function call(method, path, body, headers = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json, headers: res.headers };
}
// Paise always print as two digits, matching the storefront (never "Rs 79.9").
const rs = (p) => `Rs ${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

console.log("\n[Catalog]");
{
  const c = await call("GET", "/categories");
  ok(c.status === 200 && c.json.data.length >= 6, "visible categories", c.json.data.map((x) => `${x.slug}(${x.productCount})`).join(" "));

  const p = await call("GET", "/products");
  const list = p.json.data;
  ok(p.status === 200 && list.length >= 23, "storefront products", `${list.length}`);
  ok(list.every((x) => !("stock" in x)), "exact stock is never exposed publicly");
  ok(list.every((x) => x.status === "ACTIVE" || x.status === "COMING_SOON"), "no drafts or archived products leak to the storefront");
  ok(list[0].status === "ACTIVE", "featured sort puts purchasable products first", list[0].name);

  const d = await call("GET", "/products/velvet-matte-lipstick");
  ok(d.status === 200 && d.json.data.shades.length === 6, "lipstick detail with 6 shades", `price ${rs(d.json.data.pricePaise)}, rating ${d.json.data.rating.average} (${d.json.data.rating.count})`);

  const nf = await call("GET", "/products/does-not-exist");
  ok(nf.status === 404 && nf.json.error.code === "NOT_FOUND", "unknown product -> 404 with error envelope");
}

console.log("\n[Content]");
{
  const h = await call("GET", "/content/home");
  ok(h.status === 200 && h.json.data.testimonials.length >= 1 && h.json.data.collaborators.length === 5, "homepage content", `${h.json.data.testimonials.length} testimonials, ${h.json.data.collaborators.length} collaborators, ${h.json.data.banners.length} banners`);
  const f = await call("GET", "/faqs");
  ok(f.status === 200 && f.json.data.length >= 6, "published FAQs", `${f.json.data.length}`);
  const s = await call("GET", "/settings/public");
  ok(s.json.data.store?.name === "Velastia" && s.json.data.shipping.freeAbovePaise === 99900, "public settings", `free shipping above ${rs(s.json.data.shipping.freeAbovePaise)}`);
  ok(s.json.data.welcomeOffer?.code === "VEL10" && s.json.data.welcomeOffer.percent === 10, "welcome offer read from the live VEL10 coupon");
  const b = await call("GET", "/banners");
  ok(b.status === 200 && b.json.data.some((x) => x.placement === "global.topbar"), "active banners by placement", `${b.json.data.length} banners`);
  const rsum = await call("GET", "/reviews/summary");
  ok(rsum.status === 200 && rsum.json.data.breakdown.length === 5, "store-wide review summary", `${rsum.json.data.average} from ${rsum.json.data.total}`);
}

console.log("\n[Cart pricing - server-authoritative]");
const lip = (qty = 1, shade = "Rose Desire") => ({ slug: "velvet-matte-lipstick", quantity: qty, shade });
{
  const q = (await call("POST", "/cart/quote", { items: [lip()] })).json.data;
  ok(q.subtotalPaise === 79900 && q.shippingPaise === 9900 && q.totalPaise === 89800, "Rs 799 lipstick under Rs 999 -> Rs 99 shipping -> Rs 898", `${rs(q.subtotalPaise)} + ${rs(q.shippingPaise)} = ${rs(q.totalPaise)}`);

  const qb = (await call("POST", "/cart/quote", { items: [lip()], couponCode: "vel10" })).json.data;
  ok(qb.coupon?.code === "VEL10" && qb.discountPaise === 7990, "VEL10 (lowercase input) applies 10%", `discount ${rs(qb.discountPaise)}, total ${rs(qb.totalPaise)}`);

  const tamper = await call("POST", "/cart/quote", { items: [{ ...lip(), pricePaise: 1, unitPricePaise: 1 }], totalPaise: 1 });
  ok(tamper.json.data.totalPaise === 89800, "client-sent prices are ignored", `total still ${rs(tamper.json.data.totalPaise)}`);

  const free = (await call("POST", "/cart/quote", { items: [{ slug: "day-cream", quantity: 1 }] })).json.data;
  ok(free.shippingPaise === 0, "Rs 1,987 order ships free", `total ${rs(free.totalPaise)}, GST inside ${rs(free.taxPaise)}`);

  const bad = await call("POST", "/cart/quote", { items: [lip()], couponCode: "NOPE" });
  ok(bad.status === 200 && bad.json.data.couponError && !bad.json.data.coupon, "bad coupon still prices the cart", bad.json.data.couponError);

  const noShade = await call("POST", "/cart/quote", { items: [{ slug: "velvet-matte-lipstick", quantity: 1 }] });
  ok(noShade.status === 400, "shaded product without a shade -> 400", noShade.json.error.message);

  const soon = await call("POST", "/cart/quote", { items: [{ slug: "perfume", quantity: 1 }] });
  ok(soon.status === 409, "coming-soon product can't be bought -> 409", soon.json.error.message);

  const over = await call("POST", "/cart/quote", { items: [{ slug: "face-serum", quantity: 20 }] });
  ok(over.status === 409, "more than stock -> 409", over.json.error.message);

  const neg = await call("POST", "/cart/quote", { items: [{ slug: "face-serum", quantity: -3 }] });
  ok(neg.status === 400 && Array.isArray(neg.json.error.details), "negative quantity -> 400 with field details", JSON.stringify(neg.json.error.details[0]));
}

console.log("\n[Orders]");
const shopper = {
  email: "Smoke.Tester@Example.com",
  name: "Smoke Tester",
  phone: "+91 98765 43210",
  shipping: { line1: "123, Lotus Residency", city: "Mumbai", state: "Maharashtra", pincode: "400053" },
};
let placed;
{
  const o = await call("POST", "/orders", {
    ...shopper,
    items: [{ slug: "face-serum", quantity: 2 }, lip(1, "Royal Plum")],
    paymentMethod: "COD",
  });
  placed = o.json.data;
  ok(o.status === 201 && /^VL\d{10}$/.test(placed?.number ?? ""), "COD order created", `${placed?.number}, ${placed?.status}, total ${rs(placed?.totalPaise ?? 0)}`);
  ok(placed?.status === "CONFIRMED", "COD confirmed immediately");
  ok(placed?.subtotalPaise === 2 * 124500 + 79900, "order totals recomputed from DB prices");

  const t = await call("GET", `/orders/track?number=${placed.number.toLowerCase()}&email=smoke.tester@example.com`);
  ok(t.status === 200 && t.json.data.events.length === 1, "track with number + email (case-insensitive)", `${t.json.data.events[0].status}: ${t.json.data.events[0].note}`);

  const wrong = await call("GET", `/orders/track?number=${placed.number}&email=someone.else@example.com`);
  ok(wrong.status === 404, "wrong email can't read the order -> 404");

  const badPin = await call("POST", "/orders", { ...shopper, shipping: { ...shopper.shipping, pincode: "12345" }, items: [lip()], paymentMethod: "UPI" });
  ok(badPin.status === 400, "invalid pincode rejected", badPin.json.error.details?.[0]?.message);

  const inactive = await call("POST", "/orders", { ...shopper, items: [lip()], couponCode: "DIWALI25", paymentMethod: "UPI" });
  ok(inactive.status === 409, "order with an inactive coupon is refused, not silently undiscounted", inactive.json.error.message);
}

console.log("\n[First-order codes]");
{
  // COD orders stay unpaid until delivery, so "first order" must count them.
  const first = { ...shopper, email: `first.order.${Date.now().toString(36)}@example.com` };
  const o1 = await call("POST", "/orders", { ...first, items: [lip()], couponCode: "VEL10", paymentMethod: "COD" });
  ok(o1.status === 201 && o1.json.data.discountPaise === 7990, "VEL10 on a first COD order", o1.json.data?.number);
  const o2 = await call("POST", "/orders", { ...first, items: [lip()], couponCode: "VEL10", paymentMethod: "COD" });
  ok(o2.status === 409, "VEL10 refused on the same email's second order", o2.json.error?.message);
}

console.log("\n[Reviews]");
{
  const author = `Smoke Reviewer ${Date.now().toString(36)}`;
  const r = await call("POST", "/reviews", { productSlug: "velvet-matte-lipstick", name: author, email: "smoke.tester@example.com", rating: 4, body: "Smoke test review, safe to delete." });
  ok(r.status === 201, "review submitted");
  const pub = await call("GET", "/reviews?limit=60");
  ok(!pub.json.data.some((x) => x.authorName === author), "held for moderation - not public until an admin publishes it");
  const bad = await call("POST", "/reviews", { productSlug: "velvet-matte-lipstick", name: "A", email: "nope", rating: 9, body: "short" });
  ok(bad.status === 400, "review validation", `${bad.json.error.details?.length} field errors`);
  const soon = await call("POST", "/reviews", { productSlug: "perfume", name: "Smoke", email: "smoke.tester@example.com", rating: 5, body: "Not on sale, can't be reviewed." });
  ok(soon.status === 404, "can't review a product that isn't on sale");
  const detail = await call("GET", "/products/velvet-matte-lipstick");
  ok(detail.json.data.reviewSummary?.breakdown?.length === 5, "product detail carries its own rating breakdown");
}

console.log("\n[Forms]");
{
  const n1 = await call("POST", "/newsletter", { email: "Fan@Example.com" });
  const n2 = await call("POST", "/newsletter", { email: "fan@example.com" });
  ok(n1.status === 201 && n2.status === 201, "newsletter is idempotent and case-insensitive");
  const bad = await call("POST", "/contact", { name: "A", email: "not-an-email", subject: "x", message: "hi" });
  ok(bad.status === 400 && bad.json.error.details.length >= 3, "contact form validation", `${bad.json.error.details.length} field errors`);
  const junk = await fetch(API + "/contact", { method: "POST", headers: { "content-type": "application/json" }, body: "{not json" });
  ok(junk.status === 400, "malformed JSON -> 400, not a crash");
}

console.log("\n[Unknown route]");
{
  const r = await call("GET", "/nope");
  ok(r.status === 404 && r.json.error.code === "NOT_FOUND", "unmatched route -> JSON 404");
}

console.log(`\nPUBLIC: ${pass} passed, ${fail} failed`);
console.log(`PLACED_ORDER=${placed?.number}`);
process.exit(fail ? 1 : 0);
