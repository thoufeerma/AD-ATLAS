import type { Metadata } from "next";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  BadgeCheck,
  HandHeart,
  Heart,
  MessageCircleHeart,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getProducts, getRatingSummary, getReviews } from "@/lib/api/server";
import OptionalPhoto from "@/components/ui/OptionalPhoto";
import { ScriptHeart } from "@/components/ui/Ornament";
import ReviewsBrowser from "@/components/reviews/ReviewsBrowser";
import MediaStrip from "@/components/reviews/MediaStrip";
import WriteReviewDialog from "@/components/reviews/WriteReviewDialog";
import type { MediaItem } from "@/components/reviews/Lightbox";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("reviews");
}

/*
 * Built from the 1024px-wide design: on xl screens sizes are in vw (design
 * px ÷ 10.24) so the page keeps the design's proportions at any width.
 */

const INK = "text-[#1d052b]";
const GOLD = "text-[#c8963c]";

const PHOTOS = {
  hero: "/images/reviews hero.png",
  band: "/images/your trust our biggest reward banner.png",
};

/**
 * Photos and videos for "Customer Photos & Videos" can be dropped into this
 * folder (shown in file-name order), alongside those attached to reviews.
 */
const MEDIA_DIR = "/images/customer-media";

/** Marketing figures for the stats band; the rest of the band is computed. */
const HAPPY_CUSTOMERS = "10K+";
const PRODUCTS_LOVED = "50K+";

const PROMISES = [
  { Icon: Shield, title: "100% Genuine Reviews", text: "No fake reviews. Ever." },
  { Icon: BadgeCheck, title: "Verified Buyers", text: "Only from real customers." },
  { Icon: Heart, title: "Honest Feedback", text: "Because your trust matters." },
];

const COMMITMENTS = [
  { Icon: MessageCircleHeart, title: "We Listen", text: "to your feedback" },
  { Icon: TrendingUp, title: "We Improve", text: "every single day" },
  { Icon: HandHeart, title: "We Promise", text: "the best for you" },
];

function folderMedia(): MediaItem[] {
  const dir = path.join(process.cwd(), "public", MEDIA_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif|gif|mp4|webm|mov)$/i.test(f))
    .sort()
    .map((f) => ({
      src: `${MEDIA_DIR}/${encodeURIComponent(f)}`,
      kind: /\.(mp4|webm|mov)$/i.test(f) ? "video" : "image",
    }));
}

