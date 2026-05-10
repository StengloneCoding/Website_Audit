import { describe, expect, it } from "vitest";
import { checkEntitySignals } from "@/lib/audit/checkEntitySignals";
import { parseHtml } from "@/lib/audit/parseHtml";
import { extractFrequentTerms } from "@/lib/audit/extractFrequentTerms";

function getCheck(html: string, checkId: string) {
  const parsed = parseHtml(html);
  const frequentTerms = extractFrequentTerms(parsed.cleanText);

  return checkEntitySignals(parsed, [], frequentTerms).find(
    (check) => check.id === checkId,
  );
}

describe("checkEntitySignals", () => {
  it("recognizes a location or service area", () => {
    const check = getCheck(
      `
        <html>
          <body>
            <h1>SEO Audit für B2B SaaS</h1>
            <p>Ape Studios GmbH unterstützt Teams am Standort Berlin und in Hamburg.</p>
            <p>Wir liefern SEO Audits und Content-Strategie für SaaS Unternehmen.</p>
          </body>
        </html>
      `,
      "entity-location-signal",
    );

    expect(check).toMatchObject({ passed: true });
  });

  it("recognizes concrete services", () => {
    const check = getCheck(
      `
        <html>
          <body>
            <h1>SEO Audit für B2B SaaS</h1>
            <p>Unsere Leistungen umfassen SEO Audits, Content-Strategie und technische SEO-Beratung.</p>
            <p>Diese Leistungen helfen Marketing-Teams bei Relaunches und Sichtbarkeitsanalysen.</p>
          </body>
        </html>
      `,
      "entity-services-signal",
    );

    expect(check).toMatchObject({ passed: true });
  });

  it("creates a warning when generic terms dominate", () => {
    const check = getCheck(
      `
        <html>
          <body>
            <h1>Moderne Lösung mit Qualität</h1>
            <p>Unsere Lösung steht für Qualität, Service, Innovation und moderne, individuelle Qualität.</p>
            <p>Service, Innovation und professionelle Qualität machen unsere Lösung besonders modern.</p>
          </body>
        </html>
      `,
      "entity-specific-terms",
    );

    expect(check).toMatchObject({
      passed: false,
      recommendation:
        "Die wichtigsten Begriffe wirken generisch. Die Seite könnte klarere Entitäten, Leistungen und Standorte benennen.",
    });
  });

  it("fails when expertise signals are missing", () => {
    const check = getCheck(
      `
        <html>
          <body>
            <h1>SEO Audit für B2B SaaS</h1>
            <p>Ape Studios GmbH bietet SEO Audits für Unternehmen in Berlin.</p>
            <p>Unsere Leistungen umfassen Content-Strategie und technische Analysen.</p>
          </body>
        </html>
      `,
      "entity-expertise-signal",
    );

    expect(check).toMatchObject({ passed: false });
  });

  it("passes when recurring relevant terms are present", () => {
    const check = getCheck(
      `
        <html>
          <body>
            <h1>SEO Audit für B2B SaaS</h1>
            <p>Der Audit zeigt, wie ein Audit technische Schwächen und Content-Lücken sichtbar macht.</p>
            <p>Zusätzlich beschreibt der Audit konkrete Maßnahmen für Content, Content-Strategie und interne Verlinkung.</p>
            <p>Ein erfahrener Consultant erklärt die Ergebnisse für Marketing-Teams.</p>
          </body>
        </html>
      `,
      "entity-recurring-terms",
    );

    expect(check).toMatchObject({ passed: true });
    expect(check?.details).toContain("audit");
    expect(check?.details).toContain("content");
  });
});
