import type { FrequentTerm } from "@/lib/audit/types";

const stopwords = new Set([
  "aber",
  "about",
  "after",
  "also",
  "auch",
  "because",
  "before",
  "between",
  "dann",
  "dass",
  "deine",
  "deiner",
  "deines",
  "diese",
  "dieser",
  "dieses",
  "durch",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "from",
  "have",
  "into",
  "kann",
  "mehr",
  "nach",
  "oder",
  "seine",
  "seiner",
  "seines",
  "sind",
  "that",
  "their",
  "there",
  "these",
  "this",
  "über",
  "unser",
  "unsere",
  "unter",
  "very",
  "when",
  "with",
  "your",
]);

export function extractFrequentTerms(text: string): FrequentTerm[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) => token.length >= 4 && !stopwords.has(token) && !/^\d+$/.test(token),
    );

  if (tokens.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, 12)
    .map(([term, count]) => ({
      term,
      count,
      share: Number(((count / tokens.length) * 100).toFixed(1)),
    }));
}
