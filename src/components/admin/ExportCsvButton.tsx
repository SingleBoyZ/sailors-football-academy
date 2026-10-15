"use client";

import { Download } from "lucide-react";

type Row = Record<string, string | number>;

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))];
  return lines.join("\n");
}

export function ExportCsvButton({ rows, filename }: { rows: Row[]; filename: string }) {
  function handleClick() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleClick}
      className="border-brand-ink/15 hover:border-brand-ink flex items-center gap-2 border px-3 py-2 text-sm"
    >
      <Download className="h-4 w-4" /> Export CSV
    </button>
  );
}
