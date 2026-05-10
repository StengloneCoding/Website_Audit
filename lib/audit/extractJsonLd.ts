import type { JsonLdExtractionResult, JsonLdNode, ParsedHtml } from "@/lib/audit/types";

export function extractJsonLd(parsed: ParsedHtml): JsonLdExtractionResult {
  const scripts = parsed.$('script[type="application/ld+json"]').toArray();
  const items: JsonLdNode[] = [];
  let invalidBlocks = 0;

  for (const script of scripts) {
    const content = parsed.$(script).html()?.trim();

    if (!content) {
      continue;
    }

    try {
      const parsedJson = JSON.parse(sanitizeJsonLd(content)) as unknown;
      items.push(...collectJsonLdItems(parsedJson));
    } catch {
      invalidBlocks += 1;
    }
  }

  const types = Array.from(
    new Set(items.flatMap((item) => extractTypes(item)).filter(Boolean)),
  ).sort();

  return {
    items,
    invalidBlocks,
    rawBlockCount: scripts.length,
    types,
  };
}

function sanitizeJsonLd(content: string) {
  return content
    .replace(/^<!--/, "")
    .replace(/-->$/, "")
    .replace(/^\/\*<!\[CDATA\[\*\//, "")
    .replace(/\/\*\]\]>\*\/$/, "")
    .trim();
}

function collectJsonLdItems(value: unknown): JsonLdNode[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectJsonLdItems(entry));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const node = value as JsonLdNode;
  const graphItems = Array.isArray(node["@graph"])
    ? collectJsonLdItems(node["@graph"])
    : [];
  const ownTypes = extractTypes(node);
  const shouldIncludeSelf = ownTypes.length > 0;

  return shouldIncludeSelf ? [node, ...graphItems] : graphItems;
}

function extractTypes(node: JsonLdNode) {
  const value = node["@type"];

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  return [];
}
