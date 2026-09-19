/**
 * Mock data for the admin panel.
 *
 * DELIBERATELY SELF-CONTAINED. This app imports nothing from the storefront —
 * no shared `lib/`, no relative `../../` reach-across. The two apps are only
 * ever meant to meet at an API boundary, which lands in the backend phase.
 * Until then the admin keeps its own copy of the catalog on purpose.
 *
 * Figures match the dashboard drawn in M-Admin-Panel-1.0v.png.
 */

/* ── KPIs ─────────────────────────────────────────────────────────────── */

export type Kpi = {
  label: string;
  value: string;
  delta: number;
  series: number[];
  slot: 1 | 2 | 3;
};

export const KPIS: Kpi[] = [
  {
    label: "Total Sales",
    value: "₹12,45,678",
    delta: 18.6,
    slot: 1,
    series: [42, 48, 44, 58, 52, 66, 61, 74, 68, 82, 76, 94],
  },
  {
    label: "Orders",
    value: "1,248",
    delta: 12.4,
    slot: 2,
    series: [30, 38, 35, 46, 42, 55, 49, 58, 54, 66, 62, 71],
  },
  {
    label: "Customers",
    value: "8,965",
    delta: 15.7,
    slot: 3,
    series: [25, 31, 29, 40, 37, 48, 45, 56, 51, 63, 60, 72],
  },
  {
    label: "Revenue",
    value: "₹9,87,654",
    delta: 20.3,
    slot: 1,
    series: [35, 41, 39, 50, 47, 58, 55, 67, 63, 76, 72, 88],
  },
];

/* ── Sales overview ───────────────────────────────────────────────────── */

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Monthly sales in ₹ and order counts. Two different units — see the note in
 *  SalesOverview about why these are drawn as small multiples, not one plot. */
export const SALES_BY_MONTH = [
  62_000, 78_000, 71_000, 96_000, 88_000, 132_000,
  118_000, 145_000, 131_000, 168_000, 152_000, 196_000,
];

export const ORDERS_BY_MONTH = [
  62, 79, 71, 94, 86, 128, 114, 141, 126, 161, 147, 189,
];

/* ── Top selling ──────────────────────────────────────────────────────── */

export type TopProduct = {
  rank: number;
  name: string;
  revenue: number;
  sold: number;
  trend: "up" | "down";
};

export const TOP_PRODUCTS: TopProduct[] = [
  { rank: 1, name: "Velastia Face Serum", revenue: 245_678, sold: 2_345, trend: "up" },
  { rank: 2, name: "Velastia Day Cream", revenue: 198_765, sold: 1_987, trend: "up" },
  { rank: 3, name: "Velastia Night Cream", revenue: 165_432, sold: 1_654, trend: "up" },
  { rank: 4, name: "Velastia Sunscreen", revenue: 125_321, sold: 1_253, trend: "down" },
  { rank: 5, name: "Velastia Lip Balm", revenue: 98_765, sold: 987, trend: "up" },
];

/* ── Orders ───────────────────────────────────────────────────────────── */

export type OrderStatus = "Delivered" | "Processing" | "Shipped" | "Pending" | "Cancelled" | "Refunded";

export type Order = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  items: number;
  payment: "Razorpay (UPI)" | "Razorpay (Card)" | "Razorpay (Netbanking)" | "COD";
  placed: string;
  city: string;
};

