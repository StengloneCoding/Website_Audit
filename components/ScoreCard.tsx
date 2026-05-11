"use client";

import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";

interface ScoreCardProps {
  score: number;
}

function getScoreMeta(score: number) {
  if (score >= 80) {
    return {
      label: "Hohe Readiness",
      description:
        "Die Seite sendet bereits viele gut lesbare technische und semantische Signale.",
      badgeClass: "bg-teal-100 text-teal-800",
      scoreClass: "text-teal-800",
      range: "80-100",
    };
  }

  if (score >= 60) {
    return {
      label: "Gute Ausgangsbasis",
      description:
        "Die Seite liefert schon brauchbare Signale, hat aber noch klare Hebel für mehr Verständlichkeit.",
      badgeClass: "bg-amber-100 text-amber-900",
      scoreClass: "text-amber-900",
      range: "60-79",
    };
  }

  return {
    label: "Verbesserung nötig",
    description:
      "Mehr Klarheit in Inhalt, Struktur oder technischen Signalen würde den Maschinenkontext spürbar stärken.",
    badgeClass: "bg-red-100 text-red-900",
    scoreClass: "text-red-900",
    range: "0-59",
  };
}

export function ScoreCard({ score }: ScoreCardProps) {
  const scoreMeta = getScoreMeta(score);

  return (
    <article className="panel p-6 md:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
            KI-Readiness für Sichtbarkeit
          </p>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                {scoreMeta.label}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreMeta.badgeClass}`}
              >
                Scorebereich {scoreMeta.range}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              {scoreMeta.description}
            </p>
          </div>
        </div>

        <div
          className="flex h-40 w-40 items-center justify-center rounded-full metric-ring p-3 shadow-lg shadow-slate-900/10"
          aria-label={`Readiness-Score ${score} von 100`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-slate-950">
            <span className={`text-5xl font-semibold ${scoreMeta.scoreClass}`}>
              {score}
            </span>
            <span className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <BarChart3 className="h-4 w-4" />
            Einordnung
          </div>
          <p className="mt-2 font-medium text-slate-900">{scoreMeta.label}</p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-4 w-4" />
            Fokus
          </div>
          <p className="mt-2 font-medium text-slate-900">
            Technische und semantische Readiness
          </p>
        </div>
        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Hinweis
          </div>
          <p className="mt-2 font-medium text-slate-900">
            Readiness-Signale, keine Rankings
          </p>
        </div>
      </div>
    </article>
  );
}
