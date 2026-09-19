import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  Boxes,
  Star,
  Ticket,
  Percent,
  FileText,
  Newspaper,
  Images,
  GalleryHorizontal,
  MessageSquareQuote,
  HelpCircle,
  Inbox,
  Mail,
  UserPlus,
  Search,
  BarChart3,
  PackageSearch,
  UserSearch,
  Activity,
  ShieldCheck,
  Settings,
  CreditCard,
  Truck,
  Receipt,
  Bell,
  ScrollText,
  DatabaseBackup,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
  /**
   * The screen still shows placeholder data from lib/mock.ts because the API
   * has no routes for it yet. Flagged in the sidebar and on the page itself so
   * nobody mistakes sample figures for the store's own. Remove the flag when a
   * screen is wired up.
   */
  sample?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** The five sidebar groups drawn in M-Admin-Panel-1.0v.png. */
export const NAV: NavGroup[] = [
  {
    title: "Main",
    items: [
      { href: "/", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/orders", label: "Orders", Icon: ShoppingCart },
      { href: "/customers", label: "Customers", Icon: Users },
      { href: "/inbox", label: "Inbox", Icon: Inbox },
      { href: "/products", label: "Products", Icon: Package },
      { href: "/categories", label: "Categories", Icon: FolderTree },
      { href: "/inventory", label: "Inventory", Icon: Boxes },
      { href: "/reviews", label: "Reviews", Icon: Star },
      { href: "/coupons", label: "Coupons", Icon: Ticket },
      { href: "/offers", label: "Offers & Deals", Icon: Percent },
    ],
  },
  {
    title: "Content Management",
    items: [
      { href: "/pages", label: "Pages", Icon: FileText },
      { href: "/blog", label: "Blog Posts", Icon: Newspaper, sample: true },
      { href: "/media", label: "Media Library", Icon: Images, sample: true },
      { href: "/banners", label: "Banners", Icon: GalleryHorizontal },
      { href: "/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
      { href: "/faqs", label: "FAQs", Icon: HelpCircle },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/campaigns", label: "Email Campaigns", Icon: Mail, sample: true },
      { href: "/subscribers", label: "Subscribers", Icon: UserPlus },
      { href: "/seo", label: "SEO Settings", Icon: Search, sample: true },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { href: "/reports/sales", label: "Sales Reports", Icon: BarChart3, sample: true },
      { href: "/reports/products", label: "Product Reports", Icon: PackageSearch, sample: true },
      { href: "/reports/customers", label: "Customer Reports", Icon: UserSearch, sample: true },
      { href: "/reports/traffic", label: "Traffic Analytics", Icon: Activity, sample: true },
    ],
  },
  {
    title: "System Settings",
    items: [
      { href: "/users", label: "Users & Roles", Icon: ShieldCheck },
      { href: "/settings", label: "Settings", Icon: Settings },
      { href: "/settings/payments", label: "Payment Methods", Icon: CreditCard, sample: true },
      { href: "/settings/shipping", label: "Shipping Methods", Icon: Truck },
      { href: "/settings/tax", label: "Tax Settings", Icon: Receipt, sample: true },
      { href: "/settings/notifications", label: "Notifications", Icon: Bell, sample: true },
      { href: "/activity", label: "Activity Logs", Icon: ScrollText },
      { href: "/backup", label: "Backup & Restore", Icon: DatabaseBackup, sample: true },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

/**
 * The nav item for a path: the longest href that prefixes it, so
 * `/settings/tax` resolves to "Tax Settings" rather than "Settings".
 */
export function findNavItem(pathname: string): NavItem | undefined {
  return ALL_NAV_ITEMS.filter((i) =>
    i.href === "/" ? pathname === "/" : pathname === i.href || pathname.startsWith(i.href + "/"),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
