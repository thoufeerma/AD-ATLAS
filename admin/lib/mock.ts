/**
 * Sample data for the admin screens that aren't wired to the API yet —
 * Traffic Analytics, Email Campaigns and Backup & Restore. Every screen that uses this file is marked
 * "Sample" in the sidebar, so nobody mistakes these figures for the store's.
 *
 * Everything else — the dashboard, orders, products, customers, reviews,
 * coupons, content, settings, tax and the reports — reads the real database
 * through the API. Entries are removed from here as each screen is connected.
 *
 * DELIBERATELY SELF-CONTAINED: this app imports nothing from the storefront.
 */

/* ── Traffic analytics (no analytics provider connected yet) ──────────── */

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

/* ── Content ──────────────────────────────────────────────────────────── */

/* ── Marketing ────────────────────────────────────────────────────────── */

export const CAMPAIGNS = [
  { id: "cp-1", name: "Velvet Matte Launch", sent: 8_420, opened: 3_620, clicked: 946, date: "2025-05-22", status: "Sent" as const },
  { id: "cp-2", name: "Summer Skincare Edit", sent: 7_980, opened: 3_112, clicked: 705, date: "2025-05-08", status: "Sent" as const },
  { id: "cp-3", name: "Abandoned Cart — 24hr", sent: 1_240, opened: 618, clicked: 214, date: "Ongoing", status: "Automated" as const },
  { id: "cp-4", name: "Monsoon Routine Teaser", sent: 0, opened: 0, clicked: 0, date: "2025-06-05", status: "Scheduled" as const },
  { id: "cp-5", name: "Diwali Preview", sent: 0, opened: 0, clicked: 0, date: "—", status: "Draft" as const },
];

/* ── System ───────────────────────────────────────────────────────────── */

export const BACKUPS = [
  { id: "bk-1", name: "Nightly automated", date: "2025-05-29 02:00", size: "412 MB", type: "Automatic" as const },
  { id: "bk-2", name: "Nightly automated", date: "2025-05-28 02:00", size: "409 MB", type: "Automatic" as const },
  { id: "bk-3", name: "Before price update", date: "2025-05-27 16:42", size: "408 MB", type: "Manual" as const },
  { id: "bk-4", name: "Nightly automated", date: "2025-05-27 02:00", size: "407 MB", type: "Automatic" as const },
];
