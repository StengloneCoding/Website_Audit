import type { AuditCheck, ParsedHtml, SeoBasics } from "@/lib/audit/types";

export function extractSeoBasics(parsed: ParsedHtml): {
  seoBasics: SeoBasics;
  checks: AuditCheck[];
} {
  const title = parsed.$("title").first().text().trim() || null;
  const metaDescription =
    parsed.$('meta[name="description"]').attr("content")?.trim() || null;
  const canonical =
    parsed.$('link[rel="canonical"]').attr("href")?.trim() || null;
  const robots = parsed.$('meta[name="robots"]').attr("content")?.trim() || null;
  const lang = parsed.$("html").attr("lang")?.trim() || null;
  const viewport =
    parsed.$('meta[name="viewport"]').attr("content")?.trim() || null;
  const h1Headings = parsed
    .$("h1")
    .toArray()
    .map((element) => parsed.$(element).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const h2Count = parsed.$("h2").length;

  const seoBasics: SeoBasics = {
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    canonical,
    robots,
    lang,
    viewport,
    h1Headings,
    h2Count,
  };

  const checks: AuditCheck[] = [
    {
      id: "seo-title-present",
      label: "Title tag is present",
      passed: Boolean(title),
      weight: 5,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Add a unique page title that clearly states the main topic and brand context.",
      details: title ? `Detected title: ${title}` : undefined,
    },
    {
      id: "seo-title-length",
      label: "Title length is descriptive",
      passed: Boolean(title && title.length >= 20 && title.length <= 65),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Keep the title focused and descriptive, ideally within roughly 20 to 65 characters.",
      details: title ? `Current length: ${title.length} characters.` : undefined,
    },
    {
      id: "seo-meta-description",
      label: "Meta description is present",
      passed: Boolean(
        metaDescription &&
          metaDescription.length >= 70 &&
          metaDescription.length <= 170,
      ),
      weight: 5,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Add a concise meta description that summarizes the page for crawlers and humans.",
      details: metaDescription
        ? `Current length: ${metaDescription.length} characters.`
        : undefined,
    },
    {
      id: "seo-single-h1",
      label: "Page uses a single clear H1",
      passed: h1Headings.length === 1 && h1Headings[0].length >= 3,
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Use one clear H1 heading that anchors the page's main topic.",
      details:
        h1Headings.length > 0
          ? `Detected ${h1Headings.length} H1 heading(s).`
          : undefined,
    },
    {
      id: "seo-canonical",
      label: "Canonical URL is declared",
      passed: Boolean(canonical),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Add a canonical link to clarify the preferred version of the page.",
      details: canonical ? `Detected canonical: ${canonical}` : undefined,
    },
    {
      id: "seo-lang",
      label: "HTML language attribute is set",
      passed: Boolean(lang),
      weight: 3,
      category: "seoBasics",
      impact: "low",
      recommendation:
        "Set the HTML lang attribute so search engines and models can infer the content language more reliably.",
      details: lang ? `Detected language: ${lang}` : undefined,
    },
  ];

  return {
    seoBasics,
    checks,
  };
}
