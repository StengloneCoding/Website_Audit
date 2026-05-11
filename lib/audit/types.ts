import type { CheerioAPI } from "cheerio";

export const CATEGORY_MAX_SCORES = {
  seoBasics: 25,
  contentClarity: 25,
  entitySignals: 25,
  structuredData: 15,
  technicalAccessibility: 10,
} as const;

export type AuditCategory = keyof typeof CATEGORY_MAX_SCORES;
export type AuditImpact = "low" | "medium" | "high";

export const CATEGORY_ORDER: AuditCategory[] = [
  "seoBasics",
  "contentClarity",
  "entitySignals",
  "structuredData",
  "technicalAccessibility",
];

export const CATEGORY_LABELS: Record<AuditCategory, string> = {
  seoBasics: "SEO-Basics",
  contentClarity: "Inhaltsklarheit",
  entitySignals: "Entitätssignale",
  structuredData: "Strukturierte Daten",
  technicalAccessibility: "Technische Zugänglichkeit",
};

export class AuditError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AuditError";
    this.statusCode = statusCode;
  }
}

export interface AuditCheck {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  category: AuditCategory;
  impact: AuditImpact;
  recommendation: string;
  details?: string;
}

export interface AuditIssue {
  id: string;
  label: string;
  category: AuditCategory;
  impact: AuditImpact;
  weight: number;
  recommendation: string;
  details?: string;
}

export interface AuditRecommendation {
  id: string;
  label: string;
  text: string;
  category: AuditCategory;
  impact: AuditImpact;
  sourceCheckId: string;
}

export interface ValidatedUrl {
  input: string;
  normalizedUrl: string;
  hostname: string;
  url: URL;
}

export interface FetchPageResult {
  requestedUrl: string;
  finalUrl: string;
  html: string;
  statusCode: number;
  status: number;
  contentType: string | null;
  htmlBytes: number;
  responseTimeMs: number;
  redirectCount: number;
}

export type PageFetchResult = FetchPageResult;

export interface ParsedHtml {
  $: CheerioAPI;
  visibleText: string;
  cleanText: string;
  wordCount: number;
  paragraphCount: number;
}

export interface SeoBasics {
  title: string | null;
  description: string | null;
  h1s: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesCount: number;
  imagesWithAltCount: number;
  textLength: number;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  viewport: string | null;
  h1Headings: string[];
  h2Count: number;
}

export type JsonLdNode = Record<string, unknown>;
export type JsonLdBlock = JsonLdNode | JsonLdNode[];

export interface InvalidJsonLdBlock {
  content: string;
  message: string;
}

export interface JsonLdParseResult {
  items: JsonLdNode[];
  validBlocks: JsonLdBlock[];
  invalidBlocks: InvalidJsonLdBlock[];
  invalidBlockCount: number;
  rawBlockCount: number;
  schemaTypes: string[];
}

export type JsonLdExtractionResult = JsonLdParseResult;

export interface StructuredDataSummary {
  rawBlockCount: number;
  validItemCount: number;
  invalidBlockCount: number;
}

export interface FrequentTerm {
  term: string;
  count: number;
  share: number;
}

export interface CategoryScore {
  category: AuditCategory;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  passedChecks: number;
  totalChecks: number;
}

export interface TechnicalMetadata {
  status: number;
  contentType: string | null;
  responseTimeMs: number;
  htmlBytes: number;
  redirectCount: number;
}

export interface AuditMetadata {
  analyzedAt: string;
  requestedUrl: string;
  finalUrl: string;
  technical: TechnicalMetadata;
  structuredData: StructuredDataSummary;
}

export interface AuditResult {
  url: string;
  score: number;
  categories: CategoryScore[];
  strongSignals: AuditCheck[];
  weakSignals: AuditCheck[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  frequentTerms: FrequentTerm[];
  schemaTypes: string[];
  metadata: AuditMetadata;
  checks: AuditCheck[];
}

export interface LeadTeaserPoint {
  title: string;
  impact: Exclude<AuditImpact, "low">;
  summary: string;
  teaserRecommendation: string;
}

export interface LeadTeaserCta {
  headline: string;
  text: string;
  buttonLabel: string;
  targetUrl: string;
}

export interface LeadTeaserResponse {
  url: string;
  score: number;
  criticalPoints: LeadTeaserPoint[];
  cta: LeadTeaserCta;
  disclaimer: string;
}
