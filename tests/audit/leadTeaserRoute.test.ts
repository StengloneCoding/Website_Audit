import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditError, type AuditResult, type LeadTeaserResponse } from "@/lib/audit/types";

const mocked = vi.hoisted(() => ({
  runAuditMock: vi.fn(),
  createLeadTeaserMock: vi.fn(),
}));

vi.mock("@/lib/audit/runAudit", () => ({
  runAudit: mocked.runAuditMock,
}));

vi.mock("@/lib/audit/createLeadTeaser", () => ({
  createLeadTeaser: mocked.createLeadTeaserMock,
}));

import { POST } from "@/app/api/lead-teaser/route";

describe("POST /api/lead-teaser", () => {
  beforeEach(() => {
    mocked.runAuditMock.mockReset();
    mocked.createLeadTeaserMock.mockReset();
  });

  it("returns 200 with a reduced public response for a valid request", async () => {
    mocked.runAuditMock.mockResolvedValue(createAuditResult());
    mocked.createLeadTeaserMock.mockReturnValue({
      url: "https://example.com",
      score: 58,
      criticalPoints: [
        {
          title: "Keine strukturierten Daten gefunden",
          impact: "high",
          summary:
            "Suchmaschinen und KI-Systeme erhalten dadurch weniger explizite Kontextsignale.",
          teaserRecommendation:
            "Für lokale Unternehmen sind Organization, LocalBusiness und Service Schema sinnvoll.",
        },
        {
          title: "Standortbezug ist kaum sichtbar",
          impact: "high",
          summary:
            "Die Website macht nicht klar genug, für welche Region das Angebot relevant ist.",
          teaserRecommendation:
            "Standort, Einzugsgebiet und lokale Leistungsseiten sollten klarer benannt werden.",
        },
        {
          title: "Soll nicht öffentlich erscheinen",
          impact: "medium",
          summary: "Dieser dritte Punkt darf nicht in der Response landen.",
          teaserRecommendation: "Serverseitig auf zwei Punkte begrenzen.",
        },
      ],
      cta: {
        headline:
          "Möchten Sie wissen, welche Maßnahmen bei Ihrer Website wirklich sinnvoll sind?",
        text: "Ich prüfe Ihre Website kostenlos und gebe Ihnen eine klare Einschätzung, welche Punkte zuerst verbessert werden sollten.",
        buttonLabel: "Kostenfreie Ersteinschätzung anfragen",
        targetUrl: "/kostenfreie-beratung",
      },
      disclaimer:
        "Dieser Quick Check misst keine echten Rankings. Er bewertet technische und semantische Signale.",
    } satisfies LeadTeaserResponse);

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mocked.runAuditMock).toHaveBeenCalledWith("https://example.com");
    expect(mocked.createLeadTeaserMock).toHaveBeenCalledTimes(1);
    expect(payload).toMatchObject({
      url: "https://example.com",
      score: 58,
      cta: expect.any(Object),
      disclaimer:
        "Dieser Quick Check misst keine echten Rankings. Er bewertet technische und semantische Signale.",
    });
    expect(payload.criticalPoints).toHaveLength(2);
    expect(payload).not.toHaveProperty("checks");
    expect(payload).not.toHaveProperty("metadata");
    expect(payload).not.toHaveProperty("frequentTerms");
    expect(payload).not.toHaveProperty("schemaTypes");
    expect(payload).not.toHaveProperty("rawHtml");
  });

  it("returns 400 for an invalid URL", async () => {
    mocked.runAuditMock.mockRejectedValue(
      new AuditError(
        "Bitte gib eine vollständige URL inklusive http:// oder https:// ein.",
        400,
      ),
    );

    const response = await POST(createRequest({ url: "not-a-url" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error:
        "Bitte gib eine vollständige URL inklusive http:// oder https:// ein.",
    });
  });

  it("returns 408 when the page fetch times out", async () => {
    mocked.runAuditMock.mockRejectedValue(
      new AuditError(
        "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
        408,
      ),
    );

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(408);
    expect(payload).toEqual({
      error: "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
    });
  });

  it("returns 502 without leaking internal fetch details", async () => {
    mocked.runAuditMock.mockRejectedValue(
      new AuditError("connect ECONNREFUSED 127.0.0.1:443", 502),
    );

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      error: "Die Website konnte nicht geprüft werden.",
    });
    expect(JSON.stringify(payload)).not.toContain("ECONNREFUSED");
    expect(JSON.stringify(payload)).not.toContain("127.0.0.1");
  });

  it("returns 500 for unexpected errors", async () => {
    mocked.runAuditMock.mockRejectedValue(new Error("boom"));

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      error: "Der Quick Check konnte nicht abgeschlossen werden.",
    });
  });
});

function createRequest(body: Record<string, unknown> | string) {
  return new Request("http://localhost/api/lead-teaser", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function createAuditResult(): AuditResult {
  return {
    url: "https://example.com",
    score: 58,
    categories: [],
    strongSignals: [],
    weakSignals: [],
    issues: [],
    recommendations: [],
    frequentTerms: [],
    schemaTypes: [],
    metadata: {
      analyzedAt: "2026-05-11T09:30:00.000Z",
      requestedUrl: "https://example.com",
      finalUrl: "https://example.com",
      technical: {
        status: 200,
        contentType: "text/html; charset=utf-8",
        responseTimeMs: 320,
        htmlBytes: 24000,
        redirectCount: 0,
      },
      structuredData: {
        rawBlockCount: 0,
        validItemCount: 0,
        invalidBlockCount: 0,
      },
    },
    checks: [],
  };
}
