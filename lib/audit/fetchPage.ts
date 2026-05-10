import {
  AuditError,
  type FetchPageResult,
  type ValidatedUrl,
} from "@/lib/audit/types";
import { validateUrl } from "@/lib/audit/validateUrl";

const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 5_000_000;
const MAX_REDIRECTS = 3;
const HTML_ACCEPT_HEADER = "text/html,application/xhtml+xml";
const USER_AGENT = "AI-Visibility-Audit/1.0";

export async function fetchPageHtml(url: string): Promise<FetchPageResult> {
  const validatedUrl = validateUrl(url);
  const startedAt = Date.now();
  let currentUrl = validatedUrl.normalizedUrl;
  let redirectCount = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: HTML_ACCEPT_HEADER,
          "User-Agent": USER_AGENT,
        },
      });

      if (isRedirect(response.status)) {
        if (redirectCount >= MAX_REDIRECTS) {
          throw new AuditError(
            "Zu viele Weiterleitungen haben das Audit verhindert.",
            400,
          );
        }

        const location = response.headers.get("location");

        if (!location) {
          throw new AuditError(
            "Die Seite hat ohne gültige Ziel-URL weitergeleitet.",
            400,
          );
        }

        const nextUrl = new URL(location, currentUrl);
        currentUrl = validateUrl(nextUrl.toString()).normalizedUrl;
        redirectCount += 1;
        continue;
      }

      if (!response.ok) {
        throw new AuditError(
          `Die Seite lieferte HTTP ${response.status}.`,
          response.status,
        );
      }

      const contentType = response.headers.get("content-type");

      if (!contentType || !isHtmlContentType(contentType)) {
        throw new AuditError(
          "Es können nur HTML-Antworten auditiert werden.",
          415,
        );
      }

      const contentLength = response.headers.get("content-length");

      if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
        throw new AuditError(
          "Die HTML-Antwort hat das 5-MB-Limit überschritten.",
          413,
        );
      }

      const html = await readHtmlWithLimit(response, MAX_HTML_BYTES);
      const htmlBytes = Buffer.byteLength(html, "utf8");
      const finalUrl = response.url || currentUrl;
      const responseTimeMs = Date.now() - startedAt;

      return {
        requestedUrl: validatedUrl.normalizedUrl,
        finalUrl,
        html,
        statusCode: response.status,
        status: response.status,
        contentType,
        htmlBytes,
        responseTimeMs,
        redirectCount,
      };
    } catch (error) {
      if (error instanceof AuditError) {
        throw error;
      }

      if (isAbortError(error)) {
        throw new AuditError(
          "Der Request ist beim Abrufen der Seite in ein Timeout gelaufen.",
          504,
        );
      }

      throw new AuditError("Die Website konnte nicht erreicht werden.", 502);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function fetchPage(
  validatedUrl: ValidatedUrl,
): Promise<FetchPageResult> {
  return fetchPageHtml(validatedUrl.normalizedUrl);
}

async function readHtmlWithLimit(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();

  if (!reader) {
    const html = await response.text();

    if (Buffer.byteLength(html, "utf8") > maxBytes) {
      throw new AuditError(
        "Die HTML-Antwort hat das 5-MB-Limit überschritten.",
        413,
      );
    }

    return html;
  }

  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalLength += value.byteLength;

    if (totalLength > maxBytes) {
      throw new AuditError(
        "Die HTML-Antwort hat das 5-MB-Limit überschritten.",
        413,
      );
    }

    chunks.push(value);
  }

  return new TextDecoder().decode(joinChunks(chunks, totalLength));
}

function joinChunks(chunks: Uint8Array[], totalLength: number) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

function isHtmlContentType(contentType: string) {
  return /text\/html|application\/xhtml\+xml/i.test(contentType);
}

function isRedirect(status: number) {
  return [301, 302, 303, 307, 308].includes(status);
}

function isAbortError(error: unknown) {
  return (
    (error instanceof Error && error.name === "AbortError") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError")
  );
}
