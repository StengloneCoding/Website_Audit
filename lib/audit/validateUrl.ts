import dns from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { isIP } from "node:net";
import { z } from "zod";
import { AuditError, type ValidatedUrl } from "@/lib/audit/types";

const urlSchema = z.string().trim().min(1).max(2048);

const blockedHostnameSuffixes = [".localhost", ".local", ".internal"];

export async function validateUrl(input: string): Promise<ValidatedUrl> {
  const parsedInput = urlSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new AuditError("Please enter a valid absolute URL.", 400);
  }

  const candidate = parsedInput.data;

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new AuditError("Please enter a valid absolute URL.", 400);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new AuditError("Only http and https URLs are allowed.", 400);
  }

  if (url.username || url.password) {
    throw new AuditError("Embedded credentials are not allowed in URLs.", 400);
  }

  const hostname = url.hostname.toLowerCase();

  if (isBlockedHostname(hostname)) {
    throw new AuditError(
      "Local or private network hosts are not allowed for this audit.",
      400,
    );
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AuditError(
        "Local or private network hosts are not allowed for this audit.",
        400,
      );
    }
  } else {
    let records: LookupAddress[];

    try {
      records = await dns.lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new AuditError(
        "The hostname could not be resolved from the server environment.",
        400,
      );
    }

    if (records.length === 0) {
      throw new AuditError("The hostname did not resolve to a public IP.", 400);
    }

    for (const record of records) {
      if (isPrivateIp(record.address)) {
        throw new AuditError(
          "Local or private network hosts are not allowed for this audit.",
          400,
        );
      }
    }
  }

  return {
    input: candidate,
    normalizedUrl: url.toString(),
    hostname,
    url,
  };
}

function isBlockedHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    blockedHostnameSuffixes.some((suffix) => hostname.endsWith(suffix))
  );
}

function isPrivateIp(address: string) {
  const family = isIP(address);

  if (family === 4) {
    return isPrivateIpv4(address);
  }

  if (family === 6) {
    return isPrivateIpv6(address);
  }

  return true;
}

function isPrivateIpv4(address: string) {
  const octets = address.split(".").map(Number);
  const [first, second] = octets;

  if (octets.some((octet) => Number.isNaN(octet))) {
    return true;
  }

  if (first === 10 || first === 127 || first === 0) {
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

  if (first === 100 && second >= 64 && second <= 127) {
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
    return isPrivateIpv4(normalized.replace("::ffff:", ""));
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
