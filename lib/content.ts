/**
 * Brand content that isn't managed in the admin yet: the lip-care ingredient
 * cards and the Instagram tiles (images in /public/social).
 *
 * Products, reviews, testimonials, collaborators, FAQs, offers and banners all
 * come from the Velastia API — see lib/api/server.ts.
 */

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
