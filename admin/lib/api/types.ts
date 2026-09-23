/**
 * Shapes returned by the Velastia API. Money is always integer paise.
 * Kept in sync by hand with backend/src/routes — the apps share no code.
 */

export type AdminRole = "SUPER_ADMIN" | "CONTENT_MANAGER" | "ORDER_MANAGER" | "SUPPORT_AGENT";

export type Admin = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  /** Signed in with a temporary or placeholder password; must set their own. */
  mustChangePassword: boolean;
};

export const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Administrator",
  CONTENT_MANAGER: "Content Manager",
  ORDER_MANAGER: "Order Manager",
  SUPPORT_AGENT: "Support Agent",
};

/** What each role can do — mirrors the gates in backend/src/routes/admin. */
export const ROLE_SUMMARY: Record<AdminRole, string> = {
  SUPER_ADMIN:
    "Everything: products, prices, coupons, offers, store settings, activity logs and Users & Roles.",
  CONTENT_MANAGER:
    "Pages, banners, FAQs, testimonials, collaborators, site copy and newsletter subscribers. Reads the inbox.",
  ORDER_MANAGER: "Orders (including status updates), customers and stock levels. Reads the inbox.",
  SUPPORT_AGENT: "Views orders and customers and moderates reviews. Reads the inbox.",
};

/** An account on the Users & Roles screen. */
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "COD";
export type ProductStatus = "ACTIVE" | "DRAFT" | "COMING_SOON" | "ARCHIVED";

type Delta = { value: number; delta: number | null };

export type Dashboard = {
  kpis: {
    totalSalesPaise: Delta;
    orders: Delta;
    newCustomers: Delta;
    revenuePaise: Delta;
    averageOrderValuePaise: number;
  };
  salesByMonth: { month: string; salesPaise: number; orders: number }[];
  topProducts: { productId: string; name: string; revenuePaise: number; unitsSold: number }[];
  recentOrders: {
    number: string;
    shipName: string;
    totalPaise: number;
    status: OrderStatus;
    placedAt: string;
  }[];
  lowStock: { id: string; name: string; stock: number }[];
  counters: {
    products: number;
    categories: number;
    reviews: number;
    pendingReviews: number;
    activeCoupons: number;
    customers: number;
  };
  customerSegments: { repeat: number; oneTime: number; noPurchase: number };
};

export type OrderListItem = {
  id: string;
  number: string;
  customer: string;
  email: string;
  city: string;
  itemCount: number;
  totalPaise: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  placedAt: string;
};

export type OrderDetail = {
  id: string;
  number: string;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  couponCode: string | null;
  /** The delivery option chosen at checkout (null on orders from before). */
  shippingMethod: string | null;
  shippingEta: string | null;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  shipCountry: string;
  placedAt: string;
  /** GST invoice, e.g. VL/2627/00001 — null until issued. */
  invoiceNumber: string | null;
  invoicedAt: string | null;
  /** Whether invoices can be issued at all (a GSTIN is saved under Settings → Tax). */
  invoicing: { configured: boolean };
  /** GST credit notes against the invoice, oldest first. */
  creditNotes: CreditNoteSummary[];
  items: {
    id: string;
    productName: string;
    sku: string;
    shadeName: string | null;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
    hsnCode: string;
    gstRateBps: number;
  }[];
  events: { id: string; status: OrderStatus; note: string | null; createdAt: string }[];
  customer: { id: string; name: string; email: string; phone: string | null } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  productCount?: number;
};

export type Shade = { code: string; name: string; hex: string };
export type ProductImage = { url: string; alt: string };

export type ProductListItem = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  pricePaise: number;
  hsnCode: string;
  gstRateBps: number;
  status: ProductStatus;
  stock: number;
  lowStockThreshold: number;
  isBestseller: boolean;
  sold: number;
  category: { id: string; name: string };
};

