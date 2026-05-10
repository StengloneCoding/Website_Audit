import {
  CATEGORY_LABELS,
  CATEGORY_MAX_SCORES,
  CATEGORY_ORDER,
  type AuditCheck,
  type AuditImpact,
  type CategoryScore,
} from "@/lib/audit/types";

const impactPriority: Record<AuditImpact, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function calculateScore(checks: AuditCheck[]): {
  score: number;
  categoryBreakdown: CategoryScore[];
  strongSignals: AuditCheck[];
  weakSignals: AuditCheck[];
  issues: AuditCheck[];
  recommendations: string[];
} {
  const categoryBreakdown = CATEGORY_ORDER.map((category) => {
    const categoryChecks = checks.filter((check) => check.category === category);
    const maxScore = CATEGORY_MAX_SCORES[category];
    const totalWeight = categoryChecks.reduce(
      (sum, check) => sum + check.weight,
      0,
    );
    const passedWeight = categoryChecks
      .filter((check) => check.passed)
      .reduce((sum, check) => sum + check.weight, 0);
    const score =
      totalWeight === 0
        ? 0
        : Number(((passedWeight / totalWeight) * maxScore).toFixed(1));

    return {
      category,
      label: CATEGORY_LABELS[category],
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      passedChecks: categoryChecks.filter((check) => check.passed).length,
      totalChecks: categoryChecks.length,
    };
  });

  const sortedChecks = [...checks].sort(sortChecksByPriority);
  const strongSignals = sortedChecks.filter((check) => check.passed).slice(0, 6);
  const weakSignals = sortedChecks.filter((check) => !check.passed).slice(0, 6);
  const issues =
    sortedChecks
      .filter(
        (check) => !check.passed && (check.impact === "high" || check.weight >= 5),
      )
      .slice(0, 6) || [];
  const recommendations = Array.from(
    new Set(
      sortedChecks
        .filter((check) => !check.passed)
        .map((check) => check.recommendation),
    ),
  ).slice(0, 5);
  const score = Math.round(
    categoryBreakdown.reduce((sum, category) => sum + category.score, 0),
  );

  return {
    score,
    categoryBreakdown,
    strongSignals,
    weakSignals,
    issues: issues.length > 0 ? issues : weakSignals.slice(0, 4),
    recommendations,
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
