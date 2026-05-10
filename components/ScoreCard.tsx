"use client";

import { CalendarClock, Globe, ShieldCheck } from "lucide-react";

interface ScoreCardProps {
  score: number;
  analyzedAt: string;
  url: string;
}

function getScoreLabel(score: number) {
  if (score >= 80) {
    return "Hohe Readiness";
  }

  if (score >= 60) {
    return "Gute Ausgangsbasis";
  }

  return "Verbesserung nötig";
}

export function ScoreCard({
  score,
  analyzedAt,
  url,
}: ScoreCardProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
            KI-Readiness für Sichtbarkeit
          </p>
          <div>
            <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">
              {getScoreLabel(score)}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Dieser Score fasst technische, semantische und strukturierte
              Signale zusammen, die die Lesbarkeit einer Website für
              Suchmaschinen und KI-Systeme verbessern.
            </p>
          </div>
        </div>

        <div className="flex h-40 w-40 items-center justify-center rounded-full metric-ring p-3 shadow-lg shadow-slate-900/10">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-slate-950">
            <span className="text-5xl font-semibold">{score}</span>
            <span className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Globe className="h-4 w-4" />
            Geprüfte URL
          </div>
          <p className="mt-2 break-all font-medium text-slate-900">{url}</p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarClock className="h-4 w-4" />
            Analysiert am
          </div>
          <p className="mt-2 font-medium text-slate-900">
            {new Date(analyzedAt).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Fokus
          </div>
          <p className="mt-2 font-medium text-slate-900">
            Readiness-Signale, keine Rankings
          </p>
        </div>
      </div>
    </article>
  );
}
