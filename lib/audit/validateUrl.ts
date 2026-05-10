import { isIP } from "node:net";
import { z } from "zod";
import { AuditError, type ValidatedUrl } from "@/lib/audit/types";

const auditUrlSchema = z.string().trim().min(1).max(2048);

const blockedHostnameLabels = new Set(["localhost", "local", "internal"]);
const blockedHostnameSuffixes = [".localhost", ".local", ".internal"];
const privateTargetMessage =
  "Local, loopback and private network targets are not allowed.";

export function validateAuditUrl(input: unknown): string {
  const parsedInput = auditUrlSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new AuditError("Please enter a full URL including http:// or https://.", 400);
  }

  const candidate = parsedInput.data;

  // We reject protocol-less input instead of auto-prefixing https://.
  // That keeps the audit request explicit and avoids hidden assumptions about the target.
  if (!candidate.includes("://")) {
    throw new AuditError("Please enter a full URL including http:// or https://.", 400);
  }

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new AuditError("Please enter a full URL including http:// or https://.", 400);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new AuditError("Only http and https URLs are allowed.", 400);
  }

  if (url.username || url.password) {
    throw new AuditError("Embedded credentials are not allowed in URLs.", 400);
  }

  const hostname = normalizeHostname(url.hostname);

  if (isBlockedHostname(hostname)) {
    throw new AuditError(privateTargetMessage, 400);
  }

  if (isIP(hostname) && isPrivateOrLoopbackIp(hostname)) {
    throw new AuditError(privateTargetMessage, 400);
  }

  return url.toString();
}

export function validateUrl(input: unknown): ValidatedUrl {
  const normalizedUrl = validateAuditUrl(input);
  const url = new URL(normalizedUrl);

  return {
    input: String(input).trim(),
    normalizedUrl,
    hostname: normalizeHostname(url.hostname),
    url,
  };
}

function isBlockedHostname(hostname: string) {
  return (
    blockedHostnameLabels.has(hostname) ||
    blockedHostnameSuffixes.some((suffix) => hostname.endsWith(suffix))
  );
}

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");
}

function isPrivateOrLoopbackIp(address: string) {
  const family = isIP(address);

  if (family === 4) {
    return isPrivateIpv4(address);
  }

  if (family === 6) {
    return isPrivateIpv6(address);
  }

  return false;
}

function isPrivateIpv4(address: string) {
  const octets = address.split(".").map((segment) => Number(segment));
  const [first, second] = octets;

  if (octets.length !== 4 || octets.some((segment) => Number.isNaN(segment))) {
    return true;
  }

  if (first === 0 || first === 10 || first === 127) {
    return true;
  }

  if (first === 169 && second === 254) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  if (first === 192 && second === 168) {
    return true;
  }

  return false;
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();

  if (normalized === "::1" || normalized === "::") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.slice("::ffff:".length));
  }

  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true;
  }

  return (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}