export const ORDERS: Order[] = [
  { id: "ORD-1256", customer: "Riya Sharma", email: "riya.sharma@example.com", total: 2_549, status: "Delivered", items: 3, payment: "Razorpay (UPI)", placed: "2025-05-29", city: "Mumbai" },
  { id: "ORD-1255", customer: "Ananya Verma", email: "ananya.v@example.com", total: 1_299, status: "Delivered", items: 1, payment: "Razorpay (Card)", placed: "2025-05-29", city: "Pune" },
  { id: "ORD-1254", customer: "Neha Kapoor", email: "neha.kapoor@example.com", total: 3_499, status: "Processing", items: 4, payment: "Razorpay (UPI)", placed: "2025-05-28", city: "Delhi" },
  { id: "ORD-1253", customer: "Pooja Nair", email: "pooja.nair@example.com", total: 2_199, status: "Shipped", items: 2, payment: "COD", placed: "2025-05-28", city: "Kochi" },
  { id: "ORD-1252", customer: "Simran Kaur", email: "simran.k@example.com", total: 1_849, status: "Delivered", items: 2, payment: "Razorpay (Netbanking)", placed: "2025-05-27", city: "Chandigarh" },
  { id: "ORD-1251", customer: "Aditi Rao", email: "aditi.rao@example.com", total: 4_780, status: "Delivered", items: 5, payment: "Razorpay (UPI)", placed: "2025-05-27", city: "Bengaluru" },
  { id: "ORD-1250", customer: "Meera Iyer", email: "meera.iyer@example.com", total: 999, status: "Cancelled", items: 1, payment: "COD", placed: "2025-05-26", city: "Chennai" },
  { id: "ORD-1249", customer: "Kavya Menon", email: "kavya.m@example.com", total: 3_098, status: "Shipped", items: 3, payment: "Razorpay (Card)", placed: "2025-05-26", city: "Hyderabad" },
  { id: "ORD-1248", customer: "Tanya Gupta", email: "tanya.g@example.com", total: 1_499, status: "Pending", items: 1, payment: "Razorpay (UPI)", placed: "2025-05-25", city: "Jaipur" },
  { id: "ORD-1247", customer: "Ishita Bose", email: "ishita.bose@example.com", total: 2_745, status: "Refunded", items: 2, payment: "Razorpay (Card)", placed: "2025-05-25", city: "Kolkata" },
  { id: "ORD-1246", customer: "Sneha Pillai", email: "sneha.p@example.com", total: 1_987, status: "Delivered", items: 2, payment: "Razorpay (UPI)", placed: "2025-05-24", city: "Ahmedabad" },
  { id: "ORD-1245", customer: "Divya Reddy", email: "divya.r@example.com", total: 5_240, status: "Delivered", items: 6, payment: "Razorpay (Netbanking)", placed: "2025-05-24", city: "Hyderabad" },
];

/* ── Products ─────────────────────────────────────────────────────────── */

export type ProductStatus = "Active" | "Draft" | "Coming Soon" | "Archived";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  sold: number;
  rating: number;
};

export const PRODUCTS: Product[] = [
  { id: "p-01", name: "Velastia Velvet Matte Lipstick", sku: "VEL-LIP-001", category: "Lipstick", price: 799, stock: 248, status: "Active", sold: 2_547, rating: 4.9 },
  { id: "p-02", name: "Velastia Velvet Matte Liquid Lipstick", sku: "VEL-LIP-002", category: "Lipstick", price: 899, stock: 186, status: "Active", sold: 1_284, rating: 4.8 },
  { id: "p-03", name: "Velastia Face Serum", sku: "VEL-SKN-001", category: "Skincare", price: 1_245, stock: 12, status: "Active", sold: 2_345, rating: 4.8 },
  { id: "p-04", name: "Velastia Day Cream", sku: "VEL-SKN-002", category: "Skincare", price: 1_987, stock: 94, status: "Active", sold: 1_987, rating: 4.7 },
  { id: "p-05", name: "Velastia Night Cream", sku: "VEL-SKN-003", category: "Skincare", price: 1_987, stock: 10, status: "Active", sold: 1_654, rating: 4.7 },
  { id: "p-06", name: "Velastia Sunscreen", sku: "VEL-SKN-004", category: "Skincare", price: 699, stock: 15, status: "Active", sold: 1_253, rating: 4.6 },
  { id: "p-07", name: "Velastia Eye Cream", sku: "VEL-SKN-005", category: "Skincare", price: 1_099, stock: 8, status: "Active", sold: 842, rating: 4.5 },
  { id: "p-08", name: "Velastia Lip Balm", sku: "VEL-LIP-003", category: "Lip Care", price: 499, stock: 320, status: "Active", sold: 987, rating: 4.6 },
  { id: "p-09", name: "Velastia Foundation", sku: "VEL-FAC-001", category: "Face", price: 1_499, stock: 132, status: "Active", sold: 612, rating: 4.7 },
  { id: "p-10", name: "Velastia Hyper Gloss", sku: "VEL-LIP-004", category: "Lip Care", price: 1_299, stock: 76, status: "Active", sold: 176, rating: 4.6 },
  { id: "p-11", name: "Velastia Lip Liner", sku: "VEL-LIP-005", category: "Lip Care", price: 599, stock: 210, status: "Active", sold: 132, rating: 4.5 },
  { id: "p-12", name: "Velastia Makeup Fixer", sku: "VEL-FAC-002", category: "Face", price: 699, stock: 58, status: "Active", sold: 98, rating: 4.6 },
  { id: "p-13", name: "Velastia Perfume", sku: "VEL-PRF-001", category: "Perfume", price: 1_499, stock: 0, status: "Coming Soon", sold: 0, rating: 0 },
  { id: "p-14", name: "Velastia Beauty Blender", sku: "VEL-ACC-001", category: "Accessories", price: 299, stock: 0, status: "Coming Soon", sold: 0, rating: 0 },
  { id: "p-15", name: "Velastia Makeup Brushes", sku: "VEL-ACC-002", category: "Accessories", price: 899, stock: 0, status: "Draft", sold: 0, rating: 0 },
];

