import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreCard } from "@/components/ScoreCard";

describe("ScoreCard", () => {
  it("renders the score and audited URL", () => {
    render(
      <ScoreCard
        score={78}
        analyzedAt="2026-05-10T09:30:00.000Z"
        url="https://example.com"
      />,
    );

    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText("Readiness-Signale, keine Rankings")).toBeInTheDocument();
  });
});
