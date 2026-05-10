import { describe, expect, it } from "vitest";
import { checkStructuredData } from "@/lib/audit/checkStructuredData";
import { extractJsonLd } from "@/lib/audit/extractJsonLd";
import { parseHtml } from "@/lib/audit/parseHtml";

function analyzeStructuredData(html: string) {
  const parsed = parseHtml(html);
  const jsonLd = extractJsonLd(parsed);

  return checkStructuredData(jsonLd, parsed);
}

function findCheck(
  checks: ReturnType<typeof analyzeStructuredData>["checks"],
  id: string,
) {
  const check = checks.find((entry) => entry.id === id);

  expect(check).toBeDefined();

  return check!;
}

describe("checkStructuredData", () => {
  it("creates a failed check when no schema is present", () => {
    const { checks, summary } = analyzeStructuredData(`
      <html>
        <body>
          <h1>AI Visibility Audit</h1>
          <p>Machine-readable context matters for modern search and AI discovery.</p>
        </body>
      </html>
    `);

    expect(findCheck(checks, "structured-jsonld-present")).toMatchObject({
      passed: false,
      recommendation:
        "Ergänze JSON-LD-Schema, um Unternehmensentität, Leistungen, Standort und Seitenzweck klarer zu machen.",
    });
    expect(findCheck(checks, "structured-jsonld-valid")).toMatchObject({
      passed: false,
    });
    expect(summary.rawBlockCount).toBe(0);
  });

  it("recognizes Organization schema", () => {
    const { checks } = analyzeStructuredData(`
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Organization", "name": "Ape Studios" }
      </script>
    `);

    expect(
      findCheck(checks, "structured-organization-or-local-business").passed,
    ).toBe(true);
  });

  it("recognizes LocalBusiness schema", () => {
    const { checks } = analyzeStructuredData(`
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "LocalBusiness", "name": "Ape Studios Berlin" }
      </script>
    `);

    expect(
      findCheck(checks, "structured-organization-or-local-business").passed,
    ).toBe(true);
  });

  it("recognizes WebSite schema", () => {
    const { checks } = analyzeStructuredData(`
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "WebSite", "name": "Ape Studios" }
      </script>
    `);

    expect(findCheck(checks, "structured-website").passed).toBe(true);
  });

  it("recognizes Service schema", () => {
    const { checks } = analyzeStructuredData(`
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Service", "name": "AI Visibility Audit" }
      </script>
    `);

    expect(findCheck(checks, "structured-service").passed).toBe(true);
  });

  it("recognizes FAQPage schema when FAQ content is present", () => {
    const { checks } = analyzeStructuredData(`
      <html>
        <body>
          <h2>FAQ</h2>
          <p>What does the audit measure?</p>
          <p>How long does the analysis take?</p>
          <script type="application/ld+json">
            { "@context": "https://schema.org", "@type": "FAQPage" }
          </script>
        </body>
      </html>
    `);

    expect(findCheck(checks, "structured-faqpage").passed).toBe(true);
  });

  it("only treats missing FAQPage schema as relevant when FAQ content is detected", () => {
    const faqRelevant = analyzeStructuredData(`
      <html>
        <body>
          <h2>Frequently Asked Questions</h2>
          <p>What is included?</p>
          <p>Who should use this audit?</p>
        </body>
      </html>
    `);

    expect(findCheck(faqRelevant.checks, "structured-faqpage").passed).toBe(
      false,
    );

    const nonFaqPage = analyzeStructuredData(`
      <html>
        <body>
          <h1>AI Visibility Audit</h1>
          <p>This page explains the product and its outputs.</p>
        </body>
      </html>
    `);

    expect(
      nonFaqPage.checks.some((check) => check.id === "structured-faqpage"),
    ).toBe(false);
  });

  it("does not claim a page becomes invisible without schema", () => {
    const { checks } = analyzeStructuredData(`
      <html>
        <body>
          <h1>No schema example</h1>
          <p>The page is still crawlable, but its context is less explicit.</p>
        </body>
      </html>
    `);

    const combinedCopy = checks
      .flatMap((check) => [
        check.label,
        check.recommendation,
        check.details ?? "",
      ])
      .join(" ");

    expect(combinedCopy).not.toMatch(/invisible|unsichtbar/i);
  });
});