export const LOW_STOCK = PRODUCTS.filter((p) => p.status === "Active" && p.stock <= 15);

/* ── Categories ───────────────────────────────────────────────────────── */

export const CATEGORIES = [
  { id: "c-1", name: "Lipstick", slug: "lipstick", products: 3, visible: true },
  { id: "c-2", name: "Lip Care", slug: "lip-care", products: 3, visible: true },
  { id: "c-3", name: "Face", slug: "face", products: 2, visible: true },
  { id: "c-4", name: "Skincare", slug: "skincare", products: 5, visible: true },
  { id: "c-5", name: "Accessories", slug: "accessories", products: 2, visible: true },
  { id: "c-6", name: "Perfume", slug: "perfume", products: 1, visible: false },
];

/* ── Customers ────────────────────────────────────────────────────────── */

export type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  city: string;
  joined: string;
  segment: "New" | "Returning" | "Inactive";
};

export const CUSTOMERS: Customer[] = [
  { id: "c-01", name: "Riya Sharma", email: "riya.sharma@example.com", orders: 8, spent: 18_450, city: "Mumbai", joined: "2024-11-02", segment: "Returning" },
  { id: "c-02", name: "Ananya Verma", email: "ananya.v@example.com", orders: 3, spent: 5_240, city: "Pune", joined: "2025-01-18", segment: "Returning" },
  { id: "c-03", name: "Neha Kapoor", email: "neha.kapoor@example.com", orders: 1, spent: 3_499, city: "Delhi", joined: "2025-05-12", segment: "New" },
  { id: "c-04", name: "Pooja Nair", email: "pooja.nair@example.com", orders: 5, spent: 11_080, city: "Kochi", joined: "2024-08-27", segment: "Returning" },
  { id: "c-05", name: "Simran Kaur", email: "simran.k@example.com", orders: 2, spent: 3_698, city: "Chandigarh", joined: "2025-03-04", segment: "Returning" },
  { id: "c-06", name: "Aditi Rao", email: "aditi.rao@example.com", orders: 12, spent: 34_920, city: "Bengaluru", joined: "2024-05-15", segment: "Returning" },
  { id: "c-07", name: "Meera Iyer", email: "meera.iyer@example.com", orders: 1, spent: 999, city: "Chennai", joined: "2023-12-09", segment: "Inactive" },
  { id: "c-08", name: "Kavya Menon", email: "kavya.m@example.com", orders: 4, spent: 9_310, city: "Hyderabad", joined: "2024-10-21", segment: "Returning" },
  { id: "c-09", name: "Tanya Gupta", email: "tanya.g@example.com", orders: 1, spent: 1_499, city: "Jaipur", joined: "2025-05-25", segment: "New" },
  { id: "c-10", name: "Ishita Bose", email: "ishita.bose@example.com", orders: 2, spent: 4_120, city: "Kolkata", joined: "2024-02-14", segment: "Inactive" },
];