export type ProductDetail = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  descriptor: string | null;
  blurb: string | null;
  size: string | null;
  pricePaise: number;
  compareAtPaise: number | null;
  /** GST classification printed on invoices, e.g. 3304. */
  hsnCode: string;
  /** Basis points: 1800 = 18%. */
  gstRateBps: number;
  status: ProductStatus;
  isBestseller: boolean;
  stock: number;
  lowStockThreshold: number;
  benefits: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string;
  shades: Shade[];
  images: ProductImage[];
};

/** "OUT_FOR_DELIVERY" → "Out for Delivery". */
export function humanize(value: string) {
  const small = new Set(["for", "of", "and", "to"]);
  return value
    .toLowerCase()
    .split("_")
    .map((w, i) => (i > 0 && small.has(w) ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join(" ");
}

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  /** Guest checkout only, or a storefront account (verified email or not yet). */
  account: "GUEST" | "VERIFIED" | "UNVERIFIED";
  orderCount: number;
  lifetimeValuePaise: number;
  lastOrderAt: string | null;
};

export type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED";

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  isVerified: boolean;
  createdAt: string;
  product: { id: string; name: string };
};

export type CouponType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  /** PERCENTAGE: basis points (1000 = 10%). FIXED: paise. */
  value: number;
  minOrderPaise: number;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  usedCount: number;
  firstOrderOnly: boolean;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  rating: number;
  quote: string;
  avatarUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type Banner = {
  id: string;
  name: string;
  placement: string;
  headline: string | null;
  imageUrl: string | null;
  href: string | null;
  isActive: boolean;
  clicks: number;
  sortOrder: number;
};

export type Offer = {
  id: string;
  name: string;
  scope: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  adminUser: { name: string; email: string } | null;
};

/* ── Settings & pages ── */

export type StoreDetails = {
  name: string;
  legalEntity: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  city: string;
  /** Profile links for the header/footer icons; null hides that icon. */
  social: SocialLinks;
  instagramHandle: string | null;
};

export type SocialLinks = {
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  x: string | null;
  pinterest: string | null;
};

export type SiteCopy = {
  ratingHeadline: string;
  socialProofHeadline: string;
  happyCustomers: string;
  whyVelastia: string[];
};

export type NotificationSettings = {
  orderConfirmation: boolean;
  shippingUpdates: boolean;
  alertNewOrder: boolean;
  alertNewMessage: boolean;
  returnUpdates: boolean;
  alertReturnRequest: boolean;
  alertRecipients: string[];
};

export type SiteSettings = {
  store: StoreDetails | null;
  welcomeOffer: { code: string | null };
  copy: SiteCopy;
  notifications: NotificationSettings;
  returns: ReturnPolicy;
  tax: TaxDetails;
  seo: SeoSettings;
  /** Whether an email service is connected; if not, emails are only logged. */
  email: { connected: boolean; from: string };
  shipping: { name: string; pricePaise: number; freeAbovePaise: number | null } | null;
};

export type CreditNoteReason = "RETURN" | "CANCELLATION" | "REFUND";

export const CREDIT_REASON_LABEL: Record<CreditNoteReason, string> = {
  RETURN: "Return",
  CANCELLATION: "Cancelled",
  REFUND: "Refunded",
};

export type CreditNoteSummary = {
  id: string;
  number: string;
  reason: CreditNoteReason;
  totalPaise: number;
  issuedAt: string;
  returnRequest: { number: string } | null;
};

/** The pages whose title and description the admin owns (SEO Settings). */
export const SEO_PAGES = [
  "home",
  "shop",
  "about",
  "offers",
  "collabs",
  "reviews",
  "faqs",
  "ingredients",
  "contact",
  "track-order",
  "blog",
] as const;

export type SeoPage = (typeof SEO_PAGES)[number];

export type SeoSettings = {
  defaultTitle: string;
  /** Added after every other page's title. */
  titleSuffix: string;
  description: string;
  shareImageUrl: string | null;
  /** False keeps the whole storefront out of search results. */
  indexable: boolean;
  pages: Record<SeoPage, { title: string; description: string }>;
};

