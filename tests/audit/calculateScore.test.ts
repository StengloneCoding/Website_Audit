import { describe, expect, it } from "vitest";
import { calculateScore } from "@/lib/audit/calculateScore";
import type { AuditCheck, AuditCategory } from "@/lib/audit/types";

function createCheck(
  overrides: Partial<AuditCheck> &
    Pick<AuditCheck, "id" | "label" | "category">,
): AuditCheck {
  return {
    id: overrides.id,
    label: overrides.label,
    category: overrides.category,
    passed: overrides.passed ?? true,
    weight: overrides.weight ?? 4,
    impact: overrides.impact ?? "medium",
    recommendation:
      overrides.recommendation ?? `Improve ${overrides.label.toLowerCase()}.`,
    details: overrides.details,
  };
}

function createResult(checks: AuditCheck[]) {
  return calculateScore({
    url: "https://example.com",
    checks,
    frequentTerms: [{ term: "audit", count: 4, share: 10 }],
    schemaTypes: ["Organization"],
    metadata: {
      analyzedAt: "2026-05-10T09:30:00.000Z",
      requestedUrl: "https://example.com",
      finalUrl: "https://example.com",
      technical: {
        status: 200,
        contentType: "text/html; charset=utf-8",
        responseTimeMs: 420,
        htmlBytes: 124000,
        redirectCount: 0,
      },
      structuredData: {
        rawBlockCount: 1,
        validItemCount: 1,
        invalidBlockCount: 0,
      },
    },
  });
}

function getCategoryScore(result: ReturnType<typeof createResult>, category: AuditCategory) {
  const entry = result.categories.find((item) => item.category === category);

  expect(entry).toBeDefined();

  return entry!;
}

