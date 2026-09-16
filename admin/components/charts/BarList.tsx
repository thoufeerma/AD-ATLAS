/**
 * Horizontal magnitude bars — one series, one colour (never a value-ramp across
 * nominal categories). Data-ends are 4px-rounded and anchored to the baseline,
 * and every value is direct-labelled.
 */
export default function BarList({
  rows,
  color = "var(--color-series-1)",
  format = (n: number) => `${n}%`,
}: {
  rows: { label: string; pct: number }[];
  color?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.pct));

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.75rem] items-center gap-3">
          <span className="truncate text-[0.75rem] text-ink-2">{r.label}</span>
          <span className="h-2 rounded-full bg-plane">
            <span
              className="block h-full rounded-r-[4px] rounded-l-full"
              style={{ width: `${(r.pct / max) * 100}%`, backgroundColor: color }}
            />
          </span>
          <span className="tnum text-right text-[0.75rem] font-medium text-ink">
            {format(r.pct)}
          </span>
        </li>
      ))}
    </ul>
  );
}
