import Form from "next/form";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product search box that goes to /search?q=… — a plain GET form, so it also
 * works before JavaScript loads. Used on the search and 404 pages.
 */
export default function SearchBox({ defaultValue, className }: { defaultValue?: string; className?: string }) {
  return (
    <Form
      action="/search"
      role="search"
      className={cn(
        "flex items-center gap-2 rounded-sm border border-gold-300/70 bg-cream-100 py-1 pl-4 pr-1 focus-within:border-gold-500",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
      <input
        // Keyed by the query so the box shows the new search after navigating.
        key={defaultValue}
        name="q"
        type="search"
        defaultValue={defaultValue}
        required
        maxLength={100}
        placeholder="Search lipsticks, serums, shades…"
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-plum-800 placeholder:text-ink-soft/70 focus:outline-none"
      />
      <button
        type="submit"
        className="label-caps rounded-sm bg-plum-800 px-4 py-2 text-[0.66rem] text-cream-50 hover:bg-plum-700"
      >
        Search
      </button>
    </Form>
  );
}