function Stars({ value, className }: { value: number; className: string }) {
  return (
    <span className={`flex text-[#d4a038] ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-4 xl:size-[1.27vw] ${n <= Math.round(value) ? "fill-current" : "text-white/25"}`}
          strokeWidth={n <= Math.round(value) ? 0 : 1.5}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const [rating, rawReviews, products] = await Promise.all([getRatingSummary(), getReviews(), getProducts()]);
  // Tolerate an API from before review titles, photos and categories existed
  // (the storefront and the API deploy separately).
  const reviews = rawReviews.map((r) => ({ ...r, title: r.title ?? null, images: r.images ?? [] }));
  const reviewable = products.filter((p) => p.status === "ACTIVE").map((p) => ({ slug: p.slug, name: p.name }));

  const media: MediaItem[] = [
    ...folderMedia(),
    ...reviews.flatMap((r) =>
      r.images.map((src) => ({ src, kind: "image" as const, caption: `${r.authorName} · ${r.product.name}` })),
    ),
  ];
  const recommend = rating.total
    ? Math.round(((rating.breakdown.find((b) => b.stars === 5)?.count ?? 0) + (rating.breakdown.find((b) => b.stars === 4)?.count ?? 0)) / rating.total * 100)
    : 0;
  const average = rating.total ? rating.average.toFixed(1) : "–";

  const STATS = [
    { Icon: Users, value: HAPPY_CUSTOMERS, label: "Happy Customers" },
    { Icon: Heart, value: `${recommend}%`, label: "Would Recommend\nVelastia" },
    { Icon: ShoppingBag, value: PRODUCTS_LOVED, label: "Products Loved" },
    { Icon: Star, value: average, label: "Average Rating" },
  ];

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative flex flex-col overflow-hidden xl:h-[32.23vw]">
        <div className="relative z-10 px-6 py-10 xl:p-0 xl:pt-[3.8vw] xl:pl-[5.22vw]">
          <h1 className={`relative w-fit font-display text-[2rem] font-medium uppercase leading-[1.15] xl:text-[3.52vw] xl:leading-[4.2vw] ${INK}`}>
            Reviews That
            <span className="block">
              Speak From The <span className={GOLD}>Heart</span>
            </span>
            <ScriptHeart className={`absolute -top-1 left-full ml-2 hidden h-10 w-8 -scale-x-100 xl:block xl:top-[1.97vw] xl:ml-[1.1vw] xl:h-[3.71vw] xl:w-[2.93vw] ${GOLD}`} />
          </h1>
          <p className={`mt-4 text-[1rem] leading-[1.5] xl:mt-[2.3vw] xl:text-[1.465vw] xl:leading-[2.25vw] ${INK}`}>
            Real women. Real results. Real confidence.
            <span className="block">Thank you for making Velastia a part of your beauty journey.</span>
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3 xl:mt-[2.6vw] xl:-ml-[0.15vw] xl:grid-cols-[15.43vw_15.38vw_auto] xl:gap-0">
            {PROMISES.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-center gap-2.5 xl:gap-[0.73vw]">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#d9b98a] bg-cream-50/60 xl:size-[3.71vw]">
                  <Icon className={`size-5 xl:size-[1.76vw] ${GOLD}`} strokeWidth={1.3} />
                </span>
                <span>
                  <span className={`block text-[0.78rem] font-medium xl:text-[0.9vw] ${INK}`}>{title}</span>
                  <span className="mt-0.5 block text-[0.7rem] text-[#1d052b]/65 xl:mt-[0.3vw] xl:text-[0.81vw]">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative h-[60vw] xl:absolute xl:inset-0 xl:h-auto">
          <OptionalPhoto
            src={PHOTOS.hero}
            alt="Velastia lipstick, serum and cream on a marble stand with pink flowers"
            sizes="100vw"
            priority
            className="object-[75%_center] xl:object-center"
          />
        </div>
      </section>

      {/* Ratings and stats */}
      <section className="grid grid-cols-2 gap-x-4 xl:gap-x-0 bg-[linear-gradient(100deg,#2a0f2c,#2c102d_50%,#2e1330)] px-6 py-8 text-cream-50 xl:h-[14.45vw] xl:grid-cols-[16.55vw_25.1vw_13.43vw_14.55vw_12.55vw_12.21vw] xl:items-start xl:p-0 xl:pl-[1.07vw]">
        <div className="col-span-2 text-center xl:col-span-1 xl:pt-[2.54vw]">
          <p className="text-[0.78rem] font-medium uppercase xl:text-[1.13vw]">Overall Rating</p>
          <p className="mt-1 font-display text-[2.4rem] font-medium leading-none xl:mt-[0.6vw] xl:text-[3.13vw]">
            {average}
            <span className="text-[0.6em]">/5</span>
          </p>
          <Stars value={rating.average} className="mt-2 justify-center gap-1 xl:mt-[0.6vw] xl:gap-[0.63vw]" />
          <p className="mt-2 text-[0.72rem] xl:mt-[1vw] xl:text-[0.99vw]">
            Based on {rating.total.toLocaleString("en-IN")} {rating.total === 1 ? "review" : "reviews"}
          </p>
        </div>

        <ul className="col-span-2 mx-auto mt-6 w-full max-w-xs space-y-1.5 xl:col-span-1 xl:w-auto xl:relative xl:mx-0 xl:mt-0 xl:max-w-none xl:pt-[2.27vw] xl:space-y-0 xl:pl-[2.59vw] xl:before:absolute xl:before:top-[3.03vw] xl:before:left-0 xl:before:h-[8.69vw] xl:before:w-px xl:before:bg-white/15">
          {rating.breakdown.map((b) => (
            <li key={b.stars} className="flex items-center text-[0.72rem] xl:h-[2vw] xl:w-[19.82vw] xl:text-[1.03vw]">
              <span className="w-3 xl:w-[0.8vw]">{b.stars}</span>
              <Star className="ml-1 size-3 fill-[#d4a038] text-[#d4a038] xl:ml-[0.4vw] xl:size-[0.88vw]" strokeWidth={0} />
              <span className="mx-3 h-[3px] flex-1 overflow-hidden rounded-full bg-white/15 xl:mr-[2.93vw] xl:ml-[1.1vw] xl:h-[0.29vw]">
                <span className="block h-full rounded-full bg-[#d4a038]" style={{ width: `${b.pct}%` }} />
              </span>
              <span className="w-8 text-right xl:w-auto">{b.pct}%</span>
            </li>
          ))}
        </ul>

        {STATS.map(({ Icon, value, label }) => (
          <div
            key={label}
            className="relative mt-6 flex flex-col items-center text-center xl:mt-0 xl:pt-[2.83vw] xl:before:absolute xl:before:top-[3.03vw] xl:before:left-0 xl:before:h-[8.69vw] xl:before:w-px xl:before:bg-white/15"
          >
            <Icon className="size-8 text-[#d4a038] xl:size-[3.13vw]" strokeWidth={1.1} />
            <p className="mt-2 font-display text-[1.5rem] font-medium leading-none xl:mt-[1.2vw] xl:text-[1.98vw]">{value}</p>
            <p className="mt-1.5 whitespace-pre-line text-[0.75rem] leading-[1.35] xl:mt-[0.5vw] xl:text-[1.09vw] xl:leading-[1.7vw]">{label}</p>
          </div>
        ))}
      </section>

      {/* Tabs, filters, customer media and the reviews */}
      <div className="px-4 pt-6 pb-8 xl:mx-auto xl:w-[88.57vw] xl:px-0 xl:pt-[2.29vw] xl:pb-[1.53vw]">
        <ReviewsBrowser
          reviews={reviews}
          total={rating.total}
          categories={rating.categories ?? []}
          media={media.length > 0 ? <MediaStrip items={media} /> : null}
        />
      </div>

      {/* Your trust, our biggest reward */}
      <section className="relative overflow-hidden bg-[#240b25] px-6 py-10 text-cream-50 xl:h-[13.38vw] xl:p-0">
        <OptionalPhoto
          src={PHOTOS.band}
          alt=""
          sizes="100vw"
          placeholderClassName="bg-[linear-gradient(100deg,#2a0e2a,#1e091c_45%,#2a0e2a_70%,#1a0719)]"
        />
        <div className="relative xl:absolute xl:top-[1.6vw] xl:left-[5.55vw]">
          <h2 className="relative w-fit font-display text-[1.6rem] font-medium uppercase leading-[1.15] xl:text-[2.09vw] xl:leading-[2.44vw]">
            Your Trust,
            <span className="block">Our Biggest Reward</span>
            <ScriptHeart className={`absolute bottom-0 left-full ml-2 hidden h-9 w-8 -scale-x-100 xl:block xl:ml-[1.1vw] xl:h-[3.6vw] xl:w-[3.26vw] ${GOLD}`} />
          </h2>
          <p className="mt-3 text-[0.9rem] leading-[1.6] xl:mt-[0.85vw] xl:text-[1.26vw] xl:leading-[2vw]">
            Every review motivates us to create better,
            <span className="block">safer and more luxurious beauty for you.</span>
          </p>
        </div>
        <ul className="relative mt-8 grid grid-cols-3 xl:absolute xl:top-[2.86vw] xl:left-[36.18vw] xl:mt-0 xl:grid-cols-[repeat(3,13.82vw)]">
          {COMMITMENTS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <span className="grid size-11 place-items-center rounded-full border border-[#c8963c]/80 xl:size-[4vw]">
                <Icon className="size-5 text-[#d9a53f] xl:size-[1.95vw]" strokeWidth={1.3} />
              </span>
              <p className="mt-2 font-display text-[0.85rem] font-semibold uppercase text-[#d9a53f] xl:mt-[0.75vw] xl:text-[1.21vw]">{title}</p>
              <p className="mt-0.5 text-[0.7rem] xl:mt-[0.45vw] xl:text-[1vw]">{text}</p>
            </li>
          ))}
        </ul>
        {/* "Thank you for choosing Velastia" medallion */}
        <div className="relative mx-auto mt-8 size-32 xl:absolute xl:top-[0.81vw] xl:left-[82.13vw] xl:mt-0 xl:size-[12.3vw]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full drop-shadow-[0_0.3rem_0.6rem_rgba(0,0,0,0.45)]" aria-hidden="true">
            <defs>
              <radialGradient id="medal" cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#f3cf7a" />
                <stop offset="0.55" stopColor="#c8902f" />
                <stop offset="1" stopColor="#8a5a17" />
              </radialGradient>
            </defs>
            <path
              d={Array.from({ length: 48 }, (_, i) => {
                const a = (i / 48) * Math.PI * 2;
                const r = i % 2 === 0 ? 50 : 46.5;
                return `${i === 0 ? "M" : "L"}${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
              }).join(" ") + "Z"}
              fill="url(#medal)"
            />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#7a4d12" strokeOpacity="0.35" strokeWidth="0.8" />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center font-display font-semibold uppercase leading-[1.15] text-[#4a2a10]">
            <div>
              <p className="text-[0.75rem] xl:text-[1.37vw]">Thank You</p>
              <p className="text-[0.55rem] xl:text-[1.03vw]">For Choosing</p>
              <p className="text-[1rem] xl:text-[1.86vw]">Velastia</p>
              <Heart className="mx-auto mt-1 size-3.5 xl:mt-[0.4vw] xl:size-[1.56vw]" strokeWidth={1.3} />
            </div>
          </div>
        </div>
      </section>

      {/* Write a review */}
      <section className="flex flex-col items-center justify-center gap-4 px-6 py-6 text-center xl:h-[4.98vw] xl:flex-row xl:gap-[3.91vw] xl:p-0">
        <p className={`text-[0.9rem] xl:text-[1.24vw] ${INK}`}>
          Have more to share?&nbsp; Your experience can help another beauty find her perfect match.
        </p>
        <WriteReviewDialog products={reviewable} className="h-10 px-6 xl:h-[2.93vw] xl:w-[17.63vw] xl:px-0 xl:text-[1.06vw]" />
      </section>
    </div>
  );
}
