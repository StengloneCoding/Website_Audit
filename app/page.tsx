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
      title: "Technical Signals",
      description:
        "Checks whether a page is accessible, secure and easy to parse for crawlers and AI systems.",
      icon: SearchCode,
    },
    {
      title: "Semantic Context",
      description:
        "Highlights schema markup, entity hints and content structure that improve machine-readable context.",
      icon: Waypoints,
    },
    {
      title: "Actionable Guidance",
      description:
        "Turns weak signals into clear recommendations instead of vague visibility claims.",
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
              AI Visibility Readiness Audit
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Audit the technical and semantic signals that make a website
                easier to understand for search engines and AI systems.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                Run a fast, explainable quick check for machine-readable context
                signals across SEO basics, content clarity, entity signals,
                structured data and technical accessibility.
              </p>
            </div>
          </div>

          <div className="panel grid-noise p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
              Positioning
            </p>
            <div className="mt-4 space-y-4">
              <h2 className="text-2xl font-semibold text-slate-950">
                No fake ranking promises.
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                The MVP measures readiness, not rankings. It focuses on
                technical and semantic signals that help machines form better
                context around a page.
              </p>
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                  AI Visibility Readiness score
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                  Explainable recommendations
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
