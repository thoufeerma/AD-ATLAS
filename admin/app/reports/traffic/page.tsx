import { Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import Donut from "@/components/charts/Donut";
import BarList from "@/components/charts/BarList";
import LinePlot from "@/components/charts/LinePlot";
import { TRAFFIC_SOURCES, TOP_LOCATIONS, STORE_ANALYTICS, MONTHS } from "@/lib/mock";
import { num } from "@/lib/utils";

export const metadata = { title: "Traffic Analytics" };

const RAMP = [
  "var(--color-ramp-1)",
  "var(--color-ramp-2)",
  "var(--color-ramp-3)",
  "var(--color-ramp-4)",
];

const VISITORS = [
  2_840, 3_120, 2_980, 3_640, 3_410, 4_180,
  3_920, 4_560, 4_280, 5_120, 4_840, 5_690,
];

export default function TrafficReportPage() {
  return (
    <>
      <PageHeader
        title="Traffic Analytics"
        subtitle="Where visitors come from and how they convert"
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export Report
          </Button>
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STORE_ANALYTICS.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            series={s.series}
            slot={((i % 3) + 1) as 1 | 2 | 3}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartFrame
          title="Visitors by Month"
          className="lg:col-span-2"
          table={{
            columns: ["Month", "Visitors"],
            rows: MONTHS.map((m, i) => [m, num(VISITORS[i])]),
          }}
        >
          <LinePlot
            labels={MONTHS}
            data={VISITORS}
            color="var(--color-series-1)"
            name="Visitors"
            formatAs="count"
            height={230}
          />
        </ChartFrame>

        <ChartFrame
          title="Traffic Sources"
          subtitle="Ordered by share, so a single-hue ramp carries the ranking"
          table={{
            columns: ["Source", "Share"],
            rows: TRAFFIC_SOURCES.map((t) => [t.label, `${t.pct}%`]),
          }}
        >
          <Donut
            size={168}
            thickness={26}
            centreValue="100%"
            centreLabel="of sessions"
            slices={TRAFFIC_SOURCES.map((t, i) => ({
              label: t.label,
              value: t.pct,
              pct: t.pct,
              color: RAMP[i],
            }))}
          />
        </ChartFrame>

        <ChartFrame
          title="Top Locations"
          table={{
            columns: ["Country", "Share"],
            rows: TOP_LOCATIONS.map((l) => [l.label, `${l.pct}%`]),
          }}
        >
          <BarList rows={TOP_LOCATIONS} />
        </ChartFrame>
      </div>
    </>
  );
}
