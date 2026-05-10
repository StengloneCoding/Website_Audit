import type { AuditCheck, ParsedHtml, SeoBasics } from "@/lib/audit/types";

const STOPWORDS = new Set([
  "about",
  "after",
  "alle",
  "also",
  "am",
  "an",
  "and",
  "auch",
  "auf",
  "aus",
  "bei",
  "because",
  "between",
  "das",
  "dass",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "diese",
  "dieser",
  "dieses",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "for",
  "fuer",
  "für",
  "from",
  "have",
  "into",
  "mehr",
  "mit",
  "nach",
  "oder",
  "our",
  "over",
  "that",
  "their",
  "there",
  "these",
  "this",
  "über",
  "und",
  "unsere",
  "unser",
  "unter",
  "when",
  "with",
  "your",
]);

const SERVICE_PATTERNS = [
  "seo audit",
  "seo-audit",
  "content-strategie",
  "content strategy",
  "content-strategy",
  "technische seo",
  "technical seo",
  "beratung",
  "consulting",
  "relaunch",
  "migration",
  "informationsarchitektur",
  "information architecture",
  "interne verlinkung",
  "internal linking",
  "analyse",
  "audit",
  "audits",
  "strategie",
];

const CONTACT_HINTS = ["contact", "kontakt", "demo", "book", "termin", "call"];

export function checkContentClarity(
  parsed: ParsedHtml,
  seoBasics: SeoBasics,
): AuditCheck[] {
  const title = seoBasics.title ?? "";
  const h1 = seoBasics.h1Headings[0] ?? "";
  const bodyText = parsed.cleanText;
  const lowerBody = bodyText.toLowerCase();
  const titleTerms = new Set(tokenize(title));
  const h1Terms = new Set(tokenize(h1));
  const bodyTerms = new Set(tokenize(bodyText));
  const titleBodyOverlap = intersect(titleTerms, bodyTerms);
  const h1BodyOverlap = intersect(h1Terms, bodyTerms);
  const sharedTopicTerms = uniqueStrings([
    ...titleBodyOverlap,
    ...h1BodyOverlap,
    ...intersect(titleTerms, h1Terms),
  ]);
  const serviceMatches = SERVICE_PATTERNS.filter((phrase) =>
    lowerBody.includes(phrase),
  );
  const contactLinks = parsed
    .$("a[href]")
    .toArray()
    .map((element) => {
      const href = parsed.$(element).attr("href")?.toLowerCase() ?? "";
      const text = parsed.$(element).text().toLowerCase();

      return `${href} ${text}`.trim();
    });
  const hasContactOption =
    contactLinks.some(
      (value) =>
        value.includes("mailto:") ||
        value.includes("tel:") ||
        CONTACT_HINTS.some((hint) => value.includes(hint)),
    ) ||
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(bodyText) ||
    /(?:\+\d[\d\s()./-]{6,}\d|\b\d{3,4}[\s/-]?\d{5,}\b)/.test(bodyText);
  const questionLikeBlocks = parsed
    .$("h2, h3, summary, dt, p, li, button")
    .toArray()
    .map((element) => parsed.$(element).text().replace(/\s+/g, " ").trim())
    .filter((textValue) => /\?$/.test(textValue));
  const faqHeadingText = parsed
    .$("h2, h3, summary, strong")
    .toArray()
    .map((element) => parsed.$(element).text().toLowerCase().trim());
  const hasFaqSignal =
    faqHeadingText.some(
      (textValue) =>
        textValue.includes("faq") || textValue.includes("häufige fragen"),
    ) || questionLikeBlocks.length >= 2;
  const hasTopicAlignment =
    Boolean(title && h1) &&
    titleBodyOverlap.length >= 1 &&
    h1BodyOverlap.length >= 1 &&
    sharedTopicTerms.length >= 2;

  return [
    {
      id: "content-topic-alignment",
      label: "Title, H1 and body reinforce the same topic",
      passed: hasTopicAlignment,
      weight: 6,
      category: "contentClarity",
      impact: "high",
      recommendation:
        "Align title, H1 and visible copy around the same few topic terms so the page theme is unmistakable.",
      details:
        sharedTopicTerms.length > 0
          ? `Shared topic terms: ${sharedTopicTerms.join(", ")}`
          : undefined,
    },
    {
      id: "content-sufficient-copy",
      label: "Page includes enough visible explanatory text",
      passed: parsed.wordCount >= 80,
      weight: 6,
      category: "contentClarity",
      impact: "high",
      recommendation:
        "Add more visible copy that explains the offer, context and user value of the page.",
      details:
        parsed.wordCount > 0 ? `Estimated word count: ${parsed.wordCount}.` : undefined,
    },
    {
      id: "content-concrete-services",
      label: "Concrete services are described",
      passed: uniqueStrings(serviceMatches).length >= 2,
      weight: 5,
      category: "contentClarity",
      impact: "high",
      recommendation:
        "Name concrete services or deliverables instead of relying on broad value statements alone.",
      details:
        serviceMatches.length > 0
          ? `Detected service terms: ${uniqueStrings(serviceMatches).join(", ")}`
          : undefined,
    },
    {
      id: "content-contact-options",
      label: "A contact option is visible",
      passed: hasContactOption,
      weight: 4,
      category: "contentClarity",
      impact: "medium",
      recommendation:
        "Expose an email, phone number or contact path so users and crawlers can identify a next step.",
    },
    {
      id: "content-faq-signal",
      label: "FAQ-style content is present",
      passed: hasFaqSignal,
      weight: 4,
      category: "contentClarity",
      impact: "medium",
      recommendation:
        "Add FAQ-style content or direct question-and-answer sections to clarify intent and terminology.",
      details:
        questionLikeBlocks.length > 0
          ? `Detected questions: ${questionLikeBlocks.slice(0, 3).join(" | ")}`
          : undefined,
    },
  ];
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 &&
        !STOPWORDS.has(token) &&
        !/^\d+$/.test(token),
    );
}

function intersect(left: Set<string>, right: Set<string>) {
  return [...left].filter((term) => right.has(term));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}
