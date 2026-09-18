import Image from "next/image";
import { cn } from "@/lib/utils";

/** A person's photo, or their initials when the admin hasn't added one. */
export default function Avatar({
  src,
  name,
  size,
  className,
}: {
  src: string | null;
  name: string;
  size: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-blush-100 font-medium text-plum-800",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
    >
      {initials}
    </span>
  );
}
