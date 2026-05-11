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
          Begriffssignale
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Häufige Begriffe auf der Seite
        </h2>
        <p className="text-sm leading-7 text-slate-600">
          Diese Begriffe machen wiederkehrende Themensignale im sichtbaren
          Seitentext sichtbar.
        </p>
      </div>

      {terms.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-3" role="list">
          {terms.map((term) => (
            <li
              key={term.term}
              className="flex items-center gap-3 rounded-full border border-slate-900/8 bg-white/85 px-4 py-3 text-sm text-slate-700"
            >
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-900">{term.term}</span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                {term.count}x
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-900/8 bg-white/85 p-4 text-sm leading-7 text-slate-600">
          Es wurde nicht genug Text gefunden, um wiederkehrende
          Begriffssignale zu extrahieren.
        </div>
      )}
    </article>
  );
}
