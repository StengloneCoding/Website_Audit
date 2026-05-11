import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FrequentTerms } from "@/components/FrequentTerms";

describe("FrequentTerms", () => {
  it("renders terms and counts", () => {
    render(
      <FrequentTerms
        terms={[
          { term: "audit", count: 4, share: 12.5 },
          { term: "seo", count: 3, share: 9.4 },
        ]}
      />,
    );

    expect(screen.getByText("audit")).toBeInTheDocument();
    expect(screen.getByText("4x")).toBeInTheDocument();
    expect(screen.getByText("seo")).toBeInTheDocument();
    expect(screen.getByText("3x")).toBeInTheDocument();
  });
});
