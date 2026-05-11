import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreCard } from "@/components/ScoreCard";

describe("ScoreCard", () => {
  it("renders the score correctly", () => {
    render(<ScoreCard score={78} />);

    expect(screen.getByText("78")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Readiness-Score 78 von 100"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Readiness-Signale, keine Rankings"),
    ).toBeInTheDocument();
  });

  it("shows the low-score state", () => {
    render(<ScoreCard score={42} />);

    expect(screen.getAllByText("Verbesserung nötig")).toHaveLength(2);
    expect(screen.getByText("Scorebereich 0-59")).toBeInTheDocument();
  });

  it("shows the medium-score state", () => {
    render(<ScoreCard score={68} />);

    expect(screen.getAllByText("Gute Ausgangsbasis")).toHaveLength(2);
    expect(screen.getByText("Scorebereich 60-79")).toBeInTheDocument();
  });

  it("shows the high-score state", () => {
    render(<ScoreCard score={91} />);

    expect(screen.getAllByText("Hohe Readiness")).toHaveLength(2);
    expect(screen.getByText("Scorebereich 80-100")).toBeInTheDocument();
  });
});
