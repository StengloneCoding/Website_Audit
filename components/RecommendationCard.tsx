"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import {
  CATEGORY_LABELS,
  type AuditImpact,
  type AuditRecommendation,
} from "@/lib/audit/types";

interface RecommendationCardProps {
  recommendations: AuditRecommendation[];
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

export function RecommendationCard({
  recommendations,
}: RecommendationCardProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Empfehlungen
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Nächste Schritte für die Seite
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-900/8 bg-white/85 p-4"
            >
              <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  {recommendation.label}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${impactClasses[recommendation.impact]}`}
                  >
                    {impactLabels[recommendation.impact]} Wirkung
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {CATEGORY_LABELS[recommendation.category]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {recommendation.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 text-sm text-slate-600">
            Keine Empfehlungen verfügbar.
          </div>
        )}
      </div>
    </article>
  );
}
