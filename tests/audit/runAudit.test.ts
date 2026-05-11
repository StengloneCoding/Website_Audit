import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditError, type AuditResult } from "@/lib/audit/types";

const mocked = vi.hoisted(() => ({
  callOrder: [] as string[],
  validateAuditUrl: vi.fn(),
  fetchPageHtml: vi.fn(),
  parseHtml: vi.fn(),
  extractSeoBasics: vi.fn(),
  extractJsonLd: vi.fn(),
  checkStructuredData: vi.fn(),
  checkContentClarity: vi.fn(),
  checkEntitySignals: vi.fn(),
  extractFrequentTerms: vi.fn(),
  calculateScore: vi.fn(),
  normalizedUrl: "https://example.com/",
  page: {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/final",
    html: "<html><body>Audit</body></html>",
    statusCode: 200,
    status: 200,
    contentType: "text/html; charset=utf-8",
    htmlBytes: 48000,
    responseTimeMs: 280,
    redirectCount: 1,
  },
  parsed: {
    $: vi.fn(),
    visibleText: "Audit content for Ape Studios in Berlin.",
    cleanText: "Audit content for Ape Studios in Berlin.",
    wordCount: 7,
    paragraphCount: 1,
  },
  seoBasics: {
    title: "AI Visibility Audit",
    description: "Audit page",
    h1s: ["AI Visibility Audit"],
    ogTitle: null,
    ogDescription: null,
    internalLinksCount: 2,
    externalLinksCount: 1,
    imagesCount: 1,
    imagesWithAltCount: 1,
    textLength: 42,
    titleLength: 19,
    metaDescription: "Audit page",
    metaDescriptionLength: 10,
    canonical: "https://example.com/final",
    robots: "index,follow",
    lang: "en",
    viewport: "width=device-width",
    h1Headings: ["AI Visibility Audit"],
    h2Count: 2,
  },
  jsonLd: {
    items: [{ "@type": "Organization" }],
    validBlocks: [{ "@type": "Organization" }],
    invalidBlocks: [],
    invalidBlockCount: 0,
    rawBlockCount: 1,
    schemaTypes: ["Organization", "WebSite"],
  },
  structuredDataSummary: {
    rawBlockCount: 1,
    validItemCount: 1,
    invalidBlockCount: 0,
  },
  seoChecks: [
    {
      id: "seo-title-present",
      label: "Ein Title-Tag ist vorhanden",
      passed: true,
      weight: 5,
      category: "seoBasics",
      impact: "high",
      recommendation: "Ergänze ein eindeutiges Title-Tag.",
    },
  ],
  contentChecks: [
    {
      id: "content-topic-alignment",
      label: "Title, H1 und Fließtext stärken dasselbe Thema",
      passed: true,
      weight: 6,
      category: "contentClarity",
      impact: "high",
      recommendation: "Richte Title, H1 und sichtbaren Text an denselben Themen aus.",
    },
  ],
  entityChecks: [
    {
      id: "entity-business-name-visible",
      label: "Der Unternehmensname wird explizit genannt",
      passed: true,
      weight: 4,
      category: "entitySignals",
      impact: "high",
      recommendation: "Nenne den Unternehmens- oder Markennamen sichtbar.",
    },
  ],
  structuredDataChecks: [
    {
      id: "structured-jsonld-present",
      label: "JSON-LD ist vorhanden",
      passed: true,
      weight: 4,
      category: "structuredData",
      impact: "high",
      recommendation: "Ergänze JSON-LD-Schema.",
    },
  ],
  frequentTerms: [{ term: "audit", count: 2, share: 25 }],
  result: {
    url: "https://example.com/final",
    score: 84,
    categories: [],
    strongSignals: [],
    weakSignals: [],
    issues: [],
    recommendations: [],
    frequentTerms: [{ term: "audit", count: 2, share: 25 }],
    schemaTypes: ["Organization", "WebSite"],
    metadata: {
      analyzedAt: "2026-05-11T09:30:00.000Z",
      requestedUrl: "https://example.com/",
      finalUrl: "https://example.com/final",
      technical: {
        status: 200,
        contentType: "text/html; charset=utf-8",
        responseTimeMs: 280,
        htmlBytes: 48000,
        redirectCount: 1,
      },
      structuredData: {
        rawBlockCount: 1,
        validItemCount: 1,
        invalidBlockCount: 0,
      },
    },
    checks: [],
  } as AuditResult,
}));

