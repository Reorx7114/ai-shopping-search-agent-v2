import { NextResponse } from "next/server";
import { mockCandidates } from "@/mockData";
import { parseIntent } from "@/lib/search/intentParser";
import { rankCandidates } from "@/lib/search/ranking";
import { buildRefinedQuery } from "@/lib/search/refinement";
import { searchImages } from "@/lib/search/serp";
import type { SearchRequest } from "@/lib/search/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;
    const parsedIntent = await parseIntent({
      intentMode: body.intentMode,
      wanted: body.wanted,
      unwanted: body.unwanted
    });

    const refinedQuery = buildRefinedQuery(parsedIntent);
    const serpCandidates = await searchImages(refinedQuery);
    const candidates = rankCandidates(serpCandidates.length > 0 ? serpCandidates : mockCandidates, parsedIntent);

    return NextResponse.json({
      parsedIntent,
      candidates
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}
