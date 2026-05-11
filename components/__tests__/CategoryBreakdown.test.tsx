import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import type { CategoryScore } from "@/lib/audit/types";

const categories: CategoryScore[] = [
  {
    category: "seoBasics",
    label: "SEO-Basics",
    score: 20,
    maxScore: 25,
    percentage: 80,
    passedChecks: 4,
    totalChecks: 5,
  },
  {
    category: "contentClarity",
    label: "Inhaltsklarheit",
    score: 18,
    maxScore: 25,
    percentage: 72,
    passedChecks: 3,
    totalChecks: 5,
  },
  {
    category: "entitySignals",
    label: "Entitätssignale",
    score: 15,
    maxScore: 25,
    percentage: 60,
    passedChecks: 3,
    totalChecks: 5,
  },
  {
    category: "structuredData",
    label: "Strukturierte Daten",
    score: 10,
    maxScore: 15,
    percentage: 67,
    passedChecks: 2,
    totalChecks: 3,
  },
  {
    category: "technicalAccessibility",
    label: "Technische Zugänglichkeit",
    score: 8,
    maxScore: 10,
    percentage: 80,
    passedChecks: 2,
    totalChecks: 3,
  },
];

describe("CategoryBreakdown", () => {
  it("renders all categories", () => {
    render(<CategoryBreakdown categories={categories} />);

    for (const category of categories) {
      expect(screen.getByText(category.label)).toBeInTheDocument();
      expect(
        screen.getByText(`${category.score} / ${category.maxScore}`),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole("listitem")).toHaveLength(categories.length);
  });
});
