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
      { href: "/orders", label: "Orders", Icon: ShoppingCart, badge: 125 },
      { href: "/customers", label: "Customers", Icon: Users },
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
      { href: "/blog", label: "Blog Posts", Icon: Newspaper },
      { href: "/media", label: "Media Library", Icon: Images },
      { href: "/banners", label: "Banners", Icon: GalleryHorizontal },
      { href: "/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
      { href: "/faqs", label: "FAQs", Icon: HelpCircle },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/campaigns", label: "Email Campaigns", Icon: Mail },
      { href: "/subscribers", label: "Subscribers", Icon: UserPlus },
      { href: "/seo", label: "SEO Settings", Icon: Search },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { href: "/reports/sales", label: "Sales Reports", Icon: BarChart3 },
      { href: "/reports/products", label: "Product Reports", Icon: PackageSearch },
      { href: "/reports/customers", label: "Customer Reports", Icon: UserSearch },
      { href: "/reports/traffic", label: "Traffic Analytics", Icon: Activity },
    ],
  },
  {
    title: "System Settings",
    items: [
      { href: "/users", label: "Users & Roles", Icon: ShieldCheck },
      { href: "/settings", label: "Settings", Icon: Settings },
      { href: "/settings/payments", label: "Payment Methods", Icon: CreditCard },
      { href: "/settings/shipping", label: "Shipping Methods", Icon: Truck },
      { href: "/settings/tax", label: "Tax Settings", Icon: Receipt },
      { href: "/settings/notifications", label: "Notifications", Icon: Bell },
      { href: "/activity", label: "Activity Logs", Icon: ScrollText },
      { href: "/backup", label: "Backup & Restore", Icon: DatabaseBackup },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
