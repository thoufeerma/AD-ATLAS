/**
 * Brand content that isn't managed in the admin yet: the lip-care ingredient
 * cards and the Instagram tiles (images in /public/social).
 *
 * Products, reviews, testimonials, collaborators, FAQs, offers and banners all
 * come from the Velastia API — see lib/api/server.ts.
 */

export const INSTAGRAM = [
  "/images/Blush Pink Cosmos Still Life.png",
  "/images/Our promise to you about us.png",
  "/images/beauty with integrity.png",
  "/images/happpy customer.png",
  "/images/our story image.png",
  "/images/note from founder.png"
];

export type Ingredient = { name: string; benefit: string };

export const INGREDIENTS: Ingredient[] = [
  { name: "Vitamin E", benefit: "Protects & nourishes lips" },
  { name: "Jojoba Oil", benefit: "Moisturizes & prevents dryness" },
  { name: "Shea Butter", benefit: "Softens & smoothens lips" },
  { name: "Hyaluronic Complex", benefit: "Locks in moisture" },
  { name: "Plant Wax Blend", benefit: "Provides rich color & long wear" },
  { name: "Sunflower Oil", benefit: "Adds comfort & care" },
];
