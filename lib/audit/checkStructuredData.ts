import type {
  AuditCheck,
  ParsedHtml,
  JsonLdParseResult,
  StructuredDataSummary,
} from "@/lib/audit/types";

const fallbackSchemaRecommendation =
  "Ergänze JSON-LD-Schema, um Unternehmensentität, Leistungen, Standort und Seitenzweck klarer zu machen.";

export function checkStructuredData(
  jsonLd: JsonLdParseResult,
  parsed?: ParsedHtml,
): {
  checks: AuditCheck[];
  summary: StructuredDataSummary;
} {
  const hasSchema = jsonLd.rawBlockCount > 0;
  const hasValidJsonLd =
    jsonLd.validBlocks.length > 0 && jsonLd.invalidBlockCount === 0;
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
      label: "JSON-LD ist vorhanden",
      passed: hasSchema,
      weight: 4,
      category: "structuredData",
      impact: "high",
      recommendation: fallbackSchemaRecommendation,
      details:
        jsonLd.rawBlockCount > 0
          ? `${jsonLd.rawBlockCount} JSON-LD-Block/Blöcke erkannt.`
          : undefined,
    },
    {
      id: "structured-jsonld-valid",
      label: "JSON-LD ist parsebar",
      passed: hasValidJsonLd,
      weight: 3,
      category: "structuredData",
      impact: "high",
      recommendation: hasSchema
        ? "Behebe ungültige JSON-LD-Blöcke, damit das deklarierte Schema konsistent geparst werden kann."
        : fallbackSchemaRecommendation,
      details:
        jsonLd.invalidBlockCount > 0
          ? `${jsonLd.invalidBlockCount} Block/Blöcke konnten nicht geparst werden.`
          : undefined,
    },
    {
      id: "structured-organization-or-local-business",
      label: "Organization- oder LocalBusiness-Schema ist vorhanden",
      passed: hasOrganizationOrLocalBusiness,
      weight: 3,
      category: "structuredData",
      impact: "high",
      recommendation: hasSchema
        ? "Ergänze Organization- oder LocalBusiness-Schema, um die primäre Unternehmensentität klarzustellen."
        : fallbackSchemaRecommendation,
      details:
        jsonLd.schemaTypes.length > 0
          ? `Erkannte Typen: ${jsonLd.schemaTypes.join(", ")}`
          : undefined,
    },
    {
      id: "structured-website",
      label: "WebSite-Schema ist vorhanden",
      passed: hasWebSite,
      weight: 2,
      category: "structuredData",
      impact: "medium",
      recommendation: hasSchema
        ? "Ergänze WebSite-Schema, um den übergreifenden Seitenkontext maschinenlesbar zu beschreiben."
        : fallbackSchemaRecommendation,
    },
    {
      id: "structured-service",
      label: "Service-Schema ist vorhanden",
      passed: hasService,
      weight: 2,
      category: "structuredData",
      impact: "medium",
      recommendation: hasSchema
        ? "Ergänze Service-Schema, um das Hauptangebot und seine geschäftliche Relevanz zu beschreiben."
        : fallbackSchemaRecommendation,
    },
  ];

  if (faqRelevant) {
    checks.push({
      id: "structured-faqpage",
      label: "Sichtbarer FAQ-Inhalt ist mit FAQPage-Schema hinterlegt",
      passed: hasFaqPage,
      weight: 1,
      category: "structuredData",
      impact: "low",
      recommendation: hasSchema
        ? "Ergänze FAQPage-Schema für sichtbare FAQ-Abschnitte, damit Fragen und Antworten maschinenlesbar werden."
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
  return expectedTypes.some((expectedType) =>
    schemaTypes.includes(expectedType),
  );
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
