import { load } from "cheerio";
import type { ParsedHtml } from "@/lib/audit/types";

export function parseHtml(html: string): ParsedHtml {
  const $ = load(html);
  const sanitized = load(html);

  sanitized("script, style, noscript, svg").remove();

  const cleanText = sanitized("body").text().replace(/\s+/g, " ").trim();
  const paragraphCount = sanitized("p")
    .toArray()
    .filter((element) => sanitized(element).text().trim().length > 0).length;
  const wordCount = cleanText.length > 0 ? cleanText.split(/\s+/).length : 0;

  return {
    $,
    cleanText,
    wordCount,
    paragraphCount,
  };
}
