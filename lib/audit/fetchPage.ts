import { AuditError, type PageFetchResult, type ValidatedUrl } from "@/lib/audit/types";
import { validateUrl } from "@/lib/audit/validateUrl";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 2_000_000;

export async function fetchPage(
  validatedUrl: ValidatedUrl,
): Promise<PageFetchResult> {
  const startedAt = Date.now();
  let currentUrl = validatedUrl.url.toString();
  let redirectCount = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "AI-Visibility-Readiness-Audit/0.1",
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AuditError("The page request timed out.", 504);
      }

      throw new AuditError("The page could not be fetched.", 502);
    } finally {
      clearTimeout(timeout);
    }

    if (isRedirect(response.status)) {
      if (redirectCount >= MAX_REDIRECTS) {
        throw new AuditError("Too many redirects prevented the audit.", 400);
      }

      const location = response.headers.get("location");

      if (!location) {
        throw new AuditError("The page redirected without a valid location.", 400);
      }

      const nextUrl = new URL(location, currentUrl);
      const validatedRedirect = await validateUrl(nextUrl.toString());
      currentUrl = validatedRedirect.url.toString();
      redirectCount += 1;
      continue;
    }

    if (!response.ok) {
      throw new AuditError(
        `The page returned HTTP ${response.status} and could not be audited.`,
        502,
      );
    }

    const contentType = response.headers.get("content-type");

    if (!contentType || !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new AuditError("Only HTML documents can be audited.", 415);
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
      throw new AuditError(
        "The page is too large for the MVP audit size limit.",
        413,
      );
    }

    const html = await readHtmlWithLimit(response, MAX_HTML_BYTES);

    return {
      inputUrl: validatedUrl.normalizedUrl,
      finalUrl: response.url || currentUrl,
      html,
      status: response.status,
      contentType,
      htmlBytes: Buffer.byteLength(html, "utf8"),
      responseTimeMs: Date.now() - startedAt,
      redirectCount,
    };
  }
}

async function readHtmlWithLimit(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();

  if (!reader) {
    const html = await response.text();

    if (Buffer.byteLength(html, "utf8") > maxBytes) {
      throw new AuditError("The page is too large for the MVP audit size limit.", 413);
    }

    return html;
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > maxBytes) {
      throw new AuditError("The page is too large for the MVP audit size limit.", 413);
    }

    chunks.push(value);
  }

  return new TextDecoder().decode(mergeChunks(chunks, receivedBytes));
}

function mergeChunks(chunks: Uint8Array[], totalLength: number) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

function isRedirect(status: number) {
  return [301, 302, 303, 307, 308].includes(status);
}
