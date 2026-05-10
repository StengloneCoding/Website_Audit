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
  const internalLinksCount = links.filter((link) =>
    isInternalLink(parsed.$(link).attr("href")),
  ).length;
  const externalLinksCount = links.filter((link) =>
    isExternalLink(parsed.$(link).attr("href")),
  ).length;
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
      label: "Ein Title-Tag ist vorhanden",
      passed: Boolean(title),
      weight: 5,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Ergänze ein eindeutiges Title-Tag, das Seitenthema und Geschäftskontext klar beschreibt.",
      details: title ? `Erkannter Titel: ${title}` : undefined,
    },
    {
      id: "seo-title-length",
      label: "Die Titellänge liegt in einem sinnvollen Bereich",
      passed: Boolean(title && title.length >= 15 && title.length <= 65),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Halte den Titel kurz und beschreibend, idealerweise zwischen 15 und 65 Zeichen.",
      details: title ? `Aktuelle Länge: ${title.length} Zeichen.` : undefined,
    },
    {
      id: "seo-description-present",
      label: "Eine Meta-Description ist vorhanden",
      passed: Boolean(description),
      weight: 4,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Ergänze eine Meta-Description, die die Seite klar und maschinenlesbar zusammenfasst.",
      details: description
        ? `Aktuelle Länge: ${description.length} Zeichen.`
        : undefined,
    },
    {
      id: "seo-h1-present",
      label: "Mindestens eine H1 ist vorhanden",
      passed: h1s.length > 0,
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Ergänze eine sichtbare H1-Überschrift, die Hauptthema oder Angebot der Seite benennt.",
      details:
        h1s.length > 0
          ? `${h1s.length} H1-Überschrift(en) erkannt.`
          : undefined,
    },
    {
      id: "seo-canonical-present",
      label: "Eine Canonical-URL ist gesetzt",
      passed: Boolean(canonical),
      weight: 4,
      category: "seoBasics",
      impact: "medium",
      recommendation:
        "Setze einen Canonical-Link, um die bevorzugte Seiten-URL für Crawler und KI-Systeme klarzustellen.",
      details: canonical ? `Canonical erkannt: ${canonical}` : undefined,
    },
    {
      id: "seo-noindex-not-set",
      label: "Robots-Meta blockiert die Indexierung nicht",
      passed: !hasNoindex,
      weight: 4,
      category: "seoBasics",
      impact: "high",
      recommendation:
        "Entferne noindex aus dem Robots-Meta-Tag, wenn diese Seite auffindbar bleiben soll.",
      details: robots ? `Erkannte Robots-Direktive: ${robots}` : undefined,
    },
    {
      id: "technical-text-sufficient",
      label: "Die Seite enthält genug sichtbaren Text",
      passed: textLength >= 200,
      weight: 4,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Ergänze mehr sichtbaren Text, damit Maschinen Seitenthema, Angebot und Kontext besser ableiten können.",
      details: `Sichtbare Textlänge: ${textLength} Zeichen.`,
    },
    {
      id: "technical-images-have-alt",
      label: "Bilder enthalten, wo sinnvoll, Alt-Texte",
      passed:
        imagesCount === 0 || imagesWithAltCount >= Math.ceil(imagesCount / 2),
      weight: 3,
      category: "technicalAccessibility",
      impact: "medium",
      recommendation:
        "Ergänze Alt-Texte bei informativen Bildern, damit ihr Kontext auch ohne Bildinhalt verständlich bleibt.",
      details:
        imagesCount > 0
          ? `${imagesWithAltCount} von ${imagesCount} Bild(ern) enthalten Alt-Text.`
          : "Auf der Seite wurden keine Bilder erkannt.",
    },
    {
      id: "technical-internal-links-present",
      label: "Die Seite enthält interne Links",
      passed: internalLinksCount > 0,
      weight: 3,
      category: "technicalAccessibility",
      impact: "low",
      recommendation:
        "Verlinke auf relevante interne Seiten, damit Crawler und Modelle den umgebenden Website-Kontext verfolgen können.",
      details: `${internalLinksCount} interne(s) Link(s) erkannt.`,
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
  const value =
    parsed.$(`meta[property="${property}"]`).attr("content")?.trim() ?? "";
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