/** GST registration, for invoices. Invoicing is on once a GSTIN is saved. */
export type TaxDetails = {
  gstin: string | null;
  legalName: string;
  address: string;
  invoicePrefix: string;
  /** Read from the GSTIN's first two digits. */
  state: { code: string; name: string } | null;
};

type GstSums = { taxablePaise: number; cgstPaise: number; sgstPaise: number; igstPaise: number; totalPaise: number };

export type GstReport = {
  month: string;
  /** Months with anything to show, newest first. */
  months: string[];
  seller: { gstin: string; legalName: string; state: { code: string; name: string } | null } | null;
  totals: {
    invoices: GstSums & { count: number };
    creditNotes: GstSums & { count: number };
    /** Invoices less credit notes. */
    net: GstSums;
  };
  invoices: (GstSums & {
    number: string;
    issuedAt: string;
    orderNumber: string;
    customer: string;
    state: string;
    stateCode: string | null;
    status: OrderStatus;
  })[];
  creditNotes: (GstSums & {
    id: string;
    number: string;
    issuedAt: string;
    reason: CreditNoteReason;
    returnNumber: string | null;
    invoiceNumber: string;
    orderNumber: string;
    customer: string;
    state: string;
    stateCode: string | null;
  })[];
  /** Net of credit notes. */
  byState: (GstSums & { state: string; stateCode: string | null; rateBps: number })[];
  byHsn: (GstSums & { hsnCode: string; rateBps: number; quantity: number })[];
};

export type PageSection = { heading: string; body: string[] };

export type PublishStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  excerpt: string | null;
  coverUrl: string | null;
  status: PublishStatus;
  /** When it goes (or went) live; null on a draft that's never been dated. */
  publishedAt: string | null;
  updatedAt: string;
};

export type BlogPost = BlogPostListItem & {
  /** Plain paragraphs, "## " headings and "- " bullets. */
  body: string;
};

export type PageListItem = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
};

export type PageDetail = PageListItem & {
  body: { lead: string; sections: PageSection[] };
  metaTitle: string | null;
  metaDescription: string | null;
  /** Placeholder names the storefront fills in, e.g. free_shipping_above. */
  tokens: string[];
};

/** Mirrors the API's role gates (backend/src/middleware/auth.ts). */
export const can = {
  readOrders: (role: AdminRole) => role !== "CONTENT_MANAGER",
  editContent: (role: AdminRole) => role === "SUPER_ADMIN" || role === "CONTENT_MANAGER",
  editStore: (role: AdminRole) => role === "SUPER_ADMIN",
};

/* ── Inbox & subscribers ── */

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isHandled: boolean;
  createdAt: string;
};

export type CollabApplication = {
  id: string;
  name: string;
  email: string;
  handle: string;
  audienceSize: string | null;
  about: string;
  isReviewed: boolean;
  createdAt: string;
};

export type InboxCounts = { messages: number; applications: number; total: number };

export type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED";
  createdAt: string;
  updatedAt: string;
};

/* ── Shipping ── */

export type ShippingMethod = {
  id: string;
  name: string;
  eta: string;
  pricePaise: number;
  /** Free once the post-discount subtotal reaches this; null = never free. */
  freeAbovePaise: number | null;
  isEnabled: boolean;
  sortOrder: number;
};

/* ── Email log ── */

export type EmailStatus = "SENT" | "FAILED" | "CAPTURED";

export type EmailLogRow = {
  id: string;
  to: string;
  subject: string;
  kind: string;
  status: EmailStatus;
  detail: string | null;
  orderId: string | null;
  createdAt: string;
};

export type EmailLogDetail = EmailLogRow & { html: string };

export const EMAIL_KIND_LABEL: Record<string, string> = {
  "order.confirmation": "Order confirmation",
  "order.status": "Order update",
  "alert.order": "New-order alert",
  "alert.message": "Message alert",
  "alert.collab": "Collab alert",
  "account.verify": "Confirm email",
  "account.reset": "Password reset",
  test: "Test",
};

export const EMAIL_STATUS_LABEL: Record<EmailStatus, string> = {
  SENT: "Sent",
  FAILED: "Failed",
  CAPTURED: "Not sent",
};