vi.mock("@/lib/audit/validateUrl", () => ({
  validateAuditUrl: mocked.validateAuditUrl,
}));

vi.mock("@/lib/audit/fetchPage", () => ({
  fetchPageHtml: mocked.fetchPageHtml,
}));

vi.mock("@/lib/audit/parseHtml", () => ({
  parseHtml: mocked.parseHtml,
}));

vi.mock("@/lib/audit/extractSeoBasics", () => ({
  extractSeoBasics: mocked.extractSeoBasics,
}));

vi.mock("@/lib/audit/extractJsonLd", () => ({
  extractJsonLd: mocked.extractJsonLd,
}));

vi.mock("@/lib/audit/checkStructuredData", () => ({
  checkStructuredData: mocked.checkStructuredData,
}));

vi.mock("@/lib/audit/checkContentClarity", () => ({
  checkContentClarity: mocked.checkContentClarity,
}));

vi.mock("@/lib/audit/checkEntitySignals", () => ({
  checkEntitySignals: mocked.checkEntitySignals,
}));

vi.mock("@/lib/audit/extractFrequentTerms", () => ({
  extractFrequentTerms: mocked.extractFrequentTerms,
}));

vi.mock("@/lib/audit/calculateScore", () => ({
  calculateScore: mocked.calculateScore,
}));

import { runAudit } from "@/lib/audit/runAudit";

describe("runAudit", () => {
  beforeEach(() => {
    mocked.callOrder.length = 0;
    vi.clearAllMocks();
    setDefaultMockImplementations();
  });

  it("calls the audit modules in a sensible order and returns an AuditResult", async () => {
    const result = await runAudit("https://example.com");

    expect(result).toBe(mocked.result);
    expect(mocked.callOrder).toEqual([
      "validateAuditUrl",
      "fetchPageHtml",
      "parseHtml",
      "extractSeoBasics",
      "extractJsonLd",
      "checkStructuredData",
      "checkContentClarity",
      "checkEntitySignals",
      "extractFrequentTerms",
      "calculateScore",
    ]);
    expect(mocked.fetchPageHtml).toHaveBeenCalledWith(mocked.normalizedUrl);
    expect(mocked.parseHtml).toHaveBeenCalledWith(mocked.page.html);
    expect(mocked.checkStructuredData).toHaveBeenCalledWith(
      mocked.jsonLd,
      mocked.parsed,
    );
    expect(mocked.checkContentClarity).toHaveBeenCalledWith(
      mocked.parsed,
      mocked.seoBasics,
    );
    expect(mocked.checkEntitySignals).toHaveBeenCalledWith(
      mocked.parsed,
      mocked.jsonLd.schemaTypes,
    );
    expect(mocked.extractFrequentTerms).toHaveBeenCalledWith(
      mocked.parsed.cleanText,
    );
  });

  it("passes score input with score-critical fields from the audit pipeline", async () => {
    await runAudit("https://example.com");

    expect(mocked.calculateScore).toHaveBeenCalledTimes(1);

    const scoreInput = mocked.calculateScore.mock.calls[0]?.[0];

    expect(scoreInput).toMatchObject({
      url: mocked.page.finalUrl,
      frequentTerms: mocked.frequentTerms,
      schemaTypes: mocked.jsonLd.schemaTypes,
      metadata: {
        analyzedAt: expect.any(String),
        requestedUrl: mocked.normalizedUrl,
        finalUrl: mocked.page.finalUrl,
        technical: {
          status: mocked.page.status,
          contentType: mocked.page.contentType,
          responseTimeMs: mocked.page.responseTimeMs,
          htmlBytes: mocked.page.htmlBytes,
          redirectCount: mocked.page.redirectCount,
        },
        structuredData: mocked.structuredDataSummary,
      },
    });
    expect(scoreInput.checks.map((check: { id: string }) => check.id)).toEqual([
      "seo-title-present",
      "content-topic-alignment",
      "entity-business-name-visible",
      "structured-jsonld-present",
      "technical-https",
      "technical-response-time",
      "technical-html-size",
    ]);
  });

  it("rethrows invalid URL errors as 400", async () => {
    mocked.validateAuditUrl.mockImplementation(() => {
      mocked.callOrder.push("validateAuditUrl");
      throw new AuditError(
        "Bitte gib eine vollständige URL inklusive http:// oder https:// ein.",
        400,
      );
    });

    await expect(runAudit("not-a-url")).rejects.toMatchObject({
      message:
        "Bitte gib eine vollständige URL inklusive http:// oder https:// ein.",
      statusCode: 400,
    });
    expect(mocked.fetchPageHtml).not.toHaveBeenCalled();
  });

  it("maps fetch timeouts to 408", async () => {
    mocked.fetchPageHtml.mockImplementation(async () => {
      mocked.callOrder.push("fetchPageHtml");
      throw new AuditError(
        "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
        408,
      );
    });

    await expect(runAudit("https://example.com")).rejects.toMatchObject({
      message: "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
      statusCode: 408,
    });
    expect(mocked.parseHtml).not.toHaveBeenCalled();
  });

  it("maps upstream fetch failures to 502", async () => {
    mocked.fetchPageHtml.mockImplementation(async () => {
      mocked.callOrder.push("fetchPageHtml");
      throw new AuditError("Die Seite lieferte HTTP 404.", 404);
    });

    await expect(runAudit("https://example.com")).rejects.toMatchObject({
      message: "Die Seite lieferte HTTP 404.",
      statusCode: 502,
    });
    expect(mocked.parseHtml).not.toHaveBeenCalled();
  });
});

