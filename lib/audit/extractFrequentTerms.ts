import type { FrequentTerm } from "@/lib/audit/types";

const STOPWORDS = new Set([
  "aber",
  "about",
  "after",
  "alle",
  "also",
  "am",
  "an",
  "and",
  "are",
  "auch",
  "auf",
  "aus",
  "bei",
  "before",
  "between",
  "can",
  "dann",
  "das",
  "dass",
  "dem",
  "den",
  "der",
  "des",
  "die",
  "dies",
  "diese",
  "dieser",
  "dieses",
  "doch",
  "does",
  "doing",
  "durch",
  "each",
  "eine",
  "einem",
  "einen",
  "einer",
  "eines",
  "euch",
  "euer",
  "eure",
  "for",
  "from",
  "für",
  "habt",
  "have",
  "hier",
  "http",
  "https",
  "ihr",
  "ihre",
  "ihren",
  "ihres",
  "into",
  "ist",
  "it",
  "itself",
  "jede",
  "jeder",
  "jedes",
  "kann",
  "keine",
  "mehr",
  "mit",
  "nach",
  "nicht",
  "oder",
  "our",
  "ours",
  "ourselves",
  "over",
  "same",
  "sehr",
  "sein",
  "seine",
  "seiner",
  "sich",
  "sie",
  "sind",
  "some",
  "than",
  "that",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "through",
  "und",
  "uns",
  "unser",
  "unsere",
  "unter",
  "very",
  "von",
  "war",
  "were",
  "when",
  "while",
  "with",
  "wir",
  "wird",
  "you",
  "your",
  "yours",
]);

interface CountEntry {
  count: number;
  firstIndex: number;
}

export function extractFrequentTerms(text: string): FrequentTerm[] {
  const tokens = tokenize(text);

  if (tokens.length === 0) {
    return [];
  }

  const counts = new Map<string, CountEntry>();

  tokens.forEach((token, index) => {
    const existing = counts.get(token);

    if (existing) {
      existing.count += 1;
      return;
    }

    counts.set(token, {
      count: 1,
      firstIndex: index,
    });
  });

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1].count !== left[1].count) {
        return right[1].count - left[1].count;
      }

      return left[1].firstIndex - right[1].firstIndex;
    })
    .slice(0, 20)
    .map(([term, entry]) => ({
      term,
      count: entry.count,
      share: Number(((entry.count / tokens.length) * 100).toFixed(1)),
    }));
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 && !STOPWORDS.has(token) && !/^\d+$/.test(token),
    );
}
