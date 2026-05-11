import { describe, expect, it } from "vitest";
import { createLeadTeaser } from "@/lib/audit/createLeadTeaser";
import type {
  AuditCheck,
  AuditIssue,
  AuditResult,
} from "@/lib/audit/types";

describe("createLeadTeaser", () => {
  it("returns a reduced public response with at most two critical points", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [
          createFailedCheck("seo-noindex-not-set", "high", 4),
          createFailedCheck("structured-jsonld-present", "high", 4),
          createFailedCheck("entity-location-signal", "high", 4),
        ],
      }),
    );

    expect(result.url).toBe("https://example.com");
    expect(result.score).toBe(58);
    expect(result.criticalPoints).toHaveLength(2);
    expect(result.criticalPoints.map((point) => point.title)).toEqual([
      "Die Seite könnte von der Indexierung ausgeschlossen sein",
      "Keine strukturierten Daten gefunden",
    ]);
  });

  it("prioritizes high-impact failed checks over medium ones", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [
          createFailedCheck("content-contact-options", "medium", 4),
          createFailedCheck("structured-jsonld-present", "high", 4),
          createFailedCheck("seo-description-present", "high", 4),
        ],
      }),
    );

    expect(result.criticalPoints).toHaveLength(2);
    expect(result.criticalPoints.every((point) => point.impact === "high")).toBe(
      true,
    );
  });

  it("does not include passed checks or low-impact checks", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [
          {
            ...createFailedCheck("structured-jsonld-present", "high", 4),
            passed: true,
          },
          createFailedCheck("technical-internal-links-present", "low", 3),
          createFailedCheck("entity-location-signal", "high", 4),
        ],
      }),
    );

    expect(result.criticalPoints).toHaveLength(1);
    expect(result.criticalPoints[0]?.title).toBe(
      "Standortbezug ist kaum sichtbar",
    );
  });

  it("returns CTA and disclaimer without leaking full audit internals", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [createFailedCheck("structured-jsonld-present", "high", 4)],
      }),
    );

    expect(result.cta).toEqual({
      headline:
        "Möchten Sie wissen, welche Maßnahmen bei Ihrer Website wirklich sinnvoll sind?",
      text: "Ich prüfe Ihre Website kostenlos und gebe Ihnen eine klare Einschätzung, welche Punkte zuerst verbessert werden sollten.",
      buttonLabel: "Kostenfreie Ersteinschätzung anfragen",
      targetUrl: "/kostenfreie-beratung",
    });
    expect(result.disclaimer).toBe(
      "Dieser Quick Check misst keine echten Rankings. Er bewertet technische und semantische Signale.",
    );
    expect(result).not.toHaveProperty("checks");
    expect(result).not.toHaveProperty("metadata");
    expect(result).not.toHaveProperty("frequentTerms");
    expect(result).not.toHaveProperty("schemaTypes");
  });

  it("falls back to relevant medium issues when no high-impact checks exist", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [
          createFailedCheck("content-contact-options", "medium", 4),
          createFailedCheck("structured-website", "medium", 2),
          createFailedCheck("entity-audience-signal", "medium", 4),
        ],
      }),
    );

    expect(result.criticalPoints).toHaveLength(2);
    expect(result.criticalPoints.every((point) => point.impact === "medium")).toBe(
      true,
    );
  });

  it("returns a harmless CTA when no relevant problems are present", () => {
    const result = createLeadTeaser(
      createAuditResult({
        score: 88,
        checks: [
          {
            ...createFailedCheck("structured-jsonld-present", "high", 4),
            passed: true,
          },
        ],
        issues: [],
      }),
    );

    expect(result.criticalPoints).toEqual([]);
    expect(result.cta.headline).toBe(
      "Die Seite sendet bereits einige gute Signale.",
    );
  });

  it("falls back to issues when checks are missing", () => {
    const result = createLeadTeaser(
      createAuditResult({
        checks: [],
        issues: [
          createIssue("structured-jsonld-present", "high", 4),
          createIssue("content-contact-options", "medium", 4),
          createIssue("technical-internal-links-present", "low", 3),
        ],
      }),
    );

    expect(result.criticalPoints).toHaveLength(2);
    expect(result.criticalPoints[0]?.title).toBe(
      "Keine strukturierten Daten gefunden",
    );
  });
});

function createAuditResult(overrides: Partial<AuditResult> = {}): AuditResult {
  return {
    url: "https://example.com",
    score: 58,
    categories: [],
    strongSignals: [],
    weakSignals: [],
    issues: [],
    recommendations: [],
    frequentTerms: [],
    schemaTypes: [],
    metadata: {
      analyzedAt: "2026-05-11T09:30:00.000Z",
      requestedUrl: "https://example.com",
      finalUrl: "https://example.com",
      technical: {
        status: 200,
        contentType: "text/html; charset=utf-8",
        responseTimeMs: 320,
        htmlBytes: 24000,
        redirectCount: 0,
      },
      structuredData: {
        rawBlockCount: 0,
        validItemCount: 0,
        invalidBlockCount: 0,
      },
    },
    checks: [],
    ...overrides,
  };
}

function createFailedCheck(
  id: string,
  impact: AuditCheck["impact"],
  weight: number,
): AuditCheck {
  return {
    id,
    label: `Check ${id}`,
    passed: false,
    weight,
    category: "structuredData",
    impact,
    recommendation: `Empfehlung für ${id}`,
  };
}

function createIssue(
  id: string,
  impact: AuditIssue["impact"],
  weight: number,
): AuditIssue {
  return {
    id,
    label: `Issue ${id}`,
    category: "structuredData",
    impact,
    weight,
    recommendation: `Empfehlung für ${id}`,
  };
}
