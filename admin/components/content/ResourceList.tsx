"use client";

import { Fragment, useState } from "react";
import Card from "@/components/ui/Card";
import LiveToggle from "@/components/ui/LiveToggle";
import ResourceForm, { type FieldSpec } from "./ResourceForm";
import RowActions from "./RowActions";

type Row = { id: string } & Record<string, unknown>;

/**
 * List + create layout shared by the simple CMS resources (FAQs, testimonials,
 * banners, offers). Each row has a live on/off switch, inline edit, and a
 * confirmed delete; the create form sits alongside.
 */
export default function ResourceList<T extends Row>({
  items,
  fields,
  basePath,
  toggle,
  title,
  subtitle,
  meta,
  groupBy,
  listTitle,
  createTitle,
  emptyText,
}: {
  items: T[];
  fields: FieldSpec[];
  basePath: string;
  toggle: { field: keyof T & string; label: string };
  title: (item: T) => string;
  subtitle?: (item: T) => React.ReactNode;
  meta?: (item: T) => React.ReactNode;
  groupBy?: (item: T) => string;
  listTitle: string;
  createTitle: string;
  emptyText: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  const groups = groupBy
    ? [...new Set(items.map(groupBy))].map((g) => ({ name: g, rows: items.filter((i) => groupBy(i) === g) }))
    : [{ name: "", rows: items }];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <Card title={listTitle} bodyClassName="p-0">
        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-[0.8rem] text-ink-2">{emptyText}</p>
        ) : (
          groups.map((g) => (
            <Fragment key={g.name || "all"}>
              {g.name && (
                <p className="border-b border-hairline bg-plane px-5 py-2 text-[0.66rem] font-semibold uppercase tracking-wider text-muted">
                  {g.name}
                </p>
              )}
              <ul className="divide-y divide-hairline">
                {g.rows.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    {editing === item.id ? (
                      <ResourceForm
                        fields={fields}
                        method="PATCH"
                        path={`${basePath}/${item.id}`}
                        initial={item}
                        submitLabel="Save Changes"
                        onDone={() => setEditing(null)}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.85rem] font-medium text-ink">{title(item)}</p>
                          {subtitle && <div className="mt-0.5 text-[0.74rem] text-ink-2">{subtitle(item)}</div>}
                          {meta && <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta(item)}</div>}
                        </div>
                        <LiveToggle
                          on={Boolean(item[toggle.field])}
                          label={`${toggle.label}: ${title(item)}`}
                          path={`${basePath}/${item.id}`}
                          field={toggle.field}
                        />
                        <RowActions path={`${basePath}/${item.id}`} label={`"${title(item)}"`} onEdit={() => setEditing(item.id)} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Fragment>
          ))
        )}
      </Card>

      <Card title={createTitle}>
        <ResourceForm fields={fields} method="POST" path={basePath} submitLabel={createTitle} />
      </Card>
    </div>
  );
}
