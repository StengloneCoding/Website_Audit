"use client";

import { AlertTriangle } from "lucide-react";
import {
  CATEGORY_LABELS,
  type AuditCheck,
  type AuditImpact,
} from "@/lib/audit/types";

interface IssueListProps {
  issues: AuditCheck[];
}

const impactClasses: Record<AuditImpact, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
};

export function IssueList({ issues }: IssueListProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Found issues
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Highest-priority blockers
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-red-200 bg-white/85 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-red-100 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{issue.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${impactClasses[issue.impact]}`}
                    >
                      {issue.impact} impact
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {CATEGORY_LABELS[issue.category]}
                    </span>
                  </div>
                  {issue.details ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {issue.details}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {issue.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900">
            No critical blockers were found in the current audit snapshot.
          </div>
        )}
      </div>
    </article>
  );
}
