"use client";

import { useState } from "react";
import {
  LoaderCircle,
  SearchCode,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { AuditForm } from "@/components/AuditForm";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { FrequentTerms } from "@/components/FrequentTerms";
import { IssueList } from "@/components/IssueList";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SchemaSummary } from "@/components/SchemaSummary";
import { ScoreCard } from "@/components/ScoreCard";
import { SignalList } from "@/components/SignalList";
import type { AuditResult } from "@/lib/audit/types";

interface AuditErrorPayload {
  error?: string;
}

const pillars = [
  {
    title: "Technische Signale",
    description:
      "Prüft, ob eine Seite zugänglich, sicher und für Crawler sowie KI-Systeme leicht zu parsen ist.",
    icon: SearchCode,
  },
  {
    title: "Semantischer Kontext",
    description:
      "Hebt Schema-Markup, Entitätshinweise und Inhaltsstruktur hervor, die den maschinenlesbaren Kontext verbessern.",
    icon: Waypoints,
  },
  {
    title: "Konkrete Handlungsempfehlungen",
    description:
      "Verwandelt schwache Signale in klare Empfehlungen statt in vage Sichtbarkeitsversprechen.",
    icon: Sparkles,
  },
] as const;

const loadingSteps = [
  "HTML der Seite wird geladen und auf Erreichbarkeit geprüft.",
  "SEO-Basics, Inhalte, Entitätssignale und JSON-LD werden analysiert.",
  "Der Readiness-Score und konkrete Empfehlungen werden zusammengestellt.",
] as const;

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAuditSubmit(url: string) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json().catch(() => null)) as
        | AuditResult
        | AuditErrorPayload
        | null;

      if (!response.ok) {
        throw new Error(
          payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof payload.error === "string"
            ? payload.error
            : "Das Audit konnte nicht abgeschlossen werden.",
        );
      }

      setResult(payload as AuditResult);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Das Audit konnte nicht abgeschlossen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-1">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 md:px-10 lg:gap-14 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              KI-Readiness-Sichtbarkeits-Audit
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Wie verständlich ist Ihre Webseite für Google und KI-Suchsysteme
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                Prüfen Sie in wenigen Sekunden, ob Ihre Website technische und
                semantische Signale liefert, die Suchmaschinen und KI-Systemen
                helfen, Ihr Unternehmen besser zu verstehen.
              </p>
            </div>
          </div>

          <div className="panel grid-noise p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
              Positionierung
            </p>
            <div className="mt-4 space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">
                Keine falschen Ranking-Versprechen.
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                Das MVP misst technische und semantische Readiness, nicht echte
                Rankings. Der Fokus liegt auf Signalen, die Maschinen helfen,
                besseren Kontext rund um eine Seite zu bilden.
              </p>
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                  KI-Readiness-Score für Sichtbarkeit
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                  Nachvollziehbare Empfehlungen
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuditForm
          onSubmit={handleAuditSubmit}
          isLoading={isLoading}
          error={error}
        />

        {isLoading ? (
          <section className="panel p-6 md:p-7" aria-live="polite">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-slate-950 text-white">
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                  Analyse läuft
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Die Website wird gerade geprüft
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                  Wir laden die Seite, extrahieren die wichtigsten Signale und
                  berechnen daraus den AI Visibility Readiness Score.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {loadingSteps.map((step) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm leading-7 text-slate-600"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <ScoreCard score={result.score} />
              <CategoryBreakdown categories={result.categories} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <IssueList issues={result.issues} />
              <RecommendationCard recommendations={result.recommendations} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <SignalList
                title="Starke Signale"
                subtitle="Bereiche, die bereits guten maschinenlesbaren Kontext liefern."
                checks={result.strongSignals}
                variant="positive"
              />
              <SignalList
                title="Schwache Signale"
                subtitle="Signale, die aktuell Klarheit oder maschinenlesbaren Kontext reduzieren."
                checks={result.weakSignals}
                variant="negative"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <FrequentTerms terms={result.frequentTerms} />
              <SchemaSummary
                summary={result.metadata.structuredData}
                schemaTypes={result.schemaTypes}
              />
            </div>

            <div className="rounded-3xl border border-slate-900/8 bg-white/70 px-5 py-4 text-sm leading-7 text-slate-600 shadow-sm">
              Dieser Snapshot misst keine echten Rankings in Suchmaschinen oder
              KI-Produkten. Er bewertet technische und semantische
              Readiness-Signale, die die maschinenlesbare Verständlichkeit einer
              Website verbessern.
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article key={title} className="panel p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
