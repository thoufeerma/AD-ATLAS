import Card from "@/components/ui/Card";

/** Shown instead of a chart while the store has nothing to plot yet. */
export default function NoData({ title, note }: { title: string; note: string }) {
  return (
    <Card title={title}>
      <p className="py-10 text-center text-[0.8rem] text-ink-2">{note}</p>
    </Card>
  );
}
