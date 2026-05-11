import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignalList } from "@/components/SignalList";
import type { AuditCheck } from "@/lib/audit/types";

const checks: AuditCheck[] = [
  {
    id: "content-topic-alignment",
    label: "Title, H1 und Fließtext stärken dasselbe Thema",
    passed: true,
    weight: 6,
    category: "contentClarity",
    impact: "high",
    recommendation: "Richte Title, H1 und Text an denselben Themen aus.",
    details: "Gemeinsame Themenbegriffe: audit, seo",
  },
];

describe("SignalList", () => {
  it("renders an empty list state sensibly", () => {
    render(
      <SignalList
        title="Starke Signale"
        subtitle="Bereiche mit gutem Kontext."
        checks={[]}
        variant="positive"
      />,
    );

    expect(
      screen.getByText(
        "Im aktuellen Snapshot wurden noch keine starken Signale hervorgehoben.",
      ),
    ).toBeInTheDocument();
  });

  it("renders signals with icon-related context text", () => {
    render(
      <SignalList
        title="Schwache Signale"
        subtitle="Bereiche mit Lücken."
        checks={checks}
        variant="negative"
      />,
    );

    expect(
      screen.getByText("Title, H1 und Fließtext stärken dasselbe Thema"),
    ).toBeInTheDocument();
    expect(screen.getByText("Hohe Wirkung")).toBeInTheDocument();
    expect(screen.getByText("Inhaltsklarheit")).toBeInTheDocument();
    expect(
      screen.getByText("Richte Title, H1 und Text an denselben Themen aus."),
    ).toBeInTheDocument();
  });
});
