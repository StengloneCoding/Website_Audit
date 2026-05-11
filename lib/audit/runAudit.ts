import { calculateScore } from "@/lib/audit/calculateScore";
import { checkContentClarity } from "@/lib/audit/checkContentClarity";
import { checkEntitySignals } from "@/lib/audit/checkEntitySignals";
import { checkStructuredData } from "@/lib/audit/checkStructuredData";
import { extractFrequentTerms } from "@/lib/audit/extractFrequentTerms";
import { extractJsonLd } from "@/lib/audit/extractJsonLd";
import { extractSeoBasics } from "@/lib/audit/extractSeoBasics";
import { fetchPageHtml } from "@/lib/audit/fetchPage";
import { parseHtml } from "@/lib/audit/parseHtml";
import {
  AuditError,
  type AuditCheck,
  type AuditResult,
  type FetchPageResult,
} from "@/lib/audit/types";
import { validateAuditUrl } from "@/lib/audit/validateUrl";

export async function runAudit(inputUrl: unknown): Promise<AuditResult> {
  const normalizedUrl = validateAuditUrl(inputUrl);
  const page = await loadAuditPage(normalizedUrl);
  const parsed = parseHtml(page.html);
  const { seoBasics, checks: seoChecks } = extractSeoBasics(parsed);
  const jsonLd = extractJsonLd(parsed);
  const { checks: structuredDataChecks, summary: structuredDataSummary } =
    checkStructuredData(jsonLd, parsed);
  const contentChecks = checkContentClarity(parsed, seoBasics);
  const entityChecks = checkEntitySignals(parsed, jsonLd.schemaTypes);
  const frequentTerms = extractFrequentTerms(parsed.cleanText);
  const technicalChecks = buildTechnicalChecks(page);

  return calculateScore({
    url: page.finalUrl,
    checks: [
      ...seoChecks,
      ...contentChecks,
      ...entityChecks,
      ...structuredDataChecks,
      ...technicalChecks,
    ],
    frequentTerms,
    schemaTypes: jsonLd.schemaTypes,
    metadata: {
      analyzedAt: new Date().toISOString(),
      requestedUrl: normalizedUrl,
      finalUrl: page.finalUrl,
      technical: {
        status: page.status,
        contentType: page.contentType,
        responseTimeMs: page.responseTimeMs,
        htmlBytes: page.htmlBytes,
        redirectCount: page.redirectCount,
      },
      structuredData: structuredDataSummary,
    },
  });
}

async function loadAuditPage(url: string) {
  try {
    return await fetchPageHtml(url);
  } catch (error) {
    if (!(error instanceof AuditError)) {
      throw error;
    }

    if (error.statusCode === 408 || error.statusCode === 504) {
      throw new AuditError(error.message, 408);
    }

    throw new AuditError(error.message, 502);
  }
}

function buildTechnicalChecks(page: FetchPageResult): AuditCheck[] {
  const finalProtocol = new URL(page.finalUrl).protocol;

  return [
    {
      id: "technical-https",
      label: "Die finale URL nutzt HTTPS",
      passed: finalProtocol === "https:",
      weight: 4,
      category: "technicalAccessibility",
      impact: "high",
      recommendation:
        "Stelle die bevorzugte öffentliche Seite über HTTPS bereit, um Vertrauen und Zugänglichkeitssignale zu verbessern.",
      details: `Aufgelöstes Protokoll: ${finalProtocol.replace(":", "")}.`,
    },
    {
      id: "technical-response-time",
      label: "Die Seite antwortet innerhalb des Zeitbudgets",
      passed: page.responseTimeMs <= 3_000,
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Verbessere die Antwortzeiten, damit Crawler und KI-Systeme die Seite zuverlässiger abrufen können.",
      details: `Gemessene Antwortzeit: ${page.responseTimeMs} ms.`,
    },
    {
      id: "technical-html-size",
      label: "Die HTML-Größe bleibt in einem schlanken Bereich",
      passed: page.htmlBytes <= 750_000,
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Halte das gerenderte HTML schlank, damit Inhalte leichter abgerufen und geparst werden können.",
      details: `HTML-Größe: ${page.htmlBytes} Bytes.`,
    },
  ];
}
