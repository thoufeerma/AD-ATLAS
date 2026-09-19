import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The official Velastia logo (gold monogram + wordmark), generated from the
 * brand's logo.png into public/brand/. `tone="light"` swaps the purple
 * wordmark for cream, for dark backgrounds.
 *
 * width/height are the largest size it's shown at (52px tall), so the browser
 * downloads a small image; the class scales it down on phones.
 */
export default function Logo({
  className,
  tone = "dark",
  priority = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  priority?: boolean;
}) {
  return (
    <Link href="/" className={cn("block shrink-0", className)}>
      <Image
        src={tone === "light" ? "/brand/logo-light.png" : "/brand/logo.png"}
        alt="Velastia"
        width={154}
        height={52}
        priority={priority}
        className="h-10 w-auto sm:h-[52px]"
      />
    </Link>
  );
}