function setDefaultMockImplementations() {
  mocked.validateAuditUrl.mockImplementation((url: string) => {
    mocked.callOrder.push("validateAuditUrl");
    return mocked.normalizedUrl;
  });

  mocked.fetchPageHtml.mockImplementation(async (url: string) => {
    mocked.callOrder.push("fetchPageHtml");
    return mocked.page;
  });

  mocked.parseHtml.mockImplementation((html: string) => {
    mocked.callOrder.push("parseHtml");
    return mocked.parsed;
  });

  mocked.extractSeoBasics.mockImplementation((parsed: unknown) => {
    mocked.callOrder.push("extractSeoBasics");
    return {
      seoBasics: mocked.seoBasics,
      checks: mocked.seoChecks,
    };
  });

  mocked.extractJsonLd.mockImplementation((parsed: unknown) => {
    mocked.callOrder.push("extractJsonLd");
    return mocked.jsonLd;
  });

  mocked.checkStructuredData.mockImplementation(
    (jsonLd: unknown, parsed: unknown) => {
      mocked.callOrder.push("checkStructuredData");
      return {
        checks: mocked.structuredDataChecks,
        summary: mocked.structuredDataSummary,
      };
    },
  );

  mocked.checkContentClarity.mockImplementation(
    (parsed: unknown, seoBasics: unknown) => {
      mocked.callOrder.push("checkContentClarity");
      return mocked.contentChecks;
    },
  );

  mocked.checkEntitySignals.mockImplementation(
    (parsed: unknown, schemaTypes: string[]) => {
      mocked.callOrder.push("checkEntitySignals");
      return mocked.entityChecks;
    },
  );

  mocked.extractFrequentTerms.mockImplementation((text: string) => {
    mocked.callOrder.push("extractFrequentTerms");
    return mocked.frequentTerms;
  });

  mocked.calculateScore.mockImplementation((input: unknown) => {
    mocked.callOrder.push("calculateScore");
    return mocked.result;
  });
}
