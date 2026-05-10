import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPageHtml } from "@/lib/audit/fetchPage";

describe("fetchPageHtml", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns HTML metadata for a successful HTML response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      createResponse("<html><body>Hello audit</body></html>", {
        status: 200,
        url: "https://example.com/final",
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPageHtml("https://example.com");

    expect(result).toMatchObject({
      statusCode: 200,
      finalUrl: "https://example.com/final",
      contentType: "text/html; charset=utf-8",
      html: "<html><body>Hello audit</body></html>",
    });
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/",
      expect.objectContaining({
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "AI-Visibility-Audit/1.0",
        },
      }),
    );
  });

  it("rejects non HTML content", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      createResponse('{"ok":true}', {
        status: 200,
        url: "https://example.com/data",
        headers: {
          "content-type": "application/json",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPageHtml("https://example.com")).rejects.toThrow(
      "Only HTML responses can be audited.",
    );
  });

  it("rejects HTTP errors with a readable message", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      createResponse("Not found", {
        status: 404,
        url: "https://example.com/missing",
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPageHtml("https://example.com/missing")).rejects.toThrow(
      "The page returned HTTP 404.",
    );
  });

  it("rejects when the request times out", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_input, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => {
              reject(new DOMException("The operation was aborted.", "AbortError"));
            },
            { once: true },
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const requestPromise = fetchPageHtml("https://example.com");
    const assertion = expect(requestPromise).rejects.toThrow(
      "The request timed out while fetching the page.",
    );

    await vi.advanceTimersByTimeAsync(8_000);

    await assertion;
  });

  it("rejects responses larger than 1 MB", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      createResponse("<html><body>Too large</body></html>", {
        status: 200,
        url: "https://example.com/large",
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "1000001",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPageHtml("https://example.com/large")).rejects.toThrow(
      "The HTML response exceeded the 1 MB limit.",
    );
  });

  it("sets responseTimeMs based on the fetch duration", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      createResponse("<html><body>Timed</body></html>", {
        status: 200,
        url: "https://example.com/timed",
        headers: {
          "content-type": "text/html",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(Date, "now").mockReturnValueOnce(1_000).mockReturnValueOnce(1_125);

    const result = await fetchPageHtml("https://example.com");

    expect(result.responseTimeMs).toBe(125);
  });
});

function createResponse(
  body: string,
  options: {
    status: number;
    url: string;
    headers: Record<string, string>;
  },
) {
  const response = new Response(body, {
    status: options.status,
    headers: options.headers,
  });

  Object.defineProperty(response, "url", {
    value: options.url,
    configurable: true,
  });

  return response;
}
