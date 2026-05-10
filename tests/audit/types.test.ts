import { expectTypeOf, test } from "vitest";
import {
  CATEGORY_LABELS,
  CATEGORY_MAX_SCORES,
  type AuditResult,
} from "@/lib/audit/types";

test("AuditResult can be consumed as a stable frontend contract", () => {
  const result = {
    url: "https://example.com",
    score: 78,
    categories: [
      {
        category: "seoBasics",
        label: CATEGORY_LABELS.seoBasics,
        score: 18,
        maxScore: CATEGORY_MAX_SCORES.seoBasics,
        percentage: 72,
        passedChecks: 4,
        totalChecks: 6,
      },
    ],
    strongSignals: [
      {
        id: "seo-title-present",
        label: "Title tag is present",
        passed: true,
        weight: 5,
        category: "seoBasics",
        impact: "high",
        recommendation: "Keep the title focused on the primary topic.",
      },
    ],
    weakSignals: [
      {
        id: "structured-jsonld-present",
        label: "JSON-LD is present",
        passed: false,
        weight: 4,
        category: "structuredData",
        impact: "high",
        recommendation: "Add JSON-LD markup to expose schema.org context.",
      },
    ],
    issues: [
      {
        id: "content-word-count",
        label: "Page has enough body copy",
        category: "contentClarity",
        impact: "high",
        weight: 7,
        recommendation: "Add more explanatory body copy for the page topic.",
      },
    ],
    recommendations: [
      {
        id: "recommendation-content-word-count",
        label: "Page has enough body copy",
        text: "Add more explanatory body copy for the page topic.",
        category: "contentClarity",
        impact: "high",
        sourceCheckId: "content-word-count",
      },
    ],
    frequentTerms: [
      {
        term: "audit",
        count: 5,
        share: 12.5,
      },
    ],
    schemaTypes: ["WebSite", "Organization"],
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
        rawBlockCount: 2,
        validItemCount: 2,
        invalidBlockCount: 0,
      },
    },
    checks: [
      {
        id: "seo-title-present",
        label: "Title tag is present",
        passed: true,
        weight: 5,
        category: "seoBasics",
        impact: "high",
        recommendation: "Keep the title focused on the primary topic.",
      },
    ],
  } satisfies AuditResult;

  const recommendation = result.recommendations[0]!;
  const recommendationText: string = recommendation.text;

  expectTypeOf(result).toMatchTypeOf<AuditResult>();
  expectTypeOf(recommendationText).toEqualTypeOf<string>();
  expectTypeOf(result.metadata.structuredData.invalidBlockCount).toEqualTypeOf<number>();
});
