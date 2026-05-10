"use client";

import { CheckCircle2, CircleSlash, type LucideIcon } from "lucide-react";
import {
  CATEGORY_LABELS,
  type AuditCheck,
  type AuditImpact,
} from "@/lib/audit/types";

interface SignalListProps {
  title: string;
  subtitle: string;
  checks: AuditCheck[];
  variant: "positive" | "negative";
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

export function SignalList({
  title,
  subtitle,
  checks,
  variant,
}: SignalListProps) {
  const Icon: LucideIcon = variant === "positive" ? CheckCircle2 : CircleSlash;
  const iconClasses =
    variant === "positive"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-red-100 text-red-800";

  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          {title}
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-6 space-y-4">
        {checks.length > 0 ? (
          checks.map((check) => (
            <div
              key={check.id}
              className="rounded-2xl border border-slate-900/8 bg-white/80 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl ${iconClasses}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{check.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${impactClasses[check.impact]}`}
                    >
                      {impactLabels[check.impact]} Wirkung
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {CATEGORY_LABELS[check.category]}
                    </span>
                  </div>
                  {check.details ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {check.details}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {check.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4 text-sm text-slate-600">
            Noch keine Signale verfügbar.
          </div>
        )}
      </div>
    </article>
  );
}