describe("calculateScore", () => {
  it("returns 100 when all checks pass", () => {
    const checks = [
      createCheck({
        id: "seo-pass",
        label: "SEO basics",
        category: "seoBasics",
      }),
      createCheck({
        id: "content-pass",
        label: "Content clarity",
        category: "contentClarity",
      }),
      createCheck({
        id: "entity-pass",
        label: "Entity signals",
        category: "entitySignals",
      }),
      createCheck({
        id: "schema-pass",
        label: "Structured data",
        category: "structuredData",
      }),
      createCheck({
        id: "technical-pass",
        label: "Technical accessibility",
        category: "technicalAccessibility",
      }),
    ];

    const result = createResult(checks);

    expect(result.score).toBe(100);
    expect(result.url).toBe("https://example.com");
    expect(result.frequentTerms).toEqual([{ term: "audit", count: 4, share: 10 }]);
    expect(result.schemaTypes).toEqual(["Organization"]);
    expect(result.metadata.technical.status).toBe(200);
    expect(result.checks).toEqual(checks);
  });

  it("returns 0 when all checks fail", () => {
    const checks = [
      createCheck({
        id: "seo-fail",
        label: "SEO basics",
        category: "seoBasics",
        passed: false,
      }),
      createCheck({
        id: "content-fail",
        label: "Content clarity",
        category: "contentClarity",
        passed: false,
      }),
      createCheck({
        id: "entity-fail",
        label: "Entity signals",
        category: "entitySignals",
        passed: false,
      }),
      createCheck({
        id: "schema-fail",
        label: "Structured data",
        category: "structuredData",
        passed: false,
      }),
      createCheck({
        id: "technical-fail",
        label: "Technical accessibility",
        category: "technicalAccessibility",
        passed: false,
      }),
    ];

    const result = createResult(checks);

    expect(result.score).toBe(0);
  });

  it("rounds partial scores correctly", () => {
    const checks = [
      createCheck({
        id: "seo-pass",
        label: "SEO pass",
        category: "seoBasics",
        passed: true,
        weight: 4,
      }),
      createCheck({
        id: "seo-fail",
        label: "SEO fail",
        category: "seoBasics",
        passed: false,
        weight: 2,
      }),
      createCheck({
        id: "content-pass",
        label: "Content pass",
        category: "contentClarity",
        passed: true,
        weight: 2,
      }),
      createCheck({
        id: "content-fail",
        label: "Content fail",
        category: "contentClarity",
        passed: false,
        weight: 4,
      }),
      createCheck({
        id: "entity-pass",
        label: "Entity pass",
        category: "entitySignals",
        passed: true,
        weight: 3,
      }),
      createCheck({
        id: "entity-fail",
        label: "Entity fail",
        category: "entitySignals",
        passed: false,
        weight: 1,
      }),
      createCheck({
        id: "schema-pass",
        label: "Schema pass",
        category: "structuredData",
        passed: true,
        weight: 2,
      }),
      createCheck({
        id: "schema-fail",
        label: "Schema fail",
        category: "structuredData",
        passed: false,
        weight: 2,
      }),
      createCheck({
        id: "technical-pass",
        label: "Technical pass",
        category: "technicalAccessibility",
        passed: true,
        weight: 1,
      }),
      createCheck({
        id: "technical-fail",
        label: "Technical fail",
        category: "technicalAccessibility",
        passed: false,
        weight: 3,
      }),
    ];

    const result = createResult(checks);

    expect(result.score).toBe(54);
  });

  it("calculates normalized category scores correctly", () => {
    const checks = [
      createCheck({
        id: "seo-pass",
        label: "SEO pass",
        category: "seoBasics",
        passed: true,
        weight: 4,
      }),
      createCheck({
        id: "seo-fail",
        label: "SEO fail",
        category: "seoBasics",
        passed: false,
        weight: 2,
      }),
      createCheck({
        id: "content-pass",
        label: "Content pass",
        category: "contentClarity",
        passed: true,
        weight: 2,
      }),
      createCheck({
        id: "content-fail",
        label: "Content fail",
        category: "contentClarity",
        passed: false,
        weight: 4,
      }),
      createCheck({
        id: "entity-pass",
        label: "Entity pass",
        category: "entitySignals",
        passed: true,
        weight: 3,
      }),
      createCheck({
        id: "entity-fail",
        label: "Entity fail",
        category: "entitySignals",
        passed: false,
        weight: 1,
      }),
      createCheck({
        id: "schema-pass",
        label: "Schema pass",
        category: "structuredData",
        passed: true,
        weight: 2,
      }),
      createCheck({
        id: "schema-fail",
        label: "Schema fail",
        category: "structuredData",
        passed: false,
        weight: 2,
      }),
      createCheck({
        id: "technical-pass",
        label: "Technical pass",
        category: "technicalAccessibility",
        passed: true,
        weight: 1,
      }),
      createCheck({
        id: "technical-fail",
        label: "Technical fail",
        category: "technicalAccessibility",
        passed: false,
        weight: 3,
      }),
    ];

    const result = createResult(checks);

    expect(getCategoryScore(result, "seoBasics")).toMatchObject({
      score: 16.7,
      maxScore: 25,
      percentage: 67,
      passedChecks: 1,
      totalChecks: 2,
    });
    expect(getCategoryScore(result, "contentClarity")).toMatchObject({
      score: 8.3,
      maxScore: 25,
      percentage: 33,
      passedChecks: 1,
      totalChecks: 2,
    });
    expect(getCategoryScore(result, "entitySignals")).toMatchObject({
      score: 18.8,
      maxScore: 25,
      percentage: 75,
      passedChecks: 1,
      totalChecks: 2,
    });
    expect(getCategoryScore(result, "structuredData")).toMatchObject({
      score: 7.5,
      maxScore: 15,
      percentage: 50,
      passedChecks: 1,
      totalChecks: 2,
    });
    expect(getCategoryScore(result, "technicalAccessibility")).toMatchObject({
      score: 2.5,
      maxScore: 10,
      percentage: 25,
      passedChecks: 1,
      totalChecks: 2,
    });
  });

  it("caps structured data at 15 points after normalization", () => {
    const checks = [
      createCheck({
        id: "structured-jsonld-present",
        label: "JSON-LD is present",
        category: "structuredData",
        weight: 4,
      }),
      createCheck({
        id: "structured-jsonld-valid",
        label: "JSON-LD is parseable",
        category: "structuredData",
        weight: 3,
      }),
      createCheck({
        id: "structured-organization",
        label: "Organization schema is present",
        category: "structuredData",
        weight: 3,
      }),
      createCheck({
        id: "structured-website",
        label: "WebSite schema is present",
        category: "structuredData",
        weight: 2,
      }),
      createCheck({
        id: "structured-service",
        label: "Service schema is present",
        category: "structuredData",
        weight: 2,
      }),
    ];

    const result = createResult(checks);

    expect(getCategoryScore(result, "structuredData").score).toBe(15);
    expect(result.score).toBe(15);
  });

  it("does not let missing schema destroy the total score disproportionately", () => {
    const checks = [
      createCheck({
        id: "seo-pass",
        label: "SEO basics",
        category: "seoBasics",
        passed: true,
      }),
      createCheck({
        id: "content-pass",
        label: "Content clarity",
        category: "contentClarity",
        passed: true,
      }),
      createCheck({
        id: "entity-pass",
        label: "Entity signals",
        category: "entitySignals",
        passed: true,
      }),
      createCheck({
        id: "schema-missing",
        label: "Structured data missing",
        category: "structuredData",
        passed: false,
        impact: "high",
        recommendation: "Add JSON-LD schema.",
      }),
      createCheck({
        id: "technical-pass",
        label: "Technical accessibility",
        category: "technicalAccessibility",
        passed: true,
      }),
    ];

    const result = createResult(checks);

    expect(result.score).toBe(85);
    expect(getCategoryScore(result, "structuredData").score).toBe(0);
  });

  it("builds strongSignals from passed checks", () => {
    const passedHigh = createCheck({
      id: "passed-high",
      label: "Passed high",
      category: "seoBasics",
      passed: true,
      impact: "high",
    });
    const passedMedium = createCheck({
      id: "passed-medium",
      label: "Passed medium",
      category: "contentClarity",
      passed: true,
      impact: "medium",
    });
    const failedHigh = createCheck({
      id: "failed-high",
      label: "Failed high",
      category: "structuredData",
      passed: false,
      impact: "high",
    });

    const result = createResult([passedMedium, failedHigh, passedHigh]);

    expect(result.strongSignals.map((check) => check.id)).toEqual([
      "passed-high",
      "passed-medium",
    ]);
    expect(result.strongSignals.every((check) => check.passed)).toBe(true);
  });

  it("builds weakSignals from failed checks", () => {
    const passedCheck = createCheck({
      id: "passed",
      label: "Passed",
      category: "seoBasics",
      passed: true,
    });
    const failedHigh = createCheck({
      id: "failed-high",
      label: "Failed high",
      category: "structuredData",
      passed: false,
      impact: "high",
    });
    const failedLow = createCheck({
      id: "failed-low",
      label: "Failed low",
      category: "technicalAccessibility",
      passed: false,
      impact: "low",
    });

    const result = createResult([passedCheck, failedLow, failedHigh]);

    expect(result.weakSignals.map((check) => check.id)).toEqual([
      "failed-high",
      "failed-low",
    ]);
    expect(result.weakSignals.every((check) => !check.passed)).toBe(true);
  });

  it("includes only medium and high failed checks in issues", () => {
    const checks = [
      createCheck({
        id: "failed-high",
        label: "Failed high",
        category: "seoBasics",
        passed: false,
        impact: "high",
      }),
      createCheck({
        id: "failed-medium",
        label: "Failed medium",
        category: "contentClarity",
        passed: false,
        impact: "medium",
      }),
      createCheck({
        id: "failed-low",
        label: "Failed low",
        category: "technicalAccessibility",
        passed: false,
        impact: "low",
      }),
      createCheck({
        id: "passed-high",
        label: "Passed high",
        category: "entitySignals",
        passed: true,
        impact: "high",
      }),
    ];

    const result = createResult(checks);

    expect(result.issues.map((issue) => issue.id)).toEqual([
      "failed-high",
      "failed-medium",
    ]);
  });

  it("deduplicates recommendations from failed checks", () => {
    const checks = [
      createCheck({
        id: "schema-primary",
        label: "Schema primary",
        category: "structuredData",
        passed: false,
        impact: "high",
        recommendation: "Add JSON-LD schema.",
      }),
      createCheck({
        id: "schema-secondary",
        label: "Schema secondary",
        category: "structuredData",
        passed: false,
        impact: "medium",
        recommendation: "Add JSON-LD schema.",
      }),
      createCheck({
        id: "content-gap",
        label: "Content gap",
        category: "contentClarity",
        passed: false,
        impact: "medium",
        recommendation: "Add clearer explanatory copy.",
      }),
    ];

    const result = createResult(checks);

    expect(result.recommendations).toHaveLength(2);
    expect(result.recommendations.map((recommendation) => recommendation.text)).toEqual([
      "Add JSON-LD schema.",
      "Add clearer explanatory copy.",
    ]);
    expect(result.recommendations[0]?.sourceCheckId).toBe("schema-primary");
  });

  it("keeps the total score between 0 and 100", () => {
    const checks = [
      createCheck({
        id: "seo-pass",
        label: "SEO pass",
        category: "seoBasics",
        passed: true,
        weight: 999,
      }),
      createCheck({
        id: "seo-zero",
        label: "SEO zero",
        category: "seoBasics",
        passed: false,
        weight: 0,
      }),
      createCheck({
        id: "schema-fail",
        label: "Schema fail",
        category: "structuredData",
        passed: false,
        weight: 999,
      }),
    ];

    const result = createResult(checks);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
