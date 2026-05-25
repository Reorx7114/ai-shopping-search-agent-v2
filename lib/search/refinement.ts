import type { Candidate, ParsedIntent } from "./types";

export function buildRefinedQuery(parsed: ParsedIntent, liked?: Candidate): string {
  const base = liked ? `${liked.title} ${liked.source}` : parsed.searchQueries[0] ?? parsed.keywords.join(" ");
  const negatives = parsed.negativeTerms.map((term) => `-${term}`).join(" ");
  return `${base} ${negatives}`.trim();
}
