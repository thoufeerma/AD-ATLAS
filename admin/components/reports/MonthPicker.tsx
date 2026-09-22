"use client";

import { useRouter } from "next/navigation";
import { monthLong } from "@/lib/utils";

/** Switches a report to another month through the `?month=` query. */
export default function MonthPicker({ month, months }: { month: string; months: string[] }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-[0.74rem] text-ink-2">
      <span className="sr-only">Month</span>
      <select
        value={month}
        onChange={(e) => router.push(`?month=${e.target.value}`)}
        className="rounded-lg border border-hairline bg-card px-3 py-2 text-[0.78rem] text-ink focus:border-series-1 focus:outline-none"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {monthLong(m)}
          </option>
        ))}
      </select>
    </label>
  );
}
