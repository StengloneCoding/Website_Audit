"use client";

import { AlertTriangle } from "lucide-react";
import {
  CATEGORY_LABELS,
  type AuditImpact,
  type AuditIssue,
} from "@/lib/audit/types";

interface IssueListProps {
  issues: AuditIssue[];
}

const impactClasses: Record<AuditImpact, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
};

const impactLabels: Record<AuditImpact, string> = {
  low: "Niedrige",
  medium: "Mittlere",
  high: "Hohe",
};

export function IssueList({ issues }: IssueListProps) {
  const sortedIssues = [...issues].sort(sortIssues);

  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Gefundene Probleme
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Blocker mit höchster Priorität
        </h2>
      </div>

      {sortedIssues.length > 0 ? (
        <ul className="mt-6 space-y-4" role="list">
          {sortedIssues.map((issue) => {
            const cardClasses = getIssueCardClasses(issue.impact);

            return (
              <li
                key={issue.id}
                className={`rounded-2xl p-4 ${cardClasses.card}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${cardClasses.icon}`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{issue.label}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${impactClasses[issue.impact]}`}
                      >
                        {impactLabels[issue.impact]} Wirkung
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
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-7 text-emerald-900">
          Im aktuellen Audit-Snapshot wurden keine kritischen Blocker gefunden.
        </div>
      )}
    </article>
  );
}

function sortIssues(left: AuditIssue, right: AuditIssue) {
  const impactPriority: Record<AuditImpact, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  if (impactPriority[right.impact] !== impactPriority[left.impact]) {
    return impactPriority[right.impact] - impactPriority[left.impact];
  }

  if (right.weight !== left.weight) {
    return right.weight - left.weight;
  }

  return left.label.localeCompare(right.label);
}

function getIssueCardClasses(impact: AuditImpact) {
  if (impact === "high") {
    return {
      card: "border border-red-200 bg-white/85",
      icon: "bg-red-100 text-red-800",
    };
  }

  if (impact === "medium") {
    return {
      card: "border border-amber-200 bg-white/85",
      icon: "bg-amber-100 text-amber-900",
    };
  }

  return {
    card: "border border-slate-200 bg-white/85",
    icon: "bg-slate-100 text-slate-700",
  };
}
