"use client";

import { useState } from "react";
import { LoaderCircle, Search, ShieldAlert } from "lucide-react";

interface AuditFormProps {
  onSubmit: (url: string) => Promise<void> | void;
  isLoading: boolean;
  error: string | null;
}

export function AuditForm({
  onSubmit,
  isLoading,
  error,
}: AuditFormProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl || !isValidHttpUrl(trimmedUrl)) {
      setValidationError(
        "Bitte geben Sie eine vollständige URL inklusive http:// oder https:// ein.",
      );
      return;
    }

    setValidationError(null);
    await onSubmit(trimmedUrl);
  }

  const activeError = validationError ?? error;

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
                Website-URL
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
                  onChange={(event) => {
                    setUrl(event.target.value);
                    if (validationError) {
                      setValidationError(null);
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={activeError ? "true" : "false"}
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
                  Analysiere Website
                </>
              ) : (
                "Website analysieren"
              )}
            </button>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Es sind nur URLs mit http und https erlaubt.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Lokale und private Netzwerkziele sind blockiert.
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
              Die Ergebnisse zeigen Readiness-Signale, keine Live-Rankings.
            </div>
          </div>
        </form>
      </section>

      {activeError ? (
        <section
          className="panel border-red-200 bg-red-50/80 p-5 text-red-900"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">Audit nicht verfügbar</p>
              <p className="mt-1 text-sm leading-6 text-red-800">
                {activeError}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
