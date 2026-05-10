import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateScore } from "@/lib/audit/calculateScore";
import { checkContentClarity } from "@/lib/audit/checkContentClarity";
import { checkEntitySignals } from "@/lib/audit/checkEntitySignals";
import { checkStructuredData } from "@/lib/audit/checkStructuredData";
import { extractFrequentTerms } from "@/lib/audit/extractFrequentTerms";
import { extractJsonLd } from "@/lib/audit/extractJsonLd";
import { extractSeoBasics } from "@/lib/audit/extractSeoBasics";
import { fetchPage } from "@/lib/audit/fetchPage";
import { parseHtml } from "@/lib/audit/parseHtml";
import {
  AuditError,
  type AuditCheck,
  type AuditResult,
  type PageFetchResult,
} from "@/lib/audit/types";
import { validateUrl } from "@/lib/audit/validateUrl";

const requestSchema = z.object({
  url: z.string().trim().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      throw new AuditError("The request body must be valid JSON.", 400);
    }

    const body = requestSchema.parse(payload);
    const validatedUrl = await validateUrl(body.url);
    const page = await fetchPage(validatedUrl);
    const parsed = parseHtml(page.html);
    const { seoBasics, checks: seoChecks } = extractSeoBasics(parsed);
    const jsonLd = extractJsonLd(parsed);
    const { checks: structuredDataChecks, summary: schemaSummary } =
      checkStructuredData(jsonLd);
    const contentChecks = checkContentClarity(parsed, seoBasics);
    const entityChecks = checkEntitySignals(parsed, jsonLd.types);
    const technicalChecks = buildTechnicalChecks(page);
    const frequentTerms = extractFrequentTerms(parsed.cleanText);
    const checks = [
      ...seoChecks,
      ...contentChecks,
      ...entityChecks,
      ...structuredDataChecks,
      ...technicalChecks,
    ];
    const scoring = calculateScore(checks);

    const result: AuditResult = {
      inputUrl: validatedUrl.normalizedUrl,
      finalUrl: page.finalUrl,
      analyzedAt: new Date().toISOString(),
      score: scoring.score,
      categoryBreakdown: scoring.categoryBreakdown,
      checks,
      strongSignals: scoring.strongSignals,
      weakSignals: scoring.weakSignals,
      issues: scoring.issues,
      recommendations: scoring.recommendations,
      frequentTerms,
      schemaSummary,
      seoBasics,
      technical: {
        status: page.status,
        contentType: page.contentType,
        responseTimeMs: page.responseTimeMs,
        htmlBytes: page.htmlBytes,
        redirectCount: page.redirectCount,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please provide a valid URL payload." },
        { status: 400 },
      );
    }

    if (error instanceof AuditError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "An unexpected error prevented the audit." },
      { status: 500 },
    );
  }
}

function buildTechnicalChecks(page: PageFetchResult): AuditCheck[] {
  const finalProtocol = new URL(page.finalUrl).protocol;

  return [
    {
      id: "technical-https",
      label: "Final URL uses HTTPS",
      passed: finalProtocol === "https:",
      weight: 4,
      category: "technicalAccessibility",
      impact: "high",
      recommendation:
        "Serve the preferred public page over HTTPS to improve trust and accessibility signals.",
      details: `Resolved protocol: ${finalProtocol.replace(":", "")}.`,
    },
    {
      id: "technical-response-time",
      label: "Page responds within the timeout budget",
      passed: page.responseTimeMs <= 3_000,
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Improve response times so crawlers and AI systems can fetch the page more reliably.",
      details: `Measured response time: ${page.responseTimeMs} ms.`,
    },
    {
      id: "technical-html-size",
      label: "HTML size stays within a lean range",
      passed: page.htmlBytes <= 750_000,
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Keep rendered HTML lean to make content easier to fetch and parse.",
      details: `HTML size: ${page.htmlBytes} bytes.`,
    },
  ];
}
