import type {
  AuditCheck,
  JsonLdExtractionResult,
  StructuredDataSummary,
} from "@/lib/audit/types";

const coreSchemaTypes = new Set([
  "Organization",
  "Corporation",
  "LocalBusiness",
  "Person",
  "WebSite",
  "WebPage",
  "Article",
  "Service",
  "Product",
]);

export function checkStructuredData(jsonLd: JsonLdExtractionResult): {
  checks: AuditCheck[];
  summary: StructuredDataSummary;
} {
  const hasCoreType = jsonLd.types.some((type) => coreSchemaTypes.has(type));

  const checks: AuditCheck[] = [
    {
      id: "structured-jsonld-present",
      label: "JSON-LD is present",
      passed: jsonLd.rawBlockCount > 0,
      weight: 4,
      category: "structuredData",
      impact: "high",
      recommendation:
        "Add JSON-LD markup to expose machine-readable context through schema.org.",
      details:
        jsonLd.rawBlockCount > 0
          ? `Detected ${jsonLd.rawBlockCount} JSON-LD block(s).`
          : undefined,
    },
    {
      id: "structured-jsonld-valid",
      label: "JSON-LD is parseable",
      passed: jsonLd.items.length > 0 && jsonLd.invalidBlocks === 0,
      weight: 4,
      category: "structuredData",
      impact: "high",
      recommendation:
        "Validate JSON-LD blocks to ensure they can be parsed without errors.",
      details:
        jsonLd.invalidBlocks > 0
          ? `${jsonLd.invalidBlocks} block(s) could not be parsed.`
          : undefined,
    },
    {
      id: "structured-schema-types",
      label: "Recognizable schema types are declared",
      passed: jsonLd.types.length > 0,
      weight: 4,
      category: "structuredData",
      impact: "medium",
      recommendation:
        "Declare explicit schema types such as Organization, WebSite, Article or Service.",
      details:
        jsonLd.types.length > 0
          ? `Detected types: ${jsonLd.types.join(", ")}`
          : undefined,
    },
    {
      id: "structured-core-entity",
      label: "Core page or entity schema is present",
      passed: hasCoreType,
      weight: 3,
      category: "structuredData",
      impact: "medium",
      recommendation:
        "Add core entity or page-level schema to describe the site, brand or page purpose.",
    },
  ];

  return {
    checks,
    summary: {
      rawBlockCount: jsonLd.rawBlockCount,
      validItemCount: jsonLd.items.length,
      invalidBlockCount: jsonLd.invalidBlocks,
      types: jsonLd.types,
    },
  };
}
