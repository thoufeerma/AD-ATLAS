import type { Metadata } from "next";
import {
  ArrowRight,
  Brush,
  Camera,
  CircleCheck,
  Globe,
  Handshake,
  Heart,
  HeartHandshake,
  MessagesSquare,
  Palette,
  ShoppingBag,
  Sparkles,
  Star,
  Timer,
  UserRound,
  Users,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getHomeContent, getSettings } from "@/lib/api/server";
import OptionalPhoto from "@/components/ui/OptionalPhoto";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";
import ApplyDialog from "@/components/collabs/ApplyDialog";
import CollaboratorQuotes from "@/components/collabs/CollaboratorQuotes";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("collabs");
}

/*
 * Built from the 1024px-wide design: on xl screens sizes are in vw (design
 * px ÷ 10.24) so the page keeps the design's proportions at any width.
 */

const INK = "text-[#1d052b]";
const GOLD = "text-[#c8963c]";

/** Photographs; each shows a soft placeholder until its file is added. */
const PHOTOS = {
  hero: "/images/collabs hero.png",
  impact: "/images/collabs impact band.png",
  collage: "/images/collabs why collage.png",
  cta: "/images/collabs cta band.png",
};

const PERKS = [
  { Icon: Users, title: "Trusted by 10K+ Creators" },
  { Icon: ShoppingBag, title: "Premium Products", text: "Loved by millions" },
  { Icon: Handshake, title: "Long-term Partnerships", text: "Built on trust" },
  { Icon: Palette, title: "Creative Freedom", text: "We value your voice" },
  { Icon: UserRound, title: "Grow Together", text: "Inspire. Collaborate. Shine." },
];
/** The strip's columns as spaced in the design (desktop). */
const PERK_COLUMNS = "xl:grid-cols-[17.68vw_18.46vw_19.24vw_18.46vw_1fr]";

const WHO = [
  {
    Icon: Star,
    title: "Influencers",
    as: "Influencer",
    text: "Create impact. Reach millions.\nLet's build something beautiful\ntogether.",
    photo: "/images/collab influencers.png",
  },
  {
    Icon: Brush,
    title: "Makeup Artists",
    as: "Makeup Artist",
    text: "Your art deserves the best.\nPartner with Velastia and\nelevate every look.",
    photo: "/images/collab makeup artists.png",
  },
  {
    Icon: Camera,
    title: "Content Creators",
    as: "Content Creator",
    text: "From reels to stories,\nlet's create content that\ninspires and converts.",
    photo: "/images/collab content creators.png",
  },
  {
    Icon: Heart,
    title: "Brand Ambassadors",
    as: "Brand Ambassador",
    text: "Be the face of Velastia.\nRepresent luxury, confidence\nand elegance.",
    photo: "/images/collab brand ambassadors.png",
  },
  {
    Icon: Users,
    title: "Beauty Bloggers",
    as: "Beauty Blogger",
    text: "Honest reviews. Real opinions.\nLet's help the world discover\nVelastia.",
    photo: "/images/collab beauty bloggers.png",
  },
];

/** Marketing figures for the impact band. */
const IMPACT = [
  { Icon: Handshake, value: "500+", label: "Successful Collaborations" },
  { Icon: Users, value: "10K+", label: "Creators Empowered" },
  { Icon: Globe, value: "50M+", label: "Combined Reach" },
  { Icon: Heart, value: "98%", label: "Creators Love Working\nWith Us" },
  { Icon: Star, value: "4.9/5", label: "Average Creator Rating" },
];

const WHY = [
  "High-quality, science-backed products",
  "Creative freedom & genuine partnerships",
  "Early access to new launches",
  "Exclusive discounts & earnings",
  "Long-term growth opportunities",
  "A brand that truly values you",
];

const PROCESS = [
  { Icon: Sparkles, label: "Easy Collaboration\nProcess" },
  { Icon: Timer, label: "Fast Response\nTime" },
  { Icon: MessagesSquare, label: "Transparent\nCommunication" },
  { Icon: HeartHandshake, label: "Long-term\nPartnerships" },
];

