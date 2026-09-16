"use client";

import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { FAQS } from "@/lib/mock";

export default function FaqsPage() {
  const groups = [...new Set(FAQS.map((f) => f.category))];

  return (
    <>
      <PageHeader
        title="FAQs"
        subtitle={`${FAQS.length} questions across ${groups.length} categories · drag to reorder`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> Add Question
          </Button>
        }
      />

      <div className="space-y-5">
        {groups.map((g) => (
          <Card key={g} title={g} bodyClassName="p-0">
            <ul className="divide-y divide-hairline">
              {FAQS.filter((f) => f.category === g).map((f) => (
                <li key={f.id} className="flex items-center gap-3 px-5 py-4">
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted" />
                  <p className="min-w-0 flex-1 text-[0.84rem] text-ink">{f.question}</p>
                  <Badge tone={f.published ? "good" : "neutral"} dot={false}>
                    {f.published ? "Published" : "Hidden"}
                  </Badge>
                  <Toggle defaultOn={f.published} label={`Publish: ${f.question}`} />
                  <button
                    aria-label={`Edit: ${f.question}`}
                    className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Delete: ${f.question}`}
                    className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
