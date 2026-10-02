import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The official Velastia logo (gold monogram + wordmark), generated from the
 * brand's logo.png into public/brand/. `tone="light"` swaps the purple
 * wordmark for cream, for dark backgrounds.
 *
 * width/height are about twice the largest size it's shown at, so the browser
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
      {tone === "light" ? (
        <Image
          src="/brand/logo-light.png"
          alt="Velastia"
          width={300}
          height={100}
          priority={priority}
          className="w-32 h-auto sm:w-[220px]"
        />
      ) : (
        // The wordmark cropped tight (from public/images/nav logo.png, which
        // has wide transparent margins), so the link is only as big as the
        // visible logo.
        <Image
          src="/brand/nav-logo.png"
          alt="Velastia"
          width={404}
          height={41}
          priority={priority}
          className="w-[117px] h-auto sm:w-[202px]"
        />
      )}
    </Link>
  );
}
