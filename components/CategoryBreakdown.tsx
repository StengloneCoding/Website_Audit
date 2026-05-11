"use client";

import { CATEGORY_LABELS, type CategoryScore } from "@/lib/audit/types";

interface CategoryBreakdownProps {
  categories: CategoryScore[];
}

export function CategoryBreakdown({
  categories,
}: CategoryBreakdownProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Kategorieaufschlüsselung
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          So verteilt sich der Score
        </h2>
      </div>

      {categories.length > 0 ? (
        <ul className="mt-6 space-y-4" role="list">
          {categories.map((entry) => {
            const label = entry.label || CATEGORY_LABELS[entry.category];

            return (
              <li
                key={entry.category}
                className="rounded-2xl border border-slate-900/8 bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {entry.passedChecks} von {entry.totalChecks} Checks
                      bestanden
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-950">
                    {entry.score} / {entry.maxScore}
                  </p>
                </div>

                <div
                  className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-label={`${label} Fortschritt`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={entry.percentage}
                >
                  <div
                    className="h-full rounded-full bg-slate-950"
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-900/8 bg-white/80 p-4 text-sm leading-7 text-slate-600">
          Noch keine Kategorien verfügbar.
        </div>
      )}
    </article>
  );
}
