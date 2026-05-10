"use client";

import { useState } from "react";
import { LoaderCircle, Search, ShieldAlert } from "lucide-react";
import type { AuditResult } from "@/lib/audit/types";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { FrequentTerms } from "@/components/FrequentTerms";
import { IssueList } from "@/components/IssueList";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SchemaSummary } from "@/components/SchemaSummary";
import { ScoreCard } from "@/components/ScoreCard";
import { SignalList } from "@/components/SignalList";

interface AuditErrorPayload {
  error?: string;
}

export function AuditForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      if (!response.ok) {
        const payload = (await response.json()) as AuditErrorPayload;
        throw new Error(payload.error ?? "The audit could not be completed.");
      }

      const payload = (await response.json()) as AuditResult;
      setResult(payload);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "The audit could not be completed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5 md:p-7">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="url"
                className="mb-3 block text-sm font-medium text-slate-700"
              >
                Website URL
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  id="url"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Run audit"
              )}
            </button>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Only `http` and `https` URLs are accepted.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Local and private network targets are blocked.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Results describe readiness signals, not live rankings.
            </div>
          </div>
        </form>
      </section>

      {error ? (
        <section className="panel border-red-200 bg-red-50/80 p-5 text-red-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">Audit unavailable</p>
              <p className="mt-1 text-sm leading-6 text-red-800">{error}</p>
            </div>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <ScoreCard
              score={result.score}
              analyzedAt={result.metadata.analyzedAt}
              url={result.url}
            />
            <CategoryBreakdown categories={result.categories} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <IssueList issues={result.issues} />
            <RecommendationCard recommendations={result.recommendations} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SignalList
              title="Strong signals"
              subtitle="Areas that already provide good machine-readable context."
              checks={result.strongSignals}
              variant="positive"
            />
            <SignalList
              title="Weak signals"
              subtitle="Signals that currently reduce clarity or machine-readable context."
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
        </section>
      ) : null}
    </div>
  );
}
