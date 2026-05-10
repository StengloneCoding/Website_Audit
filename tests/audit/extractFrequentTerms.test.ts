import { describe, expect, it } from "vitest";
import { extractFrequentTerms } from "@/lib/audit/extractFrequentTerms";

describe("extractFrequentTerms", () => {
  it("removes german and english stopwords", () => {
    const terms = extractFrequentTerms(
      "The audit and the strategy for the website. Der Audit und die Strategie für die Website.",
    );

    expect(terms.map((term) => term.term)).toEqual([
      "audit",
      "website",
      "strategy",
      "strategie",
    ]);
    expect(terms.some((term) => term.term === "the")).toBe(false);
    expect(terms.some((term) => term.term === "und")).toBe(false);
    expect(terms.some((term) => term.term === "für")).toBe(false);
  });

  it("ignores tokens shorter than four characters", () => {
    const terms = extractFrequentTerms("seo ux ai app audit plan apps");

    expect(terms.map((term) => term.term)).toEqual(["audit", "plan", "apps"]);
    expect(terms.some((term) => term.term === "seo")).toBe(false);
  });

  it("counts frequencies correctly", () => {
    const terms = extractFrequentTerms(
      "audit audit signal service service service",
    );

    expect(terms[0]).toMatchObject({ term: "service", count: 3 });
    expect(terms[1]).toMatchObject({ term: "audit", count: 2 });
    expect(terms[2]).toMatchObject({ term: "signal", count: 1 });
  });

  it("returns the top 20 terms and keeps first-seen order on equal frequency", () => {
    const orderedTerms = extractFrequentTerms("zebra alpha mango delta");
    const manyTerms = extractFrequentTerms(
      Array.from(
        { length: 25 },
        (_, index) => `term${String(index + 1).padStart(2, "0")}`,
      ).join(" "),
    );

    expect(orderedTerms.map((term) => term.term)).toEqual([
      "zebra",
      "alpha",
      "mango",
      "delta",
    ]);
    expect(manyTerms).toHaveLength(20);
    expect(manyTerms[0]?.term).toBe("term01");
    expect(manyTerms.at(-1)?.term).toBe("term20");
  });

  it("supports german umlauts", () => {
    const terms = extractFrequentTerms("München münchen küchen küchen küchen");

    expect(terms[0]).toMatchObject({ term: "küchen", count: 3 });
    expect(terms[1]).toMatchObject({ term: "münchen", count: 2 });
  });

  it("removes punctuation before counting", () => {
    const terms = extractFrequentTerms("Audit, audit! Service? service.");

    expect(terms[0]).toMatchObject({ term: "audit", count: 2 });
    expect(terms[1]).toMatchObject({ term: "service", count: 2 });
  });
});
