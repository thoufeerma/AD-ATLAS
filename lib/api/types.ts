/**
 * Shapes returned by the Velastia API's public endpoints (/api/v1/*).
 * Money is always integer paise; format it with `inrPaise` from lib/utils.
 */

export type Shade = { code: string; name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Short "Brightens - Hydrates - Repairs" line used on cart and wishlist rows */
  descriptor: string | null;
  blurb: string | null;
  size: string | null;
  pricePaise: number;
  compareAtPaise: number | null;
  status: "ACTIVE" | "COMING_SOON";
  isBestseller: boolean;
  /** Purchasable right now. Exact stock is never exposed. */
  inStock: boolean;
  lowStock: boolean;
  category: { slug: string; name: string };
  images: { url: string; alt: string | null }[];
  shades: Shade[];
  benefits: string[];
  rating: { average: number; count: number };
  metaTitle: string | null;
  metaDescription: string | null;
};

export type RatingSummary = {
  average: number;
  total: number;
  breakdown: { stars: number; count: number; pct: number }[];
};

export type ProductReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  isVerified: boolean;
  createdAt: string;
};

export type ProductDetail = Product & {
  reviewSummary: RatingSummary;
  reviews: ProductReview[];
};

export type Review = ProductReview & { product: { slug: string; name: string } };

export type Category = {
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

export type Settings = {
  store: {
    name: string;
    legalEntity: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    supportHours: string;
    city: string;
    /** Profile URLs; null means the admin hasn't set that network (hide its icon). */
    social: Record<"instagram" | "youtube" | "facebook" | "x" | "pinterest", string | null>;
    /** e.g. "@velastia.beauty", shown on the homepage Instagram section. */
    instagramHandle: string | null;
  };
  /** Null when the welcome coupon is switched off, expired or used up. */
  welcomeOffer: {
    code: string;
    percent: number;
    firstOrderOnly: boolean;
    minOrderPaise: number;
  } | null;
  /** Returns policy (Settings → Returns). */
  returns: { accepted: boolean; windowDays: number; instructions: string };
  /** Marketing lines the admin can edit (Settings → Site Copy). */
  copy: {
    ratingHeadline: string;
    socialProofHeadline: string;
    happyCustomers: string;
    whyVelastia: string[];
  };
  /** The default shipping method; null when none is enabled. */
  shipping: { name: string; eta: string; pricePaise: number; freeAbovePaise: number | null } | null;
};

/** A CMS page such as the shipping or privacy policy. */
export type Page = {
  slug: string;
  title: string;
  body: { lead: string; sections: { heading: string; body: string[] }[] };
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  rating: number;
  quote: string;
  avatarUrl: string | null;
};

export type Collaborator = { id: string; name: string; role: string; avatarUrl: string | null };

export type Banner = {
  id: string;
  name: string;
  placement: string;
  headline: string | null;
  imageUrl: string | null;
  href: string | null;
};

export type HomeContent = {
  testimonials: Testimonial[];
  collaborators: Collaborator[];
  banners: Banner[];
};

export type Offer = { id: string; name: string; scope: string; startsAt: string; endsAt: string };

export type Faq = { id: string; question: string; answer: string; category: string };

/* ── Cart & orders ── */

export type CartItemInput = { slug: string; quantity: number; shade?: string | null };

export type Quote = {
  lines: {
    productId: string;
    slug: string;
    name: string;
    shadeName: string | null;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
  }[];
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  coupon: { code: string; type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" } | null;
  /** Why an entered code didn't apply. The rest of the quote is still valid. */
  couponError: string | null;
  /** The delivery option this quote is priced with (the default unless one was picked). */
  shipping: { id: string; name: string; eta: string } | null;
  /** Every option on offer, priced for this cart (0 = free for it). */
  shippingOptions: {
    id: string;
    name: string;
    eta: string;
    pricePaise: number;
    freeAbovePaise: number | null;
  }[];
};

export type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "COD";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PlacedOrder = {
  number: string;
  status: OrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: PaymentMethod;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  couponCode: string | null;
  shippingMethod: string | null;
  shippingEta: string | null;
  placedAt: string;
  items: {
    slug: string | null;
    name: string;
    shade: string | null;
    quantity: number;
    unitPricePaise: number;
    lineTotalPaise: number;
  }[];
};

export type TrackedOrder = Omit<PlacedOrder, "taxPaise" | "items"> & {
  shipping: { name: string; city: string; state: string; pincode: string };
  items: {
    slug: string | null;
    name: string;
    shade: string | null;
    quantity: number;
    lineTotalPaise: number;
  }[];
  events: { status: OrderStatus; note: string | null; at: string }[];
};
