import {
  SearchCode,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { AuditForm } from "@/components/AuditForm";

export default function Home() {
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
  ];

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
                Prüfe die Verständlichkeit deiner
                Website für Suchmaschinen und KI-Systeme.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                Starte einen schnellen, nachvollziehbaren Check für
                maschinenlesbare Kontextsignale in SEO-Basics,
                Inhaltsklarheit, Entitätssignalen, strukturierten Daten und
                technischer Zugänglichkeit.
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
                Das MVP misst Readiness, nicht Rankings. Der Fokus liegt auf
                technischen und semantischen Signalen, die Maschinen helfen,
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

        <AuditForm />

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
