"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

/** Quote anything that could break a CSV cell, and double any quotes inside it. */
function cell(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Downloads the report as a spreadsheet file. The rows are the same ones the
 * chart's table view shows, so the export can never disagree with the screen.
 */
export default function ExportCsv({
  filename,
  sections,
  disabled,
}: {
  filename: string;
  sections: { title: string; columns: string[]; rows: (string | number)[][] }[];
  disabled?: boolean;
}) {
  function download() {
    const csv = sections
      .map((s) => [cell(s.title), s.columns.map(cell).join(","), ...s.rows.map((r) => r.map(cell).join(","))].join("\n"))
      .join("\n\n");
    // Excel reads ₹ and other non-ASCII correctly only with a byte-order mark.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button size="sm" onClick={download} disabled={disabled}>
      <Download className="size-3.5" /> Export Report
    </Button>
  );
}
