import type {
  InvalidJsonLdBlock,
  JsonLdBlock,
  JsonLdNode,
  JsonLdParseResult,
  ParsedHtml,
} from "@/lib/audit/types";

export function extractJsonLd(parsed: ParsedHtml): JsonLdParseResult {
  const scripts = parsed.$('script[type="application/ld+json"]').toArray();
  const items: JsonLdNode[] = [];
  const validBlocks: JsonLdBlock[] = [];
  const invalidBlocks: InvalidJsonLdBlock[] = [];
  const schemaTypes = new Set<string>();

  for (const script of scripts) {
    const content = parsed.$(script).html()?.trim();

    if (!content) {
      invalidBlocks.push({
        content: "",
        message: "JSON-LD block is empty.",
      });
      continue;
    }

    try {
      const parsedJson = JSON.parse(sanitizeJsonLd(content)) as unknown;

      if (!isJsonLdBlock(parsedJson)) {
        invalidBlocks.push({
          content,
          message: "JSON-LD must contain an object or array at the top level.",
        });
        continue;
      }

      const blockItems = collectJsonLdItems(parsedJson);

      validBlocks.push(parsedJson);
      items.push(...blockItems);
      collectSchemaTypes(parsedJson, schemaTypes);
    } catch (error) {
      invalidBlocks.push({
        content,
        message:
          error instanceof Error ? error.message : "JSON-LD could not be parsed.",
      });
    }
  }

  return {
    items,
    validBlocks,
    invalidBlocks,
    invalidBlockCount: invalidBlocks.length,
    rawBlockCount: scripts.length,
    schemaTypes: Array.from(schemaTypes).sort(),
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

function isJsonLdBlock(value: unknown): value is JsonLdBlock {
  return Array.isArray(value) || Boolean(value && typeof value === "object");
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

function collectSchemaTypes(value: unknown, schemaTypes: Set<string>) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectSchemaTypes(entry, schemaTypes);
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const node = value as JsonLdNode;

  for (const type of extractTypes(node)) {
    schemaTypes.add(type);
  }

  for (const nestedValue of Object.values(node)) {
    collectSchemaTypes(nestedValue, schemaTypes);
  }
}
