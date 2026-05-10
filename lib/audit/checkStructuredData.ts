import type {
  AuditCheck,
  ParsedHtml,
  JsonLdParseResult,
  StructuredDataSummary,
} from "@/lib/audit/types";

const fallbackSchemaRecommendation =
  "Add JSON-LD schema to clarify the business entity, services, location and page purpose.";

export function checkStructuredData(
  jsonLd: JsonLdParseResult,
  parsed?: ParsedHtml,
): {
  checks: AuditCheck[];
  summary: StructuredDataSummary;
} {
  const hasSchema = jsonLd.rawBlockCount > 0;
  const hasValidJsonLd = jsonLd.validBlocks.length > 0 && jsonLd.invalidBlockCount === 0;
  const hasOrganizationOrLocalBusiness = hasAnyType(jsonLd.schemaTypes, [
    "Organization",
    "LocalBusiness",
  ]);
  const hasWebSite = hasAnyType(jsonLd.schemaTypes, ["WebSite"]);
  const hasService = hasAnyType(jsonLd.schemaTypes, ["Service"]);
  const faqRelevant = parsed ? hasFaqContent(parsed) : false;
  const hasFaqPage = hasAnyType(jsonLd.schemaTypes, ["FAQPage"]);

  const checks: AuditCheck[] = [
    {
      id: "structured-jsonld-present",
      label: "JSON-LD is present",
      passed: hasSchema,
      weight: 4,
      category: "structuredData",
      impact: "high",
      recommendation: fallbackSchemaRecommendation,
      details:
        jsonLd.rawBlockCount > 0
          ? `Detected ${jsonLd.rawBlockCount} JSON-LD block(s).`
          : undefined,
    },
    {
      id: "structured-jsonld-valid",
      label: "JSON-LD is parseable",
      passed: hasValidJsonLd,
      weight: 3,
      category: "structuredData",
      impact: "high",
      recommendation:
        hasSchema
          ? "Fix invalid JSON-LD blocks so the declared schema can be parsed consistently."
          : fallbackSchemaRecommendation,
      details:
        jsonLd.invalidBlockCount > 0
          ? `${jsonLd.invalidBlockCount} block(s) could not be parsed.`
          : undefined,
    },
    {
      id: "structured-organization-or-local-business",
      label: "Organization or LocalBusiness schema is present",
      passed: hasOrganizationOrLocalBusiness,
      weight: 3,
      category: "structuredData",
      impact: "high",
      recommendation:
        hasSchema
          ? "Add Organization or LocalBusiness schema to clarify the primary business entity."
          : fallbackSchemaRecommendation,
      details:
        jsonLd.schemaTypes.length > 0
          ? `Detected types: ${jsonLd.schemaTypes.join(", ")}`
          : undefined,
    },
    {
      id: "structured-website",
      label: "WebSite schema is present",
      passed: hasWebSite,
      weight: 2,
      category: "structuredData",
      impact: "medium",
      recommendation:
        hasSchema
          ? "Add WebSite schema to describe the overall site context in machine-readable form."
          : fallbackSchemaRecommendation,
    },
    {
      id: "structured-service",
      label: "Service schema is present",
      passed: hasService,
      weight: 2,
      category: "structuredData",
      impact: "medium",
      recommendation:
        hasSchema
          ? "Add Service schema to describe the main offer and its business relevance."
          : fallbackSchemaRecommendation,
    },
  ];

  if (faqRelevant) {
    checks.push({
      id: "structured-faqpage",
      label: "Visible FAQ content is backed by FAQPage schema",
      passed: hasFaqPage,
      weight: 1,
      category: "structuredData",
      impact: "low",
      recommendation:
        hasSchema
          ? "Add FAQPage schema for visible FAQ sections so questions and answers become machine-readable."
          : fallbackSchemaRecommendation,
    });
  }

  return {
    checks,
    summary: {
      rawBlockCount: jsonLd.rawBlockCount,
      validItemCount: jsonLd.items.length,
      invalidBlockCount: jsonLd.invalidBlockCount,
    },
  };
}

function hasAnyType(schemaTypes: string[], expectedTypes: string[]) {
  return expectedTypes.some((expectedType) => schemaTypes.includes(expectedType));
}

function hasFaqContent(parsed: ParsedHtml) {
  const normalizedText = parsed.cleanText.toLowerCase();

  if (
    normalizedText.includes("faq") ||
    normalizedText.includes("frequently asked questions") ||
    normalizedText.includes("haufige fragen") ||
    normalizedText.includes("häufige fragen")
  ) {
    return true;
  }

  const questionLikeBlocks = parsed
    .$("h1, h2, h3, h4, summary, dt, p, li")
    .toArray()
    .filter((element) => {
      const text = parsed.$(element).text().replace(/\s+/g, " ").trim();

      return text.includes("?");
    });

  return questionLikeBlocks.length >= 2;
}
