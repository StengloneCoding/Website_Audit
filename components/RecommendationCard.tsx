"use client";

import { ArrowRight, Lightbulb } from "lucide-react";

interface RecommendationCardProps {
  recommendations: string[];
}

export function RecommendationCard({
  recommendations,
}: RecommendationCardProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Recommendations
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Next actions for the page
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation) => (
            <div
              key={recommendation}
              className="flex items-start gap-3 rounded-2xl border border-slate-900/8 bg-white/85 p-4"
            >
              <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  Suggested improvement
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {recommendation}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 text-sm text-slate-600">
            No recommendations available.
          </div>
        )}
      </div>
    </article>
  );
}