/* ── Store analytics ──────────────────────────────────────────────────── */

export const STORE_ANALYTICS = [
  { label: "Total Visitors", value: "45,689", delta: 12.2, series: [30, 34, 32, 41, 38, 47, 44, 53, 50, 59, 56, 66] },
  { label: "Conversion Rate", value: "2.35%", delta: 0.8, series: [18, 21, 20, 24, 22, 27, 26, 30, 28, 33, 31, 36] },
  { label: "Avg. Order Value", value: "₹1,987", delta: 10.3, series: [40, 44, 42, 49, 47, 54, 52, 58, 56, 63, 61, 68] },
  { label: "Refunds", value: "₹45,678", delta: -3.2, series: [46, 43, 45, 40, 42, 37, 39, 34, 36, 32, 34, 30] },
];

/** Ordered by share → drawn with the single-hue ordinal ramp, not categorical. */
export const TRAFFIC_SOURCES = [
  { label: "Direct", pct: 40 },
  { label: "Organic", pct: 30 },
  { label: "Referral", pct: 20 },
  { label: "Social", pct: 10 },
];

export const TOP_LOCATIONS = [
  { label: "India", pct: 65 },
  { label: "USA", pct: 12 },
  { label: "UK", pct: 8 },
  { label: "Canada", pct: 5 },
  { label: "Others", pct: 10 },
];

export const CUSTOMER_STATS = {
  total: 8_965,
  segments: [
    { label: "New Customers", count: 3_256, pct: 36.3, slot: 1 as const },
    { label: "Returning Customers", count: 3_845, pct: 42.9, slot: 2 as const },
    { label: "Inactive Customers", count: 1_864, pct: 20.8, slot: 3 as const },
  ],
};

export const COUNTERS = [
  { label: "Total Products", value: "512", note: "12 New", tone: "up" as const },
  { label: "Total Categories", value: "28", note: "No Change", tone: "flat" as const },
  { label: "Total Reviews", value: "1,245", note: "85 New", tone: "up" as const },
  { label: "Active Coupons", value: "16", note: "3 New", tone: "up" as const },
];

/* ── Reviews ──────────────────────────────────────────────────────────── */

export type Review = {
  id: string;
  product: string;
  author: string;
  rating: number;
  body: string;
  date: string;
  status: "Published" | "Pending" | "Rejected";
};

export const REVIEWS: Review[] = [
  { id: "r-1", product: "Velastia Velvet Matte Lipstick", author: "Ananya S.", rating: 5, body: "The colour payoff is insane. Lasts all day without drying my lips.", date: "2025-05-28", status: "Published" },
  { id: "r-2", product: "Velastia Face Serum", author: "Kavya M.", rating: 5, body: "Beautiful packaging and such high quality. Totally worth it!", date: "2025-05-27", status: "Published" },
  { id: "r-3", product: "Velastia Day Cream", author: "Tanya P.", rating: 4, body: "Lightweight and perfect for daily use. Wish the jar were bigger.", date: "2025-05-27", status: "Pending" },
  { id: "r-4", product: "Velastia Foundation", author: "Mehak S.", rating: 5, body: "Finally a shade that matches Indian skin tones properly.", date: "2025-05-26", status: "Pending" },
  { id: "r-5", product: "Velastia Sunscreen", author: "Priya R.", rating: 3, body: "Works well but leaves a slight white cast.", date: "2025-05-25", status: "Published" },
  { id: "r-6", product: "Velastia Lip Balm", author: "Anonymous", rating: 1, body: "Spam content flagged by the filter.", date: "2025-05-24", status: "Rejected" },
];

/* ── Coupons & offers ─────────────────────────────────────────────────── */

export type Coupon = {
  code: string;
  type: "Percentage" | "Fixed" | "Free Shipping";
  value: string;
  used: number;
  limit: number;
  expires: string;
  active: boolean;
};

