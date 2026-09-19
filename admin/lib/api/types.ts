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
  items: {
    id: string;
    productName: string;
    sku: string;
    shadeName: string | null;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
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
  alertRecipients: string[];
};

export type SiteSettings = {
  store: StoreDetails | null;
  welcomeOffer: { code: string | null };
  copy: SiteCopy;
  notifications: NotificationSettings;
  /** Whether an email service is connected; if not, emails are only logged. */
  email: { connected: boolean; from: string };
  shipping: { name: string; pricePaise: number; freeAbovePaise: number | null } | null;
};

export type PageSection = { heading: string; body: string[] };

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
  test: "Test",
};

export const EMAIL_STATUS_LABEL: Record<EmailStatus, string> = {
  SENT: "Sent",
  FAILED: "Failed",
  CAPTURED: "Not sent",
};

