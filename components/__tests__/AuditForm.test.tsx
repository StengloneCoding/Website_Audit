import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuditForm } from "@/components/AuditForm";

describe("AuditForm", () => {
  it("renders the input and submit button", () => {
    render(
      <AuditForm onSubmit={vi.fn()} isLoading={false} error={null} />,
    );

    expect(screen.getByLabelText("Website-URL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Website analysieren" }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with the entered URL", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<AuditForm onSubmit={onSubmit} isLoading={false} error={null} />);

    fireEvent.change(screen.getByLabelText("Website-URL"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Website analysieren" }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("https://example.com");
    });
  });

  it("shows the loading state and disables the button", () => {
    render(
      <AuditForm onSubmit={vi.fn()} isLoading error={null} />,
    );

    expect(
      screen.getByRole("button", { name: "Analysiere Website" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Website-URL")).toBeDisabled();
  });

  it("shows the error state", () => {
    render(
      <AuditForm
        onSubmit={vi.fn()}
        isLoading={false}
        error="Die Website konnte nicht erreicht werden."
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Die Website konnte nicht erreicht werden."),
    ).toBeInTheDocument();
  });
});
