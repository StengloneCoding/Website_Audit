import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IssueList } from "@/components/IssueList";
import type { AuditIssue } from "@/lib/audit/types";

const issues: AuditIssue[] = [
  {
    id: "low-issue",
    label: "Kleinere Unschärfe",
    category: "seoBasics",
    impact: "low",
    weight: 1,
    recommendation: "Kleine Optimierung.",
  },
  {
    id: "high-issue",
    label: "Kritischer Blocker",
    category: "structuredData",
    impact: "high",
    weight: 4,
    recommendation: "JSON-LD ergänzen.",
    details: "Es wurden keine parsebaren Schema-Typen erkannt.",
  },
];

describe("IssueList", () => {
  it("renders issues correctly", () => {
    render(<IssueList issues={issues} />);

    expect(screen.getByText("Kritischer Blocker")).toBeInTheDocument();
    expect(screen.getByText("Kleinere Unschärfe")).toBeInTheDocument();
    expect(screen.getByText("JSON-LD ergänzen.")).toBeInTheDocument();
    expect(screen.getByText("Hohe Wirkung")).toBeInTheDocument();
  });

  it("prioritizes important issues visibly", () => {
    render(<IssueList issues={issues} />);

    const listItems = screen.getAllByRole("listitem");

    expect(within(listItems[0]!).getByText("Kritischer Blocker")).toBeInTheDocument();
    expect(within(listItems[1]!).getByText("Kleinere Unschärfe")).toBeInTheDocument();
  });
});