/* ── Media ── */

export type MediaAsset = {
  id: string;
  filename: string;
  /** Site path, e.g. /uploads/2026/09/ab12….webp */
  url: string;
  alt: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  /** Where it's used, e.g. "Product: Velastia Face Serum". */
  usedIn: string[];
};


/* ── Reports ──
 * All three cover the last 12 calendar months and count the same orders as the
 * dashboard: unpaid, cancelled and refunded orders are left out. `change` is a
 * percentage against the 12 months before, and null until there is one.
 */

export type SalesReport = {
  months: { month: string; revenuePaise: number; orders: number }[];
  best: { month: string; revenuePaise: number; orders: number } | null;
  totals: {
    revenuePaise: number;
    orders: number;
    unitsSold: number;
    discountPaise: number;
    aovPaise: number;
  };
  change: { revenue: number | null; orders: number | null; aov: number | null };
};

export type ProductReportRow = {
  id: string;
  name: string;
  sku: string;
  pricePaise: number;
  status: ProductStatus;
  stock: number;
  category: { slug: string; name: string };
  /** Sum of the item lines, so shipping, discounts and tax are not included. */
  revenuePaise: number;
  unitsSold: number;
};

export type ProductReport = {
  top: ProductReportRow[];
  byCategory: { slug: string; name: string; revenuePaise: number; unitsSold: number }[];
  neverSold: ProductReportRow[];
  totals: { products: number; sellingProducts: number; unitsSold: number; revenuePaise: number };
};

export type CustomerReport = {
  totals: {
    customers: number;
    accounts: number;
    buyers: number;
    newThisMonth: number;
    repeatRatePct: number;
    avgLifetimePaise: number;
  };
  change: { newThisMonth: number | null };
  segments: { label: string; count: number }[];
  newByMonth: { month: string; count: number }[];
  top: { name: string; email: string; hasAccount: boolean; orders: number; spentPaise: number }[];
};

/* ── Returns ── */

export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";
export type ReturnReason =
  | "DAMAGED"
  | "WRONG_ITEM"
  | "NOT_AS_DESCRIBED"
  | "REACTION"
  | "CHANGED_MIND"
  | "OTHER";

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RECEIVED: "Received",
  REFUNDED: "Refunded",
};

export const RETURN_REASON_LABEL: Record<ReturnReason, string> = {
  DAMAGED: "Arrived damaged",
  WRONG_ITEM: "Wrong item sent",
  NOT_AS_DESCRIBED: "Not as described",
  REACTION: "Caused a reaction",
  CHANGED_MIND: "Changed their mind",
  OTHER: "Something else",
};

/** What a return may become next; the API enforces the same list. */
export const RETURN_NEXT: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED", "REJECTED"],
  RECEIVED: ["REFUNDED", "REJECTED"],
  REJECTED: [],
  REFUNDED: [],
};

export type ReturnRequest = {
  number: string;
  status: ReturnStatus;
  reason: ReturnReason;
  /** The customer's own words. */
  note: string | null;
  /** What the team replied; it goes into the customer's email. */
  staffNote: string | null;
  refundPaise: number | null;
  /** What the customer paid for the listed items (after any coupon) — what a full refund would be. */
  suggestedRefundPaise: number;
  /** Issued with the refund when the order had a GST invoice. */
  creditNote: { id: string; number: string; totalPaise: number; issuedAt: string } | null;
  requestedAt: string;
  resolvedAt: string | null;
  order: {
    number: string;
    email: string;
    shipName: string;
    shipPhone: string;
    totalPaise: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod | null;
    placedAt: string;
  };
  items: {
    id: string;
    name: string;
    sku: string;
    shade: string | null;
    quantity: number;
    orderedQuantity: number;
    unitPricePaise: number;
  }[];
};

export type ReturnCounts = { open: number; requested: number };

/** Returns policy, from Settings. */
export type ReturnPolicy = { accepted: boolean; windowDays: number; instructions: string };
