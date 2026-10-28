"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  History,
  Layers,
  Loader2,
  MousePointerClick,
  Percent,
  RefreshCw,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import type {
  CollaboratorProfile,
  CollaboratorReferralItem,
  CollaboratorReferralsResponse,
  CollaboratorStats,
  Product,
  RedeemRequestItem,
} from "@/lib/api/types";
import { cn, inr, inrPaise, productImage } from "@/lib/utils";

type Tab = "profile" | "promote" | "earnings" | "redeem";

const cardCls = "rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5 md:p-6";
const inputCls =
  "w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none transition-colors";

export default function CollaboratorSection({ products }: { products: Product[] }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null);
  const [tab, setTab] = useState<Tab>("profile");

  // Load collaborator profile. If 403 (not a collaborator), silently stay hidden.
  useEffect(() => {
    let active = true;
    api<CollaboratorProfile>("GET", "/me/collaborator")
      .then((data) => {
        if (active) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          // If 403 or anything, we don't render the section
          setProfile(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading || !profile) return null;

  return (
    <section className="mb-10 rounded-[var(--radius-card)] border border-gold-300/80 bg-cream-100/90 p-5 shadow-sm md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-gold-200/70 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-0.5 text-[0.7rem] font-semibold tracking-wider uppercase text-gold-700">
              <Sparkles className="size-3" /> Creator Hub
            </span>
            <span className="text-xs text-ink-soft font-mono font-medium">
              Ref: <strong className="text-plum-800">{profile.referralCode}</strong>
            </span>
          </div>
          <h2 className="mt-1 font-heading text-2xl font-bold text-plum-800 md:text-3xl">
            Collaborator Portal
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft md:text-sm">
            Earn {profile.commissionRate}% commission on every eligible purchase driven by your links.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-gold-200/80 bg-cream-50 p-1">
          {(
            [
              { id: "profile", label: "Profile", icon: User },
              { id: "promote", label: "Promote", icon: Share2 },
              { id: "earnings", label: "Earnings", icon: TrendingUp },
              { id: "redeem", label: "Redeem", icon: Wallet },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-plum-800 text-gold-300 shadow-xs"
                    : "text-ink-soft hover:bg-cream-100 hover:text-plum-800",
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-6">
        {tab === "profile" && <ProfileTab profile={profile} onUpdated={setProfile} />}
        {tab === "promote" && <PromoteTab profile={profile} products={products} />}
        {tab === "earnings" && <EarningsTab profile={profile} />}
        {tab === "redeem" && <RedeemTab profile={profile} />}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Profile Tab: Bio, Handle, Avatar + Read-only Info                        */
/* ────────────────────────────────────────────────────────────────────────── */

function ProfileTab({
  profile,
  onUpdated,
}: {
  profile: CollaboratorProfile;
  onUpdated: (p: CollaboratorProfile) => void;
}) {
  const [handle, setHandle] = useState(profile.handle ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await api<CollaboratorProfile>("PATCH", "/me/collaborator", {
        handle: handle.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      onUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError((err as Error).message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Read-Only Specs Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-gold-200/80 bg-cream-50 p-4">
          <p className="text-[0.7rem] font-semibold tracking-wider uppercase text-gold-700">
            Referral Code
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-lg font-bold text-plum-800">
              {profile.referralCode}
            </span>
            <CopyButton text={profile.referralCode ?? ""} label="Copy Code" />
          </div>
          <p className="mt-1 text-[0.72rem] text-ink-soft">
            Permanent code linked to your creator profile.
          </p>
        </div>

        <div className="rounded-md border border-gold-200/80 bg-cream-50 p-4">
          <p className="text-[0.7rem] font-semibold tracking-wider uppercase text-gold-700">
            Commission Rate
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-plum-800">
            {profile.commissionRate}%
          </p>
          <p className="mt-1 text-[0.72rem] text-ink-soft">
            Excludes tax & shipping; calculated post-discounts.
          </p>
        </div>

        <div className="rounded-md border border-gold-200/80 bg-cream-50 p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-[0.7rem] font-semibold tracking-wider uppercase text-gold-700">
            Creator Role
          </p>
          <p className="mt-1 text-base font-semibold text-plum-800">{profile.role}</p>
          <p className="mt-1 text-[0.72rem] text-ink-soft">
            Partner since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Editable Form */}
      <form onSubmit={handleSave} className={cardCls}>
        <h3 className="font-heading text-lg font-bold text-plum-800">Edit Public Profile</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          Update how you appear on the Velastia Collabs page and brand community lists.
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Handle */}
          <div>
            <label className="block text-xs font-semibold text-plum-800 mb-1.5">
              Handle / Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-ink-soft">
                @
              </span>
              <input
                type="text"
                value={handle.replace(/^@/, "")}
                onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                placeholder="yourhandle"
                className={cn(inputCls, "pl-7")}
                maxLength={40}
              />
            </div>
            <p className="mt-1 text-[0.7rem] text-ink-soft">
              Your social handle (e.g. instagram or tiktok username).
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-plum-800 mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
            <p className="mt-1 text-[0.7rem] text-ink-soft">
              Direct link to a high-res profile photo or avatar.
            </p>
          </div>
        </div>

        {/* Avatar Live Preview */}
        {avatarUrl && (
          <div className="mt-4 flex items-center gap-3 rounded-md border border-gold-200/60 bg-cream-50 p-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-gold-300 bg-gold-100">
              <Image
                src={avatarUrl}
                alt="Avatar preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-plum-800">Avatar Preview</p>
              <p className="text-ink-soft text-[0.7rem] truncate max-w-xs">{avatarUrl}</p>
            </div>
          </div>
        )}

        {/* Bio */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-plum-800">Bio</label>
            <span className="text-[0.68rem] text-ink-soft">{bio.length}/500</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Tell your audience about your style, beauty regimen, or why you love Velastia..."
            className={inputCls}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Promote Tab: Referral Link & Product Picker                             */
/* ────────────────────────────────────────────────────────────────────────── */

function PromoteTab({
  profile,
  products,
}: {
  profile: CollaboratorProfile;
  products: Product[];
}) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [origin, setOrigin] = useState("https://velastia.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const generalLink = `${origin}/?ref=${profile.referralCode}`;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [products, selectedProductId],
  );

  const productLink = selectedProduct
    ? `${origin}/product/${selectedProduct.slug}?ref=${profile.referralCode}`
    : "";

  return (
    <div className="space-y-6">
      {/* General Storefront Link */}
      <div className={cardCls}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-plum-800">
              General Referral Link
            </h3>
            <p className="mt-0.5 text-xs text-ink-soft">
              Direct visitors to the home page. Any order placed within 30 days is attributed to you.
            </p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-gold-200/50 px-2.5 py-1 text-[0.7rem] font-semibold text-gold-800">
            30-day cookie
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            readOnly
            value={generalLink}
            className={cn(inputCls, "font-mono text-xs select-all bg-white")}
          />
          <div className="flex shrink-0 gap-2">
            <CopyButton text={generalLink} label="Copy Link" className="w-full sm:w-auto" />
            <a
              href={generalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-sm border border-gold-300 px-3 py-2 text-xs font-medium text-plum-800 hover:bg-gold-50"
              title="Open in new tab"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Product Specific Link Generator */}
      <div className={cardCls}>
        <div>
          <h3 className="font-heading text-lg font-bold text-plum-800">
            Product Specific Link Builder
          </h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            Pick a product to generate a targeted link for reviews, Instagram stories, or TikTok tags.
          </p>
        </div>

        {/* Product Picker Dropdown & Search */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-plum-800 mb-1.5">
              Search Products
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-ink-soft" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name..."
                className={cn(inputCls, "pl-9 text-xs")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum-800 mb-1.5">
              Select Product ({filteredProducts.length} available)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={cn(inputCls, "text-xs")}
            >
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {inrPaise(p.pricePaise)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Product Card & Link */}
        {selectedProduct && (
          <div className="mt-5 rounded-md border border-gold-200/80 bg-cream-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-gold-200 bg-white">
                <Image
                  src={productImage(selectedProduct)}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] uppercase font-semibold text-gold-700">
                  {selectedProduct.category.name}
                </p>
                <h4 className="font-heading text-base font-bold text-plum-800 truncate">
                  {selectedProduct.name}
                </h4>
                <p className="text-xs font-medium text-ink-soft">
                  Price: <strong className="text-plum-800">{inrPaise(selectedProduct.pricePaise)}</strong> ·
                  Est. Commission:{" "}
                  <strong className="text-gold-700">
                    {inrPaise(Math.round((selectedProduct.pricePaise * profile.commissionRate) / 100))}
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                readOnly
                value={productLink}
                className={cn(inputCls, "font-mono text-xs select-all bg-white")}
              />
              <div className="flex shrink-0 gap-2">
                <CopyButton text={productLink} label="Copy Product Link" className="w-full sm:w-auto" />
                <a
                  href={productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-sm border border-gold-300 px-3 py-2 text-xs font-medium text-plum-800 hover:bg-gold-50"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Earnings Tab: Metric Cards & Paginated Referrals Table                  */
/* ────────────────────────────────────────────────────────────────────────── */

function EarningsTab({ profile }: { profile: CollaboratorProfile }) {
  const [stats, setStats] = useState<CollaboratorStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Referrals pagination state
  const [referrals, setReferrals] = useState<CollaboratorReferralItem[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [page, setPage] = useState(0);
  const take = 10;
  const [referralsLoading, setReferralsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api<CollaboratorStats>("GET", "/me/collaborator/stats");
      setStats(res);
      setStatsError(null);
    } catch (err) {
      setStatsError((err as Error).message || "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchReferrals = useCallback(async (skipCount: number) => {
    setReferralsLoading(true);
    try {
      const res = await api<CollaboratorReferralItem[]>("GET", `/me/collaborator/referrals?take=${take}&skip=${skipCount}`);
      // api() returns json.data. If backend returned { data, pagination }, res is the items array
      setReferrals(Array.isArray(res) ? res : []);
      // fetch count
      setTotalReferrals(Array.isArray(res) ? res.length : 0);
    } catch {
      setReferrals([]);
    } finally {
      setReferralsLoading(false);
    }
  }, [take]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReferrals(page * take);
  }, [page, take, fetchReferrals]);

  return (
    <div className="space-y-6">
      {/* Deficit Alert if Net Balance is Negative */}
      {stats && stats.netBalancePaise < 0 && (
        <div className="flex items-start gap-3 rounded-md border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900">
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-800">
              Account Deficit: {inrPaise(stats.netBalancePaise)}
            </p>
            <p className="mt-0.5 text-rose-700">
              One or more orders credited to your account were subsequently returned or refunded after payouts were issued. Future commissions will automatically credit towards this balance before new payouts can be requested.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={statsLoading ? "..." : (stats?.clicks ?? 0).toLocaleString("en-IN")}
          sub="Referral visits"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={statsLoading ? "..." : (stats?.orderCount ?? 0).toLocaleString("en-IN")}
          sub="Attributed sales"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending"
          value={statsLoading ? "..." : inrPaise(stats?.pendingEarningsPaise ?? 0)}
          sub="In return window"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={statsLoading ? "..." : inrPaise(stats?.approvedEarningsPaise ?? 0)}
          sub="Lifetime earnings"
        />
        <StatCard
          icon={Wallet}
          label="Available"
          value={statsLoading ? "..." : inrPaise(stats?.availableBalancePaise ?? 0)}
          sub="Ready for payout"
          highlight
        />
      </div>

      {/* Referrals History Table */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-plum-800">
              Referrals Breakdown
            </h3>
            <p className="text-xs text-ink-soft">
              Orders placed using your link and their current commission status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchReferrals(page * take);
            }}
            className="flex items-center gap-1 text-xs text-gold-700 hover:text-plum-800"
            title="Refresh referrals"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {referralsLoading ? (
          <div className="flex min-h-[160px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-gold-600" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="rounded-md border border-dashed border-gold-300/80 bg-cream-50/50 py-12 text-center">
            <ShoppingBag className="mx-auto size-8 text-gold-400" />
            <p className="mt-2 text-sm font-semibold text-plum-800">No referral orders yet</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Share your custom links from the Promote tab to start earning!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold-200 text-ink-soft uppercase tracking-wider text-[0.65rem]">
                  <th className="pb-2.5 font-semibold">Order #</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">Eligible Amount</th>
                  <th className="pb-2.5 font-semibold">Commission</th>
                  <th className="pb-2.5 font-semibold">Referral Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-200/50">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 font-mono font-medium text-plum-800">
                      {r.orderNumber}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 font-medium text-plum-800">
                      {inrPaise(r.orderAmountPaise)}
                    </td>
                    <td className="py-3 font-semibold text-gold-700">
                      {inrPaise(r.commissionPaise)}
                    </td>
                    <td className="py-3">
                      <ReferralStatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination buttons */}
        <div className="mt-4 flex items-center justify-between border-t border-gold-200/60 pt-3 text-xs">
          <span className="text-ink-soft">Page {page + 1}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || referralsLoading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={referrals.length < take || referralsLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3.5 transition-all md:p-4",
        highlight
          ? "border-gold-400 bg-gold-100/60 shadow-xs"
          : "border-gold-200/80 bg-cream-50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        <Icon className={cn("size-3.5", highlight ? "text-gold-700" : "text-ink-soft")} />
      </div>
      <p
        className={cn(
          "mt-2 font-heading text-lg font-bold md:text-xl truncate",
          highlight ? "text-gold-800" : "text-plum-800",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[0.65rem] text-ink-soft truncate">{sub}</p>
    </div>
  );
}

function ReferralStatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REVERSED" }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-800">
        <CheckCircle2 className="size-3" /> Approved
      </span>
    );
  }
  if (status === "REVERSED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-rose-800">
        <AlertCircle className="size-3" /> Reversed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-amber-800">
      <Sparkles className="size-3" /> Pending
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 4. Redeem Tab: Balance, Request Form, and Payout History                  */
/* ────────────────────────────────────────────────────────────────────────── */

function RedeemTab({ profile }: { profile: CollaboratorProfile }) {
  const [stats, setStats] = useState<CollaboratorStats | null>(null);
  const [redeemHistory, setRedeemHistory] = useState<RedeemRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [amountRupees, setAmountRupees] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        api<CollaboratorStats>("GET", "/me/collaborator/stats"),
        api<RedeemRequestItem[]>("GET", "/me/collaborator/redeem"),
      ]);
      setStats(s);
      setRedeemHistory(Array.isArray(h) ? h : []);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Failed to load redeem details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const val = parseFloat(amountRupees);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const amountPaise = Math.round(val * 100);
    const minPaise = stats?.minRedeemPaise ?? 50000;
    const availablePaise = stats?.availableBalancePaise ?? 0;

    if (amountPaise < minPaise) {
      setError(`Minimum payout amount is ${inrPaise(minPaise)}.`);
      return;
    }

    if (amountPaise > availablePaise) {
      setError(`Amount exceeds your available balance of ${inrPaise(availablePaise)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api("POST", "/me/collaborator/redeem", { amountPaise });
      setSuccess(`Redemption request of ${inr(val)} submitted successfully.`);
      setAmountRupees("");
      await refresh();
    } catch (err) {
      setError((err as Error).message || "Failed to submit redemption request.");
    } finally {
      setSubmitting(false);
    }
  }

  const availablePaise = stats?.availableBalancePaise ?? 0;
  const minRedeemPaise = stats?.minRedeemPaise ?? 50000;
  const canRedeem = availablePaise >= minRedeemPaise;

  return (
    <div className="space-y-6">
      {/* Balance Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-gold-300 bg-gold-100/50 p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold-800">
            Available Balance
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-plum-800">
            {loading ? "..." : inrPaise(availablePaise)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Eligible for redemption now. Minimum withdrawal is {inrPaise(minRedeemPaise)}.
          </p>
        </div>

        <div className="rounded-md border border-gold-200/80 bg-cream-50 p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold-700">
            Lifetime Redeemed
          </p>
          <p className="mt-1 font-heading text-3xl font-bold text-plum-800">
            {loading ? "..." : inrPaise(stats?.approvedRedeemPaise ?? 0)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Pending review: {loading ? "..." : inrPaise(stats?.requestedRedeemPaise ?? 0)}
          </p>
        </div>
      </div>

      {/* Redeem Request Form */}
      <form onSubmit={handleRedeem} className={cardCls}>
        <h3 className="font-heading text-lg font-bold text-plum-800">Request Payout</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          Earnings are disbursed directly to your registered bank / UPI account within 3–5 business days.
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-5 max-w-md">
          <label className="block text-xs font-semibold text-plum-800 mb-1.5">
            Withdrawal Amount (in ₹)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-ink-soft">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min={minRedeemPaise / 100}
                max={availablePaise / 100}
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder={`${minRedeemPaise / 100}`}
                disabled={!canRedeem || submitting}
                className={cn(inputCls, "pl-7")}
              />
            </div>
            {canRedeem && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmountRupees(String(Math.floor(availablePaise / 100)))}
              >
                Max
              </Button>
            )}
          </div>
          <p className="mt-1 text-[0.7rem] text-ink-soft">
            Min: {inrPaise(minRedeemPaise)} · Max: {inrPaise(availablePaise)}
          </p>
        </div>

        <div className="mt-5">
          <Button type="submit" disabled={!canRedeem || submitting || !amountRupees}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
            Request Payout
          </Button>
          {!canRedeem && !loading && (
            <span className="ml-3 text-xs text-ink-soft">
              You need at least {inrPaise(minRedeemPaise)} available to request a payout.
            </span>
          )}
        </div>
      </form>

      {/* Payout Request History Table */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-plum-800">
              Payout History
            </h3>
            <p className="text-xs text-ink-soft">
              Past redemption requests and their current processing status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-gold-600" />
          </div>
        ) : redeemHistory.length === 0 ? (
          <div className="rounded-md border border-dashed border-gold-300/80 bg-cream-50/50 py-8 text-center">
            <History className="mx-auto size-7 text-gold-400" />
            <p className="mt-2 text-xs font-semibold text-plum-800">No payout requests yet</p>
            <p className="text-[0.7rem] text-ink-soft">
              Your requested redemptions will appear here with review updates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold-200 text-ink-soft uppercase tracking-wider text-[0.65rem]">
                  <th className="pb-2 font-semibold">Requested At</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-200/50">
                {redeemHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-2.5 text-ink-soft">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 font-bold text-plum-800">
                      {inrPaise(item.amountPaise)}
                    </td>
                    <td className="py-2.5">
                      <RedeemStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RedeemStatusBadge({ status }: { status: "REQUESTED" | "APPROVED" | "REJECTED" }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-800">
        <Check className="size-3" /> Processed
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-800">
        <AlertCircle className="size-3" /> Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
      <Sparkles className="size-3" /> Under Review
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Reusable Copy Button                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      className={className}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}
