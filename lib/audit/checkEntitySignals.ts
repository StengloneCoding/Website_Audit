import { extractFrequentTerms } from "@/lib/audit/extractFrequentTerms";
import type { AuditCheck, FrequentTerm, ParsedHtml } from "@/lib/audit/types";

const GENERIC_TERMS = new Set([
  "effizient",
  "efficient",
  "individuell",
  "innovation",
  "innovativ",
  "lösung",
  "loesung",
  "modern",
  "professionell",
  "professional",
  "qualität",
  "qualitaet",
  "quality",
  "reliable",
  "service",
  "solution",
  "zuverlässig",
  "zuverlaessig",
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
  "beratung",
  "analyse",
  "analysen",
  "audit",
  "audits",
  "webdesign",
  "website relaunch",
  "relaunch",
  "softwareentwicklung",
  "software development",
  "automation",
  "migration",
  "workshop",
  "strategie",
];

const AUDIENCE_PATTERNS = [
  /\b(?:für|for)\s+(?:b2b\s+)?(?:saas\s+)?(?:unternehmen|teams|brands|marketers|marketing-teams|founders|gründer|shops|praxen|kanzleien|scaleups|startups?)\b/iu,
  /\b(?:zielgruppe|target audience|kunden|kund:innen|clients?|unternehmen|teams|brands|marketers|marketing-teams|founders|gründer|mittelstand|kmu|saas|b2b)\b/iu,
];

const EXPERTISE_PATTERNS = [
  /\b(?:autor|author|consultant|berater|expert(?:e|in|s)?|specialist|founder|co-founder|gegründet von|zertifiziert|certified|jahre erfahrung|years? of experience|team|speaker|editorial)\b/iu,
  /\b[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+\b.{0,40}\b(?:consultant|berater|author|autor|founder|experte|expertin)\b/u,
];

const LOCATION_PATTERNS = [
  /\b(?:standort|sitz|büro|buero|office|based in|located in|serving|service area|für kunden in|kunden in|aus)\s+[A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2}\b/gu,
  /\b(?:in|aus|from)\s+[A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2}\b/gu,
  /\b\d{5}\s+[A-ZÄÖÜ][\p{L}-]+/gu,
];

const BRAND_EXCLUSION_TERMS = new Set([
  "agentur",
  "ai",
  "analysis",
  "audit",
  "b2b",
  "beratung",
  "content",
  "growth",
  "marketing",
  "readiness",
  "saas",
  "seo",
  "service",
  "signal",
  "strategy",
  "visibility",
  "websites",
]);

const GENERIC_WARNING =
  "Die wichtigsten Begriffe wirken generisch. Die Seite könnte klarere Entitäten, Leistungen und Standorte benennen.";

export function checkEntitySignals(
  parsed: ParsedHtml,
  _schemaTypes: string[],
  frequentTerms: FrequentTerm[] = extractFrequentTerms(parsed.cleanText),
): AuditCheck[] {
  const text = parsed.cleanText;
  const lowerText = text.toLowerCase();
  const serviceMatches = collectPhraseMatches(lowerText, SERVICE_PATTERNS);
  const audienceMatches = AUDIENCE_PATTERNS.filter((pattern) => pattern.test(text));
  const expertiseMatches = EXPERTISE_PATTERNS.filter((pattern) => pattern.test(text));
  const locationMatches = LOCATION_PATTERNS.flatMap((pattern) => [
    ...text.matchAll(pattern),
  ]);
  const recurringRelevantTerms = frequentTerms.filter(
    (term) => term.count >= 2 && !GENERIC_TERMS.has(term.term),
  );
  const dominantTerms = frequentTerms.slice(0, 5);
  const genericDominantTerms = dominantTerms.filter((term) =>
    GENERIC_TERMS.has(term.term),
  );
  const genericCount = genericDominantTerms.reduce(
    (sum, term) => sum + term.count,
    0,
  );
  const dominantCount = dominantTerms.reduce((sum, term) => sum + term.count, 0);
  const hasSpecificTerms =
    dominantTerms.length > 0 &&
    genericDominantTerms.length < 3 &&
    (dominantCount === 0 || genericCount / dominantCount < 0.6);
  const businessNameCandidates = extractBusinessNameCandidates(parsed);
  const hasBusinessName =
    /\b(?:gmbh|ag|ug|llc|ltd|inc|corp|corporation)\b/i.test(text) ||
    /(?:©|copyright)\s*(?:\d{4}\s*)?[A-ZÄÖÜ][\p{L}&.-]+(?:\s+[A-ZÄÖÜ][\p{L}&.-]+){0,3}/u.test(
      text,
    ) ||
    businessNameCandidates.some((candidate) => text.includes(candidate));

  return [
    {
      id: "entity-business-name-visible",
      label: "Business name is explicitly mentioned",
      passed: hasBusinessName,
      weight: 4,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Mention the business or brand name visibly in the page copy, hero, footer or contact context.",
      details:
        businessNameCandidates.length > 0
          ? `Brand-like headings or title segments: ${businessNameCandidates.join(", ")}`
          : undefined,
    },
    {
      id: "entity-location-signal",
      label: "Location or service area is recognizable",
      passed: locationMatches.length > 0,
      weight: 4,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Name a location, office, region or service area so crawlers can connect the business to a place.",
      details:
        locationMatches.length > 0
          ? `Detected location hints: ${uniqueStrings(locationMatches.map((match) => match[0])).join(", ")}`
          : undefined,
    },
    {
      id: "entity-services-signal",
      label: "Concrete services are named",
      passed: serviceMatches.length >= 2,
      weight: 4,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Name concrete services such as audits, consulting, strategy or implementation work.",
      details:
        serviceMatches.length > 0
          ? `Detected services: ${serviceMatches.join(", ")}`
          : undefined,
    },
    {
      id: "entity-audience-signal",
      label: "Target audience is recognizable",
      passed: audienceMatches.length > 0,
      weight: 4,
      category: "entitySignals",
      impact: "medium",
      recommendation:
        "State who the page is for, for example B2B SaaS teams, founders or local businesses.",
    },
    {
      id: "entity-expertise-signal",
      label: "Author, person or expertise signals are visible",
      passed: expertiseMatches.length > 0,
      weight: 4,
      category: "entitySignals",
      impact: "high",
      recommendation:
        "Add visible people, author or expertise cues such as a founder, team, credentials or years of experience.",
    },
    {
      id: "entity-recurring-terms",
      label: "Recurring relevant terms reinforce the topic",
      passed: recurringRelevantTerms.length >= 2,
      weight: 3,
      category: "entitySignals",
      impact: "medium",
      recommendation:
        "Repeat a few relevant terms naturally so the page reinforces its main entities and services.",
      details:
        recurringRelevantTerms.length > 0
          ? `Recurring terms: ${recurringRelevantTerms
              .slice(0, 5)
              .map((term) => `${term.term} (${term.count})`)
              .join(", ")}`
          : undefined,
    },
    {
      id: "entity-specific-terms",
      label: "Top recurring terms are specific rather than generic",
      passed: hasSpecificTerms,
      weight: 2,
      category: "entitySignals",
      impact: "medium",
      recommendation: GENERIC_WARNING,
      details:
        genericDominantTerms.length > 0
          ? `Generic dominant terms: ${genericDominantTerms
              .map((term) => `${term.term} (${term.count})`)
              .join(", ")}`
          : undefined,
    },
  ];
}

function collectPhraseMatches(text: string, phrases: string[]) {
  const matches = phrases.filter((phrase) => text.includes(phrase));
  return uniqueStrings(matches);
}

function extractBusinessNameCandidates(parsed: ParsedHtml) {
  const title = parsed.$("title").first().text().trim();
  const headingTexts = parsed
    .$("h1, h2, h3, strong, b")
    .toArray()
    .map((element) => parsed.$(element).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return uniqueStrings([
    ...splitBrandCandidates(title),
    ...headingTexts.flatMap((heading) => splitBrandCandidates(heading)),
  ]);
}

function splitBrandCandidates(value: string) {
  return value
    .split(/[|–—-]/)
    .map((segment) => segment.trim())
    .filter((segment) => isBrandLikeSegment(segment));
}

function isBrandLikeSegment(segment: string) {
  const words = segment.split(/\s+/).filter(Boolean);

  if (words.length === 0 || words.length > 4) {
    return false;
  }

  const normalizedWords = words.map((word) =>
    word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ""),
  );

  if (
    normalizedWords.every(
      (word) => BRAND_EXCLUSION_TERMS.has(word) || GENERIC_TERMS.has(word),
    )
  ) {
    return false;
  }

  return words.every((word) => /^[A-ZÄÖÜ0-9][\p{L}&.-]*$/u.test(word));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}
