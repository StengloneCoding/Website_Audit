import {
  CATEGORY_LABELS,
  CATEGORY_MAX_SCORES,
  CATEGORY_ORDER,
  type AuditCheck,
  type AuditImpact,
  type AuditIssue,
  type AuditMetadata,
  type AuditRecommendation,
  type AuditResult,
  type CategoryScore,
  type FrequentTerm,
  type StructuredDataSummary,
  type TechnicalMetadata,
} from "@/lib/audit/types";

const impactPriority: Record<AuditImpact, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

type CalculateScoreMetadataInput = Partial<
  Omit<AuditMetadata, "technical" | "structuredData">
> & {
  technical?: Partial<TechnicalMetadata>;
  structuredData?: Partial<StructuredDataSummary>;
};

export interface CalculateScoreInput {
  url: string;
  checks: AuditCheck[];
  frequentTerms?: FrequentTerm[];
  schemaTypes?: string[];
  metadata?: CalculateScoreMetadataInput;
}

export function calculateScore({
  url,
  checks,
  frequentTerms = [],
  schemaTypes = [],
  metadata,
}: CalculateScoreInput): AuditResult {
  const scoredCategories = CATEGORY_ORDER.map((category) => {
    const categoryChecks = checks.filter((check) => check.category === category);
    const maxScore = CATEGORY_MAX_SCORES[category];
    const totalWeight = categoryChecks.reduce(
      (sum, check) => sum + normalizeWeight(check.weight),
      0,
    );
    const passedWeight = categoryChecks.reduce(
      (sum, check) =>
        check.passed ? sum + normalizeWeight(check.weight) : sum,
      0,
    );
    const rawScore =
      totalWeight === 0 ? 0 : clamp((passedWeight / totalWeight) * maxScore, 0, maxScore);
    const score = roundToOneDecimal(rawScore);

    return {
      rawScore,
      categoryScore: {
        category,
        label: CATEGORY_LABELS[category],
        score,
        maxScore,
        percentage:
          totalWeight === 0 ? 0 : Math.round((passedWeight / totalWeight) * 100),
        passedChecks: categoryChecks.filter((check) => check.passed).length,
        totalChecks: categoryChecks.length,
      } satisfies CategoryScore,
    };
  });

  const sortedChecks = [...checks].sort(sortChecksByPriority);
  const strongSignals = sortedChecks.filter((check) => check.passed);
  const weakSignals = sortedChecks.filter((check) => !check.passed);
  const issues = weakSignals
    .filter((check) => check.impact === "high" || check.impact === "medium")
    .map(mapCheckToIssue);
  const recommendations = buildRecommendations(weakSignals);
  const score = clamp(
    Math.round(scoredCategories.reduce((sum, entry) => sum + entry.rawScore, 0)),
    0,
    100,
  );

  return {
    url,
    score,
    categories: scoredCategories.map((entry) => entry.categoryScore),
    strongSignals,
    weakSignals,
    issues,
    recommendations,
    frequentTerms,
    schemaTypes,
    metadata: buildMetadata(url, metadata),
    checks,
  };
}

function sortChecksByPriority(left: AuditCheck, right: AuditCheck) {
  if (impactPriority[right.impact] !== impactPriority[left.impact]) {
    return impactPriority[right.impact] - impactPriority[left.impact];
  }

  if (right.weight !== left.weight) {
    return right.weight - left.weight;
  }

  return left.label.localeCompare(right.label);
}

function mapCheckToIssue(check: AuditCheck): AuditIssue {
  return {
    id: check.id,
    label: check.label,
    category: check.category,
    impact: check.impact,
    weight: check.weight,
    recommendation: check.recommendation,
    details: check.details,
  };
}

function buildRecommendations(failedChecks: AuditCheck[]): AuditRecommendation[] {
  const seenRecommendations = new Set<string>();
  const recommendations: AuditRecommendation[] = [];

  for (const check of failedChecks) {
    const recommendationKey = check.recommendation.trim().toLowerCase();

    if (recommendationKey.length === 0 || seenRecommendations.has(recommendationKey)) {
      continue;
    }

    seenRecommendations.add(recommendationKey);
    recommendations.push({
      id: `recommendation-${check.id}`,
      label: check.label,
      text: check.recommendation,
      category: check.category,
      impact: check.impact,
      sourceCheckId: check.id,
    });
  }

  return recommendations;
}

function buildMetadata(
  url: string,
  metadata: CalculateScoreMetadataInput | undefined,
): AuditMetadata {
  return {
    analyzedAt: metadata?.analyzedAt ?? new Date().toISOString(),
    requestedUrl: metadata?.requestedUrl ?? url,
    finalUrl: metadata?.finalUrl ?? url,
    technical: {
      status: metadata?.technical?.status ?? 0,
      contentType: metadata?.technical?.contentType ?? null,
      responseTimeMs: metadata?.technical?.responseTimeMs ?? 0,
      htmlBytes: metadata?.technical?.htmlBytes ?? 0,
      redirectCount: metadata?.technical?.redirectCount ?? 0,
    },
    structuredData: {
      rawBlockCount: metadata?.structuredData?.rawBlockCount ?? 0,
      validItemCount: metadata?.structuredData?.validItemCount ?? 0,
      invalidBlockCount: metadata?.structuredData?.invalidBlockCount ?? 0,
    },
  };
}

function normalizeWeight(weight: number) {
  return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

function roundToOneDecimal(value: number) {
  return Number(value.toFixed(1));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