export const COUPONS: Coupon[] = [
  { code: "VEL10", type: "Percentage", value: "10%", used: 1_842, limit: 5_000, expires: "2025-12-31", active: true },
  { code: "WELCOME200", type: "Fixed", value: "₹200", used: 640, limit: 1_000, expires: "2025-09-30", active: true },
  { code: "FREESHIP", type: "Free Shipping", value: "—", used: 2_310, limit: 10_000, expires: "2025-12-31", active: true },
  { code: "DIWALI25", type: "Percentage", value: "25%", used: 0, limit: 2_000, expires: "2025-11-10", active: false },
  { code: "BOGO", type: "Percentage", value: "33%", used: 415, limit: 1_500, expires: "2025-08-15", active: true },
];

export const OFFERS = [
  { id: "o-1", name: "Buy 2 Get 1 Free", scope: "All full-priced products", starts: "2025-05-01", ends: "2025-08-31", active: true },
  { id: "o-2", name: "10% Off First Order", scope: "New customers only", starts: "2025-01-01", ends: "2025-12-31", active: true },
  { id: "o-3", name: "Free Shipping Above ₹999", scope: "Storewide", starts: "2025-01-01", ends: "2025-12-31", active: true },
  { id: "o-4", name: "Complimentary Gift Above ₹1,999", scope: "Storewide", starts: "2025-04-01", ends: "2025-06-30", active: true },
  { id: "o-5", name: "Festive Bundle — Save 15%", scope: "Lipstick + Liner + Fixer", starts: "2025-10-01", ends: "2025-11-15", active: false },
];

/* ── Content ──────────────────────────────────────────────────────────── */

export const BLOG_POSTS = [
  { id: "b-1", title: "How to Find Your Perfect Nude Shade", author: "Anshil Dev", date: "2025-05-26", views: 4_210, status: "Published" as const },
  { id: "b-2", title: "The Science Behind Long-Wear Matte", author: "Dr. Rhea Nathan", date: "2025-05-19", views: 3_154, status: "Published" as const },
  { id: "b-3", title: "Five Ingredients We Will Never Use", author: "Anshil Dev", date: "2025-05-11", views: 5_890, status: "Published" as const },
  { id: "b-4", title: "Building a Monsoon-Proof Routine", author: "Kavya Menon", date: "2025-06-02", views: 0, status: "Scheduled" as const },
  { id: "b-5", title: "Behind the Shade Naming", author: "Anshil Dev", date: "—", views: 0, status: "Draft" as const },
];

export const BANNERS = [
  { id: "bn-1", name: "Homepage Hero — Luxury. Science. You.", placement: "Home / Hero", active: true, clicks: 12_480 },
  { id: "bn-2", name: "Announcement — Free Shipping ₹999", placement: "Global / Top bar", active: true, clicks: 8_920 },
  { id: "bn-3", name: "Shop Sidebar — VEL10", placement: "Shop / Sidebar", active: true, clicks: 3_405 },
  { id: "bn-4", name: "Cart — Complimentary Gift", placement: "Cart / Inline", active: true, clicks: 1_760 },
  { id: "bn-5", name: "Diwali Campaign", placement: "Home / Hero", active: false, clicks: 0 },
];

export const TESTIMONIALS = [
  { id: "t-1", author: "Ananya S.", role: "Verified Buyer", rating: 5, quote: "Velastia lipsticks are my new obsession!", featured: true },
  { id: "t-2", author: "Kavya M.", role: "Verified Buyer", rating: 5, quote: "Beautiful packaging and such high quality.", featured: true },
  { id: "t-3", author: "Malvika Sitlani", role: "Beauty Creator", rating: 5, quote: "The texture is so smooth and the colour payoff is amazing.", featured: true },
  { id: "t-4", author: "Tanya P.", role: "Verified Buyer", rating: 5, quote: "Perfect shades for Indian skin tones.", featured: false },
];

