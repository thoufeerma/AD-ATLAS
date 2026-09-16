/**
 * Editorial content lifted from the reference designs — testimonials,
 * collaborators, ingredient cards, FAQs and the legal page copy.
 * This is the second thing the CMS will take over in phase 2.
 */

export type Testimonial = {
  name: string;
  avatar: string;
  rating: number;
  quote: string;
  verified?: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ananya S.",
    avatar: "/people/malvika.png",
    rating: 5,
    quote: "Velastia lipsticks are my new obsession! The color payoff is insane.",
    verified: true,
  },
  {
    name: "Kavya M.",
    avatar: "/people/sakshi.png",
    rating: 5,
    quote: "Beautiful packaging and such high quality. Totally worth it!",
    verified: true,
  },
  {
    name: "Tanya P.",
    avatar: "/people/komal.png",
    rating: 5,
    quote: "Perfect shades for Indian skin tones. Love the texture!",
    verified: true,
  },
  {
    name: "Mehak S.",
    avatar: "/people/sejal.png",
    rating: 5,
    quote: "My everyday go-to brand now. Highly recommended!",
    verified: true,
  },
];

export const LONG_TESTIMONIALS: Testimonial[] = [
  {
    name: "Priya S.",
    avatar: "/people/malvika.png",
    rating: 5,
    quote: "The texture is so smooth and the color payoff is just amazing!",
  },
  {
    name: "Neha R.",
    avatar: "/people/sakshi.png",
    rating: 5,
    quote: "Finally a luxury brand that understands Indian skin tones.",
  },
  {
    name: "Aisha K.",
    avatar: "/people/komal.png",
    rating: 5,
    quote: "My go-to lipstick for every occasion. Absolutely in love!",
  },
  {
    name: "Radhri M.",
    avatar: "/people/sejal.png",
    rating: 5,
    quote: "Beautiful packaging and even better products!",
  },
  {
    name: "Simran D.",
    avatar: "/people/rishabh.png",
    rating: 5,
    quote: "Velastia never disappoints. Highly recommended!",
  },
];

/** Rating breakdown from the "Loved by Thousands" panel. */
export const RATING_SUMMARY = {
  average: 4.9,
  total: 2450,
  breakdown: [
    { stars: 5, pct: 92 },
    { stars: 4, pct: 6 },
    { stars: 3, pct: 1 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ],
};

export type Collaborator = { name: string; role: string; avatar: string };

export const COLLABORATORS: Collaborator[] = [
  { name: "Malvika Sitlani", role: "Beauty Creator", avatar: "/people/malvika.png" },
  { name: "Sakshi Gupta", role: "Makeup Artist", avatar: "/people/sakshi.png" },
  { name: "Komal Pandey", role: "Fashion Influencer", avatar: "/people/komal.png" },
  { name: "Sejal Kumar", role: "Skincare Expert", avatar: "/people/sejal.png" },
  { name: "Rishabh Arora", role: "Makeup Artist", avatar: "/people/rishabh.png" },
];

export const INSTAGRAM = [1, 2, 3, 4, 5, 6].map((n) => `/social/ig-${n}.png`);

export type Ingredient = { name: string; benefit: string };

export const INGREDIENTS: Ingredient[] = [
  { name: "Vitamin E", benefit: "Protects & nourishes lips" },
  { name: "Jojoba Oil", benefit: "Moisturizes & prevents dryness" },
  { name: "Shea Butter", benefit: "Softens & smoothens lips" },
  { name: "Hyaluronic Complex", benefit: "Locks in moisture" },
  { name: "Plant Wax Blend", benefit: "Provides rich color & long wear" },
  { name: "Sunflower Oil", benefit: "Adds comfort & care" },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Are Velastia products cruelty free?",
    a: "Yes. Every Velastia product is cruelty free and vegan. We never test on animals, and neither do our suppliers.",
  },
  {
    q: "Are the products suitable for Indian skin tones?",
    a: "They are designed for them. Every shade is developed and tested on Indian skin tones so the colour reads true rather than ashy or washed out.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard shipping arrives in 3 to 5 business days, and is free on orders above ₹999. Metro cities are usually faster.",
  },
  {
    q: "What is your return policy?",
    a: "Unopened products can be returned within 7 days of delivery. Once we receive the item, refunds are processed to the original payment method within 5 to 7 business days.",
  },
  {
    q: "Are the products dermatologically tested?",
    a: "Yes. Every formula is dermatologically tested and free from parabens and harmful chemicals.",
  },
  {
    q: "How do I track my order?",
    a: "You will receive an email and SMS with a tracking link once your order ships. You can also track it any time from the Track Order page.",
  },
];
