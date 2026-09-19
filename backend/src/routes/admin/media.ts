import express, { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { cleanFilename, MAX_UPLOAD_BYTES, processImage, removeImage, storeImage } from "../../lib/media.js";

/**
 * The Media Library: images uploaded for products, banners, testimonials and
 * collaborators. Content managers and super admins.
 */
export const adminMediaRouter = Router();
adminMediaRouter.use(allow(...ROLES.content));

/** Where each image URL is used, so nobody deletes one that's on the site. */
async function usage(urls: string[]) {
  const where = { in: urls };
  const [images, banners, testimonials, collaborators] = await Promise.all([
    prisma.productImage.findMany({ where: { url: where }, select: { url: true, product: { select: { name: true } } } }),
    prisma.banner.findMany({ where: { imageUrl: where }, select: { imageUrl: true, name: true } }),
    prisma.testimonial.findMany({ where: { avatarUrl: where }, select: { avatarUrl: true, author: true } }),
    prisma.collaborator.findMany({ where: { avatarUrl: where }, select: { avatarUrl: true, name: true } }),
  ]);
  const used = new Map<string, string[]>();
  const add = (url: string | null, label: string) => {
    if (!url) return;
    used.set(url, [...(used.get(url) ?? []), label]);
  };
  images.forEach((i) => add(i.url, `Product: ${i.product.name}`));
  banners.forEach((b) => add(b.imageUrl, `Banner: ${b.name}`));
  testimonials.forEach((t) => add(t.avatarUrl, `Testimonial: ${t.author}`));
  collaborators.forEach((c) => add(c.avatarUrl, `Collaborator: ${c.name}`));
  return used;
}

const ListQuery = z.object({ q: z.string().trim().max(100).optional() });

adminMediaRouter.get("/", async (req, res) => {
  const { q } = parse(ListQuery, req.query);
  const assets = await prisma.mediaAsset.findMany({
    where: q
      ? { OR: [{ filename: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] }
      : {},
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const used = await usage(assets.map((a) => a.url));
  res.json({ data: assets.map((a) => ({ ...a, usedIn: used.get(a.url) ?? [] })) });
});

/**
 * Upload one image as the raw request body (Content-Type: the image's type),
 * with its original name in the X-File-Name header (URI-encoded).
 */
adminMediaRouter.post(
  "/",
  express.raw({ type: () => true, limit: MAX_UPLOAD_BYTES }),
  async (req, res) => {
    const body = req.body as unknown;
    if (!Buffer.isBuffer(body) || body.length === 0) throw badRequest("Choose an image to upload");

    const image = await processImage(body);
    const filename = cleanFilename(req.header("x-file-name"));
    const { storageKey, url } = await storeImage(image.data);
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        storageKey,
        // A reasonable starting alt text: the file's name, tidied up.
        alt: filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || null,
        mimeType: image.mimeType,
        sizeBytes: image.sizeBytes,
        width: image.width,
        height: image.height,
      },
    });
    await logActivity(req, `Uploaded image ${filename}`, "MediaAsset", asset.id);
    res.status(201).json({ data: { ...asset, usedIn: [] } });
  },
);

adminMediaRouter.patch("/:id", async (req, res) => {
  const { alt } = parse(z.object({ alt: z.string().trim().max(200).nullable() }), req.body);
  const id = param(req, "id");
  const found = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Image");
  const asset = await prisma.mediaAsset.update({ where: { id }, data: { alt: alt || null } });
  const used = await usage([asset.url]);
  res.json({ data: { ...asset, usedIn: used.get(asset.url) ?? [] } });
});

adminMediaRouter.delete("/:id", async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: param(req, "id") } });
  if (!asset) throw notFound("Image");
  const usedIn = (await usage([asset.url])).get(asset.url) ?? [];
  if (usedIn.length) {
    throw conflict(`This image is still used — remove it from ${usedIn.join("; ")} first`, { usedIn });
  }
  await prisma.mediaAsset.delete({ where: { id: asset.id } });
  await removeImage(asset.storageKey);
  await logActivity(req, `Deleted image ${asset.filename}`, "MediaAsset", asset.id);
  res.status(204).end();
});
