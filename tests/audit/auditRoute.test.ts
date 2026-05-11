import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuditError, type AuditResult } from "@/lib/audit/types";

const { runAuditMock } = vi.hoisted(() => ({
  runAuditMock: vi.fn(),
}));

vi.mock("@/lib/audit/runAudit", () => ({
  runAudit: runAuditMock,
}));

import { POST } from "@/app/api/audit/route";

const auditResult = {
  url: "https://example.com/",
  score: 82,
  categories: [],
  strongSignals: [],
  weakSignals: [],
  issues: [],
  recommendations: [],
  frequentTerms: [{ term: "audit", count: 3, share: 7.5 }],
  schemaTypes: ["Organization"],
  metadata: {
    analyzedAt: "2026-05-11T09:30:00.000Z",
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    technical: {
      status: 200,
      contentType: "text/html; charset=utf-8",
      responseTimeMs: 320,
      htmlBytes: 142000,
      redirectCount: 0,
    },
    structuredData: {
      rawBlockCount: 1,
      validItemCount: 1,
      invalidBlockCount: 0,
    },
  },
  checks: [
    {
      id: "seo-title-present",
      label: "Ein Title-Tag ist vorhanden",
      passed: true,
      weight: 5,
      category: "seoBasics",
      impact: "high",
      recommendation: "Ergänze ein eindeutiges Title-Tag.",
    },
  ],
} satisfies AuditResult;

describe("POST /api/audit", () => {
  beforeEach(() => {
    runAuditMock.mockReset();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a request without the internal secret when a secret is configured", async () => {
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "top-secret");

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Nicht gefunden." });
    expect(runAuditMock).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong internal secret", async () => {
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "top-secret");

    const response = await POST(
      createRequest(
        { url: "https://example.com" },
        { "x-internal-audit-secret": "wrong-secret" },
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Nicht gefunden." });
    expect(runAuditMock).not.toHaveBeenCalled();
  });

  it("returns 200 with an AuditResult when the internal secret is correct", async () => {
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "top-secret");
    runAuditMock.mockResolvedValue(auditResult);

    const response = await POST(
      createRequest(
        { url: "https://example.com" },
        { "x-internal-audit-secret": "top-secret" },
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(runAuditMock).toHaveBeenCalledWith("https://example.com");
    expect(payload).toMatchObject({
      url: "https://example.com/",
      score: 82,
      checks: expect.any(Array),
      metadata: expect.any(Object),
    });
  });

  it("returns 400 for invalid input after a successful internal auth check", async () => {
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "top-secret");

    const response = await POST(
      createRequest(
        {},
        { "x-internal-audit-secret": "top-secret" },
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      error: "Bitte sende eine gültige URL im Request-Body.",
    });
    expect(runAuditMock).not.toHaveBeenCalled();
  });

  it("returns 408 when the internal audit times out", async () => {
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "top-secret");
    runAuditMock.mockRejectedValue(
      new AuditError(
        "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
        408,
      ),
    );

    const response = await POST(
      createRequest(
        { url: "https://example.com" },
        { "x-internal-audit-secret": "top-secret" },
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(408);
    expect(payload).toEqual({
      error: "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
    });
  });

  it("keeps the full audit route closed in production when no secret is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("INTERNAL_AUDIT_SECRET", "");

    const response = await POST(createRequest({ url: "https://example.com" }));
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Nicht gefunden." });
    expect(runAuditMock).not.toHaveBeenCalled();
  });
});

function createRequest(
  body: Record<string, unknown> | string,
  extraHeaders: Record<string, string> = {},
) {
  return new Request("http://localhost/api/audit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
