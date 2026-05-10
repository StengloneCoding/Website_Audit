import { describe, expect, it } from "vitest";
import { parseHtml } from "@/lib/audit/parseHtml";

describe("parseHtml", () => {
  it("does not include script, style or noscript content in visibleText", () => {
    const parsed = parseHtml(`
      <html>
        <head>
          <style>.hero { color: red; }</style>
          <script>window.__SECRET__ = "hidden"</script>
        </head>
        <body>
          <h1>Visible heading</h1>
          <p>Visible paragraph.</p>
          <noscript>Fallback text that should not count.</noscript>
        </body>
      </html>
    `);

    expect(parsed.visibleText).toContain("Visible heading Visible paragraph.");
    expect(parsed.visibleText).not.toContain("window.__SECRET__");
    expect(parsed.visibleText).not.toContain(".hero");
    expect(parsed.visibleText).not.toContain("Fallback text");
  });

  it("normalizes visible text whitespace", () => {
    const parsed = parseHtml(`
      <body>
        <p>First line</p>
        <p>
          Second     line
        </p>
        <p> Third line </p>
      </body>
    `);

    expect(parsed.visibleText).toBe("First line Second line Third line");
  });

  it("does not crash on empty HTML", () => {
    const parsed = parseHtml("");

    expect(parsed.visibleText).toBe("");
    expect(parsed.wordCount).toBe(0);
    expect(parsed.paragraphCount).toBe(0);
  });
});
