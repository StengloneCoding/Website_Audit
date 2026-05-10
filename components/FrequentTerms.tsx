"use client";

import { Hash } from "lucide-react";
import type { FrequentTerm } from "@/lib/audit/types";

interface FrequentTermsProps {
  terms: FrequentTerm[];
}

export function FrequentTerms({ terms }: FrequentTermsProps) {
  return (
    <article className="panel p-6 md:p-7">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          Keyword signals
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Frequent terms on the page
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          These terms help surface repeated topic signals in the visible body
          copy.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {terms.length > 0 ? (
          terms.map((term) => (
            <div
              key={term.term}
              className="flex items-center gap-3 rounded-full border border-slate-900/8 bg-white/85 px-4 py-3 text-sm text-slate-700"
            >
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-900">{term.term}</span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                {term.count}x
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 text-sm text-slate-600">
            Not enough text was found to extract recurring term signals.
          </div>
        )}
      </div>
    </article>
  );
}
