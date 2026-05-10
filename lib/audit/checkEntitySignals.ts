import type { AuditCheck, ParsedHtml } from "@/lib/audit/types";

const coreEntityTypes = new Set([
  "Organization",
  "Corporation",
  "LocalBusiness",
  "Person",
  "NewsMediaOrganization",
  "EducationalOrganization",
]);

const companyKeywords = [
  "about us",
  "company",
  "corporate",
  "founded",
  "impressum",
  "inc",
  "kontakt",
  "llc",
  "ltd",
  "our company",
  "team",
  "unternehmen",
  "über uns",
  "gmbh",
  "ag",
];

const trustLinkKeywords = [
  "about",
  "company",
  "contact",
  "impressum",
  "kontakt",
  "team",
  "uber",
  "über",
];

const externalProfileDomains = [
  "linkedin.com",
  "crunchbase.com",
  "github.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wikipedia.org",
];

export function checkEntitySignals(
  parsed: ParsedHtml,
  schemaTypes: string[],
): AuditCheck[] {
  const links = parsed.$("a[href]").toArray();
  const lowerBody = parsed.cleanText.toLowerCase();
  const combinedLinkValues = links.map((link) => {
    const href = parsed.$(link).attr("href")?.toLowerCase() ?? "";
    const text = parsed.$(link).text().toLowerCase();

    return `${href} ${text}`.trim();
  });

  const hasTrustLinks = combinedLinkValues.some((value) =>
    trustLinkKeywords.some((keyword) => value.includes(keyword)),
  );
  const hasCoreEntitySchema = schemaTypes.some((type) => coreEntityTypes.has(type));
  const hasCompanyLanguage = companyKeywords.some((keyword) =>
    lowerBody.includes(keyword),
  );
  const matchingProfiles = combinedLinkValues.filter((value) =>
    externalProfileDomains.some((domain) => value.includes(domain)),
  );
  const hasContactSignal =
    combinedLinkValues.some(
      (value) => value.includes("mailto:") || value.includes("tel:"),
    ) ||
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(parsed.cleanText) ||
    /(\+\d[\d\s()./-]{6,}\d)/.test(parsed.cleanText);

  return [
    {
      id: "entity-trust-links",
      label: "About or contact trust links are present",
      passed: hasTrustLinks,
      weight: 6,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Add visible about, team, contact or legal pages so entity context can be discovered more easily.",
    },
    {
      id: "entity-schema",
      label: "Entity-level schema is present",
      passed: hasCoreEntitySchema,
      weight: 6,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Add Organization, LocalBusiness or Person schema to clarify the primary entity behind the page.",
      details:
        schemaTypes.length > 0
          ? `Detected schema types: ${schemaTypes.join(", ")}`
          : undefined,
    },
    {
      id: "entity-company-language",
      label: "Company or legal context appears in the copy",
      passed: hasCompanyLanguage,
      weight: 5,
      category: "entitySignals",
      impact: "medium",
      recommendation:
        "Include clearer company, legal or ownership context to strengthen entity understanding.",
    },
    {
      id: "entity-external-profiles",
      label: "External profile links are present",
      passed: matchingProfiles.length > 0,
      weight: 4,
      category: "entitySignals",
      impact: "medium",
      recommendation:
        "Link to trusted external profiles such as LinkedIn, Crunchbase, GitHub or Wikipedia where relevant.",
    },
    {
      id: "entity-contact-data",
      label: "Contact signals are present",
      passed: hasContactSignal,
      weight: 4,
      category: "entitySignals",
      impact: "medium",
      recommendation:
        "Expose clear email, phone or contact details to improve trust and entity traceability.",
    },
  ];
}
