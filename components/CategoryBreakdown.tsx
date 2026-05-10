"use client";

import { CATEGORY_LABELS, type CategoryScore } from "@/lib/audit/types";

interface CategoryBreakdownProps {
  categories: CategoryScore[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Category breakdown
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          How the score is distributed
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {categories.map((entry) => (
          <div
            key={entry.category}
            className="rounded-2xl border border-slate-900/8 bg-white/80 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">
                  {CATEGORY_LABELS[entry.category]}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {entry.passedChecks} of {entry.totalChecks} checks passed
                </p>
              </div>
              <p className="text-lg font-semibold text-slate-950">
                {entry.score} / {entry.maxScore}
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-950"
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
