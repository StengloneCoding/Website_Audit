import { describe, expect, it } from "vitest";
import { extractJsonLd } from "@/lib/audit/extractJsonLd";
import { parseHtml } from "@/lib/audit/parseHtml";

describe("extractJsonLd", () => {
  it("returns empty results when no JSON-LD blocks are present", () => {
    const result = extractJsonLd(
      parseHtml(`
        <html>
          <body>
            <h1>Audit page</h1>
            <p>No structured data here.</p>
          </body>
        </html>
      `),
    );

    expect(result.rawBlockCount).toBe(0);
    expect(result.validBlocks).toEqual([]);
    expect(result.invalidBlocks).toEqual([]);
    expect(result.schemaTypes).toEqual([]);
  });

  it("parses a valid single JSON-LD object", () => {
    const result = extractJsonLd(
      parseHtml(`
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Ape Studios"
          }
        </script>
      `),
    );

    expect(result.rawBlockCount).toBe(1);
    expect(result.validBlocks).toHaveLength(1);
    expect(result.invalidBlocks).toHaveLength(0);
    expect(result.items).toHaveLength(1);
    expect(result.schemaTypes).toEqual(["Organization"]);
  });

  it("parses a valid JSON-LD array", () => {
    const result = extractJsonLd(
      parseHtml(`
        <script type="application/ld+json">
          [
            { "@type": "Organization", "name": "Ape Studios" },
            { "@type": "WebSite", "name": "Ape Studios Website" }
          ]
        </script>
      `),
    );

    expect(result.validBlocks).toHaveLength(1);
    expect(result.items).toHaveLength(2);
    expect(result.schemaTypes).toEqual(["Organization", "WebSite"]);
  });

  it("supports @graph with multiple schema types", () => {
    const result = extractJsonLd(
      parseHtml(`
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Organization", "name": "Ape Studios" },
              { "@type": "WebSite", "name": "Ape Studios Website" }
            ]
          }
        </script>
      `),
    );

    expect(result.items).toHaveLength(2);
    expect(result.schemaTypes).toEqual(["Organization", "WebSite"]);
  });

  it("counts invalid JSON-LD blocks without crashing", () => {
    const result = extractJsonLd(
      parseHtml(`
        <script type="application/ld+json">
          { "@type": "Organization", }
        </script>
      `),
    );

    expect(result.rawBlockCount).toBe(1);
    expect(result.validBlocks).toHaveLength(0);
    expect(result.invalidBlocks).toHaveLength(1);
    expect(result.invalidBlockCount).toBe(1);
    expect(result.schemaTypes).toEqual([]);
  });

  it("extracts nested @type values recursively and deduplicates them", () => {
    const result = extractJsonLd(
      parseHtml(`
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "department": {
              "@type": ["LocalBusiness", "Service"],
              "areaServed": {
                "@type": "Service",
                "name": "Berlin SEO Audit"
              }
            },
            "mainEntity": {
              "@type": "FAQPage"
            }
          }
        </script>
      `),
    );

    expect(result.schemaTypes).toEqual([
      "FAQPage",
      "LocalBusiness",
      "Organization",
      "Service",
    ]);
  });
});