export const FAQS = [
  { id: "f-1", question: "Are Velastia products cruelty free?", category: "Products", order: 1, published: true },
  { id: "f-2", question: "Are the products suitable for Indian skin tones?", category: "Products", order: 2, published: true },
  { id: "f-3", question: "How long does delivery take?", category: "Shipping", order: 3, published: true },
  { id: "f-4", question: "What is your return policy?", category: "Returns", order: 4, published: true },
  { id: "f-5", question: "Are the products dermatologically tested?", category: "Products", order: 5, published: true },
  { id: "f-6", question: "How do I track my order?", category: "Shipping", order: 6, published: true },
  { id: "f-7", question: "Do you ship internationally?", category: "Shipping", order: 7, published: false },
];

/* ── Marketing ────────────────────────────────────────────────────────── */

export const CAMPAIGNS = [
  { id: "cp-1", name: "Velvet Matte Launch", sent: 8_420, opened: 3_620, clicked: 946, date: "2025-05-22", status: "Sent" as const },
  { id: "cp-2", name: "Summer Skincare Edit", sent: 7_980, opened: 3_112, clicked: 705, date: "2025-05-08", status: "Sent" as const },
  { id: "cp-3", name: "Abandoned Cart — 24hr", sent: 1_240, opened: 618, clicked: 214, date: "Ongoing", status: "Automated" as const },
  { id: "cp-4", name: "Monsoon Routine Teaser", sent: 0, opened: 0, clicked: 0, date: "2025-06-05", status: "Scheduled" as const },
  { id: "cp-5", name: "Diwali Preview", sent: 0, opened: 0, clicked: 0, date: "—", status: "Draft" as const },
];

/* ── System ───────────────────────────────────────────────────────────── */

export const ACTIVITY = [
  { id: "a-1", who: "Anshil Dev", what: "Updated price of Velastia Foundation to ₹1,499", when: "12 minutes ago", type: "Product" },
  { id: "a-2", who: "Vikram Shah", what: "Marked ORD-1255 as Delivered", when: "48 minutes ago", type: "Order" },
  { id: "a-3", who: "Rhea Nathan", what: "Published blog post “Five Ingredients We Will Never Use”", when: "2 hours ago", type: "Content" },
  { id: "a-4", who: "System", what: "Low stock alert — Velastia Eye Cream (8 left)", when: "3 hours ago", type: "Inventory" },
  { id: "a-5", who: "Anshil Dev", what: "Created coupon DIWALI25", when: "Yesterday", type: "Marketing" },
  { id: "a-6", who: "Priya Deshpande", what: "Replied to a review on Velastia Sunscreen", when: "Yesterday", type: "Reviews" },
  { id: "a-7", who: "System", what: "Nightly backup completed (412 MB)", when: "Yesterday", type: "System" },
];

export const PAYMENT_METHODS = [
  { id: "pm-1", name: "Razorpay — UPI", note: "Google Pay, PhonePe, Paytm", enabled: true, fee: "0%" },
  { id: "pm-2", name: "Razorpay — Cards", note: "Visa, Mastercard, RuPay, Amex", enabled: true, fee: "2%" },
  { id: "pm-3", name: "Razorpay — Net Banking", note: "All major Indian banks", enabled: true, fee: "1.9%" },
  { id: "pm-4", name: "Razorpay — Wallets", note: "Paytm, Amazon Pay, Mobikwik", enabled: true, fee: "2%" },
  { id: "pm-5", name: "Cash on Delivery", note: "Pay when the order arrives", enabled: true, fee: "₹40 handling" },
];

export const TAX_RATES = [
  { id: "tx-1", name: "GST — Cosmetics", rate: "18%", region: "India (all states)", inclusive: true },
  { id: "tx-2", name: "GST — Accessories", rate: "12%", region: "India (all states)", inclusive: true },
];

export const BACKUPS = [
  { id: "bk-1", name: "Nightly automated", date: "2025-05-29 02:00", size: "412 MB", type: "Automatic" as const },
  { id: "bk-2", name: "Nightly automated", date: "2025-05-28 02:00", size: "409 MB", type: "Automatic" as const },
  { id: "bk-3", name: "Before price update", date: "2025-05-27 16:42", size: "408 MB", type: "Manual" as const },
  { id: "bk-4", name: "Nightly automated", date: "2025-05-27 02:00", size: "407 MB", type: "Automatic" as const },
];