export default async function CollabsPage() {
  const [{ collaborators }, settings] = await Promise.all([getHomeContent(), getSettings()]);
  const quoted = collaborators.filter((c): c is typeof c & { quote: string } => Boolean(c.quote?.trim()));
  const instagram = settings.store.social.instagram;

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative flex flex-col overflow-hidden xl:h-[28.32vw]">
        <div className="relative z-10 px-6 py-10 xl:p-0 xl:pt-[2.64vw] xl:pl-[5.86vw]">
          <h1 className={`relative w-fit font-display text-[1.9rem] font-medium uppercase leading-[1.15] xl:text-[2.78vw] xl:leading-[3.17vw] ${INK}`}>
            Be A Part Of
            <span className="block">
              The <span className={GOLD}>Velastia</span> Story
            </span>
            <ScriptHeart className={`absolute bottom-[0.3vw] left-full ml-[1.17vw] hidden h-[3.42vw] w-[4.93vw] xl:block ${GOLD}`} />
          </h1>
          <p className={`mt-2 font-script text-[1.6rem] leading-[1.3] xl:mt-[0.8vw] xl:text-[2.49vw] xl:leading-[1.2] ${INK}`}>
            Create. Inspire. Glow Together.
          </p>
          <p className={`mt-3 text-[0.95rem] leading-[1.6] xl:mt-[2.25vw] xl:text-[1.21vw] xl:leading-[1.88vw] ${INK}`}>
            At Velastia, we believe beauty is more powerful
            <span className="xl:block"> when we create it together. We partner with</span>
            <span className="xl:block"> influencers, makeup artists, creators and dreamers</span>
            <span className="xl:block"> who share our belief in luxury, science and self-love.</span>
          </p>
          <ApplyDialog className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#260b26] px-6 text-[0.8rem] font-semibold uppercase text-cream-50 transition-colors hover:bg-[#45174a] xl:mt-[1.32vw] xl:h-[2.98vw] xl:w-[16.21vw] xl:gap-[0.6vw] xl:px-0 xl:text-[1.07vw]">
            Let&apos;s Create Magic <Sparkles className="size-4 text-[#e2b84f] xl:size-[1.2vw]" strokeWidth={1.6} />
          </ApplyDialog>
        </div>
        <div className="relative h-[70vw] xl:absolute xl:inset-0 xl:h-auto">
          <OptionalPhoto
            src={PHOTOS.hero}
            alt="Three Velastia creators holding lipsticks"
            sizes="100vw"
            priority
            className="object-[75%_center] xl:object-center"
          />
        </div>
      </section>

      {/* Perks strip */}
      <ul className={`grid grid-cols-2 gap-x-4 gap-y-5 bg-[#29102b] px-6 py-6 text-cream-50 sm:grid-cols-3 xl:h-[6.25vw] xl:items-center xl:gap-0 xl:p-0 xl:pl-[5.27vw] ${PERK_COLUMNS}`}>
        {PERKS.map(({ Icon, title, text }, i) => (
          <li
            key={title}
            className={`relative flex items-center gap-2.5 xl:gap-[1.07vw] ${
              i > 0
                ? "xl:pl-[3.42vw] xl:before:absolute xl:before:top-1/2 xl:before:left-0 xl:before:h-[1.95vw] xl:before:w-px xl:before:-translate-y-1/2 xl:before:bg-[#c8963c]/40"
                : ""
            }`}
          >
            <Icon className="size-7 shrink-0 text-[#d9a53f] xl:size-[2.83vw]" strokeWidth={1.2} />
            <span>
              <span className={`block font-medium ${text ? "text-[0.78rem] xl:text-[0.98vw]" : "text-[0.78rem] xl:text-[0.95vw]"}`}>{title}</span>
              {text && <span className="mt-0.5 block text-[0.68rem] text-cream-50/80 xl:mt-[0.35vw] xl:text-[0.8vw]">{text}</span>}
            </span>
          </li>
        ))}
      </ul>

      {/* Who can collaborate */}
      <section className="px-4 pt-10 pb-8 text-center xl:px-0 xl:pt-[1.27vw] xl:pb-[1.37vw]">
        <p className="font-display text-[0.8rem] font-medium uppercase text-[#b07c2c] xl:text-[1.04vw]">Collaborate Your Way</p>
        <h2 className={`mt-1 font-display text-[1.5rem] font-medium uppercase leading-none xl:mt-[0.3vw] xl:text-[1.93vw] ${INK}`}>
          Who Can Collaborate?
        </h2>
        <Ornament className="mx-auto mt-3 w-40 xl:mt-[0.78vw] xl:w-[13.57vw]" />
        <ul className="mt-6 grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-3 xl:mx-auto xl:mt-[1.07vw] xl:w-[91.3vw] xl:grid-cols-5 xl:gap-[1.46vw]">
          {WHO.map(({ Icon, title, as, text, photo }) => (
            <li
              key={title}
              className="flex flex-col overflow-hidden rounded-md border border-[#efe5da] bg-gradient-to-b from-[#fbf3ec] to-[#fdf7f1] xl:h-[24.9vw]"
            >
              <div className="relative h-56 shrink-0 xl:h-[12.99vw]">
                <OptionalPhoto src={photo} alt={title} sizes="(min-width: 1280px) 17vw, 50vw" />
                <span className="absolute bottom-0 left-1/2 grid size-11 -translate-x-1/2 translate-y-1/2 place-items-center rounded-full border border-[#c8963c] bg-[#3a142c] xl:size-[3.49vw]">
                  <Icon className="size-5 text-[#d9a53f] xl:size-[1.66vw]" strokeWidth={1.4} />
                </span>
              </div>
              <h3 className={`mt-8 font-display text-[1rem] font-medium uppercase xl:mt-[2.69vw] xl:text-[1.21vw] xl:leading-[1.45vw] ${INK}`}>{title}</h3>
              <p className="mt-1.5 whitespace-pre-line text-[0.75rem] leading-[1.6] text-[#1d052b]/80 xl:mt-[0.54vw] xl:text-[0.9vw] xl:leading-[1.4vw]">
                {text}
              </p>
              <ApplyDialog
                applyingAs={as}
                className={`mx-auto mt-auto mb-4 inline-flex items-center gap-1.5 pt-3 text-[0.7rem] font-medium uppercase hover:text-[#a8762c] xl:mb-[1.07vw] xl:gap-[0.4vw] xl:pt-[0.98vw] xl:text-[0.84vw] ${INK}`}
              >
                Apply Now <ArrowRight className="size-3 xl:size-[0.9vw]" strokeWidth={1.8} />
              </ApplyDialog>
            </li>
          ))}
        </ul>
      </section>

      {/* Together, we create impact */}
      <section className="relative overflow-hidden bg-[#270e29] px-6 py-8 text-center text-cream-50 xl:h-[14.26vw] xl:p-0">
        <OptionalPhoto src={PHOTOS.impact} alt="" sizes="100vw" placeholderClassName="bg-[linear-gradient(100deg,#2a0f2c,#260d28_50%,#2e1330)]" />
        <h2 className="relative font-display text-[1.15rem] font-medium uppercase xl:pt-[1.27vw] xl:text-[1.55vw] xl:leading-none">
          Together, We Create Impact
        </h2>
        <ul className="relative mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-3 xl:mt-[0.98vw] xl:grid-cols-[repeat(5,18.98vw)] xl:gap-0 xl:pl-[1.82vw]">
          {IMPACT.map(({ Icon, value, label }, i) => (
            <li
              key={label}
              className={`relative flex flex-col items-center ${
                i > 0
                  ? "xl:before:absolute xl:before:top-[2.9vw] xl:before:left-0 xl:before:h-[5.47vw] xl:before:w-px xl:before:bg-[#c8963c]/35"
                  : ""
              }`}
            >
              <Icon className="size-8 text-[#d9a53f] xl:size-[2.73vw]" strokeWidth={1.1} />
              <p className="mt-2 font-display text-[1.6rem] font-medium leading-none xl:mt-[1.17vw] xl:text-[2.39vw]">{value}</p>
              <p className="mt-1.5 whitespace-pre-line text-[0.75rem] leading-[1.4] xl:mt-[0.34vw] xl:text-[1.06vw] xl:leading-[1.46vw]">{label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Why collaborate with Velastia */}
      <section className="relative flex flex-col gap-8 px-6 py-10 xl:block xl:h-[24.9vw] xl:p-0">
        <div className="relative z-10 xl:pt-[1.56vw] xl:pl-[5.93vw]">
          <h2 className={`font-display text-[1.5rem] font-medium uppercase leading-[1.15] xl:text-[2.03vw] xl:leading-[2.25vw] ${INK}`}>
            Why Collaborate
            <span className="block">With Velastia?</span>
          </h2>
          <Ornament className="mt-2 w-44 xl:mt-[0.68vw] xl:w-[16.24vw]" />
          <ul className="mt-3 space-y-2 xl:mt-[0.78vw] xl:space-y-0">
            {WHY.map((w) => (
              <li key={w} className={`flex items-center gap-2.5 text-[0.85rem] xl:h-[1.99vw] xl:gap-[1.04vw] xl:text-[0.99vw]`}>
                <CircleCheck className="size-4 shrink-0 text-[#c8963c] xl:size-[1.27vw]" strokeWidth={1.3} />
                <span className="text-[#1d052b]/85">{w}</span>
              </li>
            ))}
          </ul>
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#260b26] px-6 text-[0.8rem] font-semibold uppercase text-cream-50 transition-colors hover:bg-[#45174a] xl:mt-[0.98vw] xl:h-[2.64vw] xl:w-[16.5vw] xl:gap-[0.6vw] xl:px-0 xl:text-[0.99vw]"
            >
              Join Our Community <Heart className="size-4 fill-[#a77bd8] text-[#a77bd8] xl:size-[1.1vw]" />
            </a>
          )}
        </div>
        {/* Polaroid collage with the "Thank you for choosing Velastia" seal */}
        <div className="relative h-[60vw] xl:absolute xl:top-[0.98vw] xl:right-0 xl:h-[23.92vw] xl:w-[66.3vw]">
          <OptionalPhoto
            src={PHOTOS.collage}
            alt="Velastia creators' photos and videos with a thank-you seal"
            sizes="(min-width: 1280px) 66vw, 100vw"
            className="object-contain object-right"
            placeholderClassName="rounded-md bg-gradient-to-br from-[#f6e9dc] to-[#efdccb]"
          />
        </div>
      </section>

      {/* What our collaborators say */}
      {quoted.length > 0 && (
        <section className="relative pt-8 pb-10 text-center xl:pt-[0.8vw] xl:pb-[1.37vw]">
          <h2 className={`font-display text-[1.25rem] font-medium uppercase leading-none xl:text-[1.43vw] ${INK}`}>
            What Our Collaborators Say
          </h2>
          <Ornament className="mx-auto mt-2 w-36 xl:mt-[0.6vw] xl:w-[12.44vw]" />
          <div className="text-left">
            <CollaboratorQuotes people={quoted} />
          </div>
        </section>
      )}

      {/* Let's create something beautiful together */}
      <section className="relative overflow-hidden bg-[#220a22] px-6 py-10 text-cream-50 xl:h-[16.41vw] xl:p-0">
        <OptionalPhoto src={PHOTOS.cta} alt="" sizes="100vw" placeholderClassName="bg-[linear-gradient(100deg,#2a0e2a,#1e091c_55%,#2a0e2a)]" />
        <div className="relative xl:absolute xl:top-[2.2vw] xl:left-[5.22vw]">
          <h2 className="font-display text-[1.4rem] font-medium uppercase leading-[1.15] xl:text-[1.93vw]">
            Let&apos;s Create Something Beautiful Together
          </h2>
          <p className="mt-3 text-[0.85rem] leading-[1.6] xl:mt-[0.94vw] xl:text-[1.04vw] xl:leading-[1.59vw]">
            We are always looking for passionate, creative and inspiring individuals
            <span className="xl:block"> to join the Velastia family.</span>
          </p>
        </div>
        <ul className="relative mt-6 grid grid-cols-2 gap-y-4 text-center sm:grid-cols-4 xl:absolute xl:top-[10.21vw] xl:left-[1.7vw] xl:mt-0 xl:grid-cols-[repeat(4,10.74vw)] xl:gap-0">
          {PROCESS.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center">
              <Icon className="size-6 text-[#d9a53f] xl:size-[1.9vw]" strokeWidth={1.2} />
              <p className="mt-1 whitespace-pre-line text-[0.68rem] leading-[1.3] xl:mt-[0.54vw] xl:text-[0.86vw] xl:leading-[1.07vw]">{label}</p>
            </li>
          ))}
        </ul>
        <span className="absolute top-[2.7vw] left-[52.7vw] hidden h-[11.95vw] w-px bg-[#c8963c]/40 xl:block" aria-hidden="true" />
        <div className="relative mt-8 xl:absolute xl:top-[3.98vw] xl:left-[54.93vw] xl:mt-0">
          <h2 className="font-display text-[1.1rem] font-medium uppercase xl:text-[1.37vw] xl:leading-none">Ready To Collaborate?</h2>
          <p className="mt-2 text-[0.85rem] leading-[1.6] xl:mt-[0.78vw] xl:text-[1.05vw] xl:leading-[1.59vw]">
            Tell us about yourself and your creative work.
            <span className="block">Our team will get back to you!</span>
          </p>
          <ApplyDialog className="mt-5 inline-flex h-11 items-center gap-4 rounded-[4px] bg-[linear-gradient(90deg,#b8894c,#9a6c35)] pr-4 pl-6 text-[0.8rem] font-semibold uppercase text-cream-50 shadow-[0_0.2rem_0.6rem_rgba(0,0,0,0.3)] transition-opacity hover:opacity-90 xl:mt-[1.37vw] xl:h-[2.54vw] xl:w-[15.19vw] xl:justify-between xl:gap-0 xl:pr-[1.2vw] xl:pl-[1.46vw] xl:text-[0.95vw]">
            Apply For Collab
            <span className="flex items-center gap-3 border-l border-cream-50/40 pl-3 xl:gap-0 xl:pl-[1.07vw]">
              <ArrowRight className="size-4 xl:size-[1.27vw]" strokeWidth={1.5} />
            </span>
          </ApplyDialog>
        </div>
      </section>
    </div>
  );
}
