import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * A photograph from public/ that may not have been supplied yet. Until the
 * file exists a soft placeholder holds its place, so dropping the file in with
 * the expected name is all it takes. Fills its (positioned) parent.
 */
export default function OptionalPhoto({
  src,
  alt,
  sizes,
  className = "",
  placeholderClassName = "bg-gradient-to-br from-[#f6e9dc] to-[#efdccb]",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  placeholderClassName?: string;
  priority?: boolean;
}) {
  const present = existsSync(path.join(process.cwd(), "public", src));
  return present ? (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
  ) : (
    <div className={`absolute inset-0 ${placeholderClassName}`} aria-hidden="true" />
  );
}
