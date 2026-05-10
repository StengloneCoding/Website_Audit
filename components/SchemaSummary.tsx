"use client";

import { Braces, Database } from "lucide-react";
import type { StructuredDataSummary } from "@/lib/audit/types";

interface SchemaSummaryProps {
  summary: StructuredDataSummary;
  schemaTypes: string[];
}

export function SchemaSummary({ summary, schemaTypes }: SchemaSummaryProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Schema-Übersicht
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Snapshot strukturierter Daten
        </h2>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Braces className="h-4 w-4" />
            JSON-LD-Blöcke
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.rawBlockCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Database className="h-4 w-4" />
            Gültige Einträge
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.validItemCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Database className="h-4 w-4" />
            Ungültige Blöcke
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.invalidBlockCount}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-900/8 bg-white/85 p-4">
        <p className="text-sm font-medium text-slate-900">Erkannte Schema-Typen</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {schemaTypes.length > 0 ? (
            schemaTypes.map((type) => (
              <span
                key={type}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
              >
                {type}
              </span>
            ))
          ) : (
            <p className="text-sm leading-7 text-slate-600">
              Es wurden keine parsebaren schema.org-Typen erkannt.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
