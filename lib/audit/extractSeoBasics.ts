import type { AuditCheck, ParsedHtml, SeoBasics } from "@/lib/audit/types";

export function extractSeoBasics(parsed: ParsedHtml): {
  seoBasics: SeoBasics;
  checks: AuditCheck[];
} {
  const title = getTrimmedText(parsed, "title");
  const description = getMetaContent(parsed, "description");
  const canonical = getCanonicalHref(parsed);
  const robots = getMetaContent(parsed, "robots");
  const ogTitle = getMetaProperty(parsed, "og:title");
  const ogDescription = getMetaProperty(parsed, "og:description");
  const lang = parsed.$("html").attr("lang")?.trim() || null;
  const viewport = getMetaContent(parsed, "viewport");
  const h1s = parsed
    .$("h1")
    .toArray()
    .map((element) => parsed.$(element).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const h2Count = parsed.$("h2").length;
  const links = parsed.$("a[href]").toArray();
  const internalLinksCount = links.filter((link) => isInternalLink(parsed.$(link).attr("href"))).length;
  const externalLinksCount = links.filter((link) => isExternalLink(parsed.$(link).attr("href"))).length;
  const images = parsed.$("img").toArray();
  const imagesCount = images.length;
  const imagesWithAltCount = images.filter((image) => {
    const alt = parsed.$(image).attr("alt");
    return typeof alt === "string" && alt.trim().length > 0;
  }).length;
  const textLength = parsed.visibleText.length;
  const titleLength = title?.length ?? 0;
  const metaDescriptionLength = description?.length ?? 0;
  const hasNoindex = typeof robots === "string" && /\bnoindex\b/i.test(robots);

  const seoBasics: SeoBasics = {
    title,
    description,
    h1s,
    ogTitle,
    ogDescription,
    internalLinksCount,
    externalLinksCount,
    imagesCount,
    imagesWithAltCount,
    textLength,
    titleLength,
    metaDescription: description,
    metaDescriptionLength,
    canonical,
    robots,
    lang,
    viewport,
    h1Headings: h1s,
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
        "Add a unique title tag that clearly explains the page topic and business context.",
      details: title ? `Detected title: ${title}` : undefined,
    },
    {
      id: "seo-title-length",
      label: "Title length is within a useful range",
      passed: Boolean(title && title.length >= 15 && title.length <= 65),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Keep the title concise but descriptive, ideally somewhere between 15 and 65 characters.",
      details: title ? `Current length: ${title.length} characters.` : undefined,
    },
    {
      id: "seo-description-present",
      label: "Meta description is present",
      passed: Boolean(description),
      weight: 4,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Add a meta description that summarizes the page in a clear, machine-readable way.",
      details: description
        ? `Current length: ${description.length} characters.`
        : undefined,
    },
    {
      id: "seo-h1-present",
      label: "At least one H1 is present",
      passed: h1s.length > 0,
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Add a visible H1 heading that states the main topic or offer of the page.",
      details: h1s.length > 0 ? `Detected ${h1s.length} H1 heading(s).` : undefined,
    },
    {
      id: "seo-canonical-present",
      label: "Canonical URL is declared",
      passed: Boolean(canonical),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Add a canonical link to clarify the preferred page URL for crawlers and AI systems.",
      details: canonical ? `Detected canonical: ${canonical}` : undefined,
    },
    {
      id: "seo-noindex-not-set",
      label: "Robots meta does not block indexing",
      passed: !hasNoindex,
      weight: 4,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Remove noindex from the robots meta tag if this page should remain discoverable.",
      details: robots ? `Detected robots directive: ${robots}` : undefined,
    },
    {
      id: "technical-text-sufficient",
      label: "Page contains enough visible text",
      passed: textLength >= 200,
      weight: 4,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Add more visible copy so machines can infer the page topic, offer and surrounding context.",
      details: `Visible text length: ${textLength} characters.`,
    },
    {
      id: "technical-images-have-alt",
      label: "Images include alt text where relevant",
      passed: imagesCount === 0 || imagesWithAltCount >= Math.ceil(imagesCount / 2),
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Add alt text to informative images so their context remains understandable beyond the pixels.",
      details:
        imagesCount > 0
          ? `${imagesWithAltCount} of ${imagesCount} image(s) include alt text.`
          : "No images were detected on the page.",
    },
    {
      id: "technical-internal-links-present",
      label: "Page includes internal links",
      passed: internalLinksCount > 0,
      weight: 3,
      category: "technicalAccessibility",
      impact: "low",
      recommendation:
        "Link to related internal pages so crawlers and models can follow the surrounding site context.",
      details: `Detected ${internalLinksCount} internal link(s).`,
    },
  ];

  return {
    seoBasics,
    checks,
  };
}

function getTrimmedText(parsed: ParsedHtml, selector: string) {
  const value = parsed.$(selector).first().text().trim();
  return value.length > 0 ? value : null;
}

function getMetaContent(parsed: ParsedHtml, name: string) {
  const value = parsed.$(`meta[name="${name}"]`).attr("content")?.trim() ?? "";
  return value.length > 0 ? value : null;
}

function getMetaProperty(parsed: ParsedHtml, property: string) {
  const value = parsed.$(`meta[property="${property}"]`).attr("content")?.trim() ?? "";
  return value.length > 0 ? value : null;
}

function getCanonicalHref(parsed: ParsedHtml) {
  const value = parsed.$('link[rel="canonical"]').attr("href")?.trim() ?? "";
  return value.length > 0 ? value : null;
}

function isExternalLink(href: string | undefined) {
  if (!href) {
    return false;
  }

  return /^(https?:)?\/\//i.test(href.trim());
}

function isInternalLink(href: string | undefined) {
  if (!href) {
    return false;
  }

  const normalized = href.trim().toLowerCase();

  if (
    normalized.length === 0 ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("javascript:")
  ) {
    return false;
  }

  if (isExternalLink(normalized)) {
    return false;
  }

  return (
    normalized.startsWith("/") ||
    normalized.startsWith("#") ||
    normalized.startsWith("?") ||
    !normalized.includes(":")
  );
}
