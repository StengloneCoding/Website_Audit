import { describe, expect, it } from "vitest";
import { extractSeoBasics } from "@/lib/audit/extractSeoBasics";
import { parseHtml } from "@/lib/audit/parseHtml";

const richHtml = `
  <html>
    <head>
      <title>AI Visibility Readiness Audit for B2B Websites</title>
      <meta
        name="description"
        content="Audit technical and semantic machine-readable signals that help websites become easier to understand for search engines and AI systems."
      />
      <meta name="robots" content="noindex,follow" />
      <meta property="og:title" content="OG Audit Title" />
      <meta property="og:description" content="OG description for preview cards." />
      <link rel="canonical" href="https://example.com/audit" />
    </head>
    <body>
      <h1>AI Visibility Audit</h1>
      <h1>Secondary Heading</h1>
      <p>
        This audit reviews semantic and technical website signals for machine-readable clarity.
      </p>
      <p>
        It helps teams understand whether their content, links and page structure provide enough context.
      </p>
      <a href="/features">Features</a>
      <a href="contact">Contact</a>
      <a href="https://external.example/resource">External Resource</a>
      <img src="/hero.jpg" alt="Audit dashboard overview" />
      <img src="/team.jpg" />
    </body>
  </html>
`;

describe("extractSeoBasics", () => {
  it("extracts the title", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.title).toBe("AI Visibility Readiness Audit for B2B Websites");
  });

  it("extracts the meta description", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.description).toContain("machine-readable signals");
  });

  it("extracts multiple h1 values", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.h1s).toEqual(["AI Visibility Audit", "Secondary Heading"]);
  });

  it("extracts the canonical URL", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.canonical).toBe("https://example.com/audit");
  });

  it("recognizes robots noindex", () => {
    const { seoBasics, checks } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.robots).toBe("noindex,follow");
    expect(checks.find((check) => check.id === "seo-noindex-not-set")?.passed).toBe(false);
  });

  it("counts internal and external links", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.internalLinksCount).toBe(2);
    expect(seoBasics.externalLinksCount).toBe(1);
  });

  it("counts images with and without alt text", () => {
    const { seoBasics } = extractSeoBasics(parseHtml(richHtml));

    expect(seoBasics.imagesCount).toBe(2);
    expect(seoBasics.imagesWithAltCount).toBe(1);
  });

  it("includes understandable recommendations in checks", () => {
    const { checks } = extractSeoBasics(parseHtml(richHtml));

    expect(checks.every((check) => check.weight > 0)).toBe(true);
    expect(checks.every((check) => check.recommendation.trim().length > 10)).toBe(true);
  });

  it("creates a failed check when the meta description is missing", () => {
    const { checks } = extractSeoBasics(
      parseHtml(`
        <html>
          <head>
            <title>Short title</title>
          </head>
          <body>
            <h1>Single heading</h1>
            <p>Enough text to keep the page from looking empty for the parser.</p>
            <a href="/about">About</a>
          </body>
        </html>
      `),
    );

    expect(checks.find((check) => check.id === "seo-description-present")).toMatchObject({
      passed: false,
    });
  });
});
