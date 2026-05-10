import type { AuditCheck, ParsedHtml, SeoBasics } from "@/lib/audit/types";

const stopwords = new Set([
  "about",
  "after",
  "alle",
  "also",
  "auch",
  "been",
  "because",
  "between",
  "dabei",
  "diese",
  "dieser",
  "does",
  "eine",
  "einen",
  "einer",
  "eines",
  "from",
  "have",
  "into",
  "keine",
  "mehr",
  "oder",
  "over",
  "seit",
  "sind",
  "that",
  "their",
  "there",
  "they",
  "this",
  "über",
  "under",
  "und",
  "unsere",
  "unser",
  "with",
  "your",
]);

export function checkContentClarity(
  parsed: ParsedHtml,
  seoBasics: SeoBasics,
): AuditCheck[] {
  const h1 = seoBasics.h1Headings[0] ?? "";
  const titleTerms = tokenize(seoBasics.title ?? "");
  const normalizedBody = parsed.cleanText.toLowerCase();
  const overlappingTitleTerms = titleTerms.filter((term) =>
    normalizedBody.includes(term),
  );

  return [
    {
      id: "content-word-count",
      label: "Page has enough body copy",
      passed: parsed.wordCount >= 250,
      weight: 7,
      category: "contentClarity",
      impact: "high",
      recommendation:
        "Add enough visible body copy to explain the topic, offering and context of the page.",
      details:
        parsed.wordCount > 0 ? `Estimated word count: ${parsed.wordCount}.` : undefined,
    },
    {
      id: "content-clear-h1",
      label: "Primary heading is clear",
      passed: h1.length >= 10 && h1.length <= 80,
      weight: 5,
      category: "contentClarity",
      impact: "high",
      recommendation:
        "Write a precise H1 that clearly states the page topic or offer.",
      details: h1 ? `Detected H1: ${h1}` : undefined,
    },
    {
      id: "content-heading-structure",
      label: "Supporting heading structure is present",
      passed: seoBasics.h2Count >= 2,
      weight: 5,
      category: "contentClarity",
      impact: "medium",
      recommendation:
        "Use supporting H2 sections to break the topic into machine-readable subtopics.",
      details:
        seoBasics.h2Count > 0
          ? `Detected ${seoBasics.h2Count} H2 heading(s).`
          : undefined,
    },
    {
      id: "content-paragraph-depth",
      label: "Content is broken into multiple paragraphs",
      passed: parsed.paragraphCount >= 3,
      weight: 4,
      category: "contentClarity",
      impact: "medium",
      recommendation:
        "Split content into multiple readable paragraphs to improve scannability and context extraction.",
      details:
        parsed.paragraphCount > 0
          ? `Detected ${parsed.paragraphCount} paragraph(s).`
          : undefined,
    },
    {
      id: "content-title-body-alignment",
      label: "Title terms are reflected in the body",
      passed: overlappingTitleTerms.length >= 2,
      weight: 4,
      category: "contentClarity",
      impact: "medium",
      recommendation:
        "Align visible copy with the title so the main topic is reinforced in the body text.",
      details:
        overlappingTitleTerms.length > 0
          ? `Matching title terms: ${overlappingTitleTerms.join(", ")}`
          : undefined,
    },
  ];
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) => token.length >= 4 && !stopwords.has(token) && !/^\d+$/.test(token),
    );
}
