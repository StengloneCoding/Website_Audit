import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SchemaSummary } from "@/components/SchemaSummary";

describe("SchemaSummary", () => {
  it("shows found schema types", () => {
    render(
      <SchemaSummary
        summary={{
          rawBlockCount: 2,
          validItemCount: 2,
          invalidBlockCount: 0,
        }}
        schemaTypes={["Organization", "WebSite"]}
      />,
    );

    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByText("WebSite")).toBeInTheDocument();
    expect(screen.getAllByText("2")).toHaveLength(2);
  });

  it("shows the no-schema hint", () => {
    render(
      <SchemaSummary
        summary={{
          rawBlockCount: 0,
          validItemCount: 0,
          invalidBlockCount: 0,
        }}
        schemaTypes={[]}
      />,
    );

    expect(
      screen.getByText(/Es wurden keine parsebaren schema.org-Typen erkannt/i),
    ).toBeInTheDocument();
  });
});
