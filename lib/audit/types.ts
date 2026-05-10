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
  seoBasics: "SEO Basics",
  contentClarity: "Content Clarity",
  entitySignals: "Entity Signals",
  structuredData: "Structured Data",
  technicalAccessibility: "Technical Accessibility",
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

export interface ValidatedUrl {
  input: string;
  normalizedUrl: string;
  hostname: string;
  url: URL;
}

export interface PageFetchResult {
  inputUrl: string;
  finalUrl: string;
  html: string;
  status: number;
  contentType: string | null;
  htmlBytes: number;
  responseTimeMs: number;
  redirectCount: number;
}

export interface ParsedHtml {
  $: CheerioAPI;
  cleanText: string;
  wordCount: number;
  paragraphCount: number;
}

export interface SeoBasics {
  title: string | null;
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

export interface JsonLdExtractionResult {
  items: JsonLdNode[];
  invalidBlocks: number;
  rawBlockCount: number;
  types: string[];
}

export interface StructuredDataSummary {
  rawBlockCount: number;
  validItemCount: number;
  invalidBlockCount: number;
  types: string[];
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

export interface TechnicalSummary {
  status: number;
  contentType: string | null;
  responseTimeMs: number;
  htmlBytes: number;
  redirectCount: number;
}

export interface AuditResult {
  inputUrl: string;
  finalUrl: string;
  analyzedAt: string;
  score: number;
  categoryBreakdown: CategoryScore[];
  checks: AuditCheck[];
  strongSignals: AuditCheck[];
  weakSignals: AuditCheck[];
  issues: AuditCheck[];
  recommendations: string[];
  frequentTerms: FrequentTerm[];
  schemaSummary: StructuredDataSummary;
  seoBasics: SeoBasics;
  technical: TechnicalSummary;
}
