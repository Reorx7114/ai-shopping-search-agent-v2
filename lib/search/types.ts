export const INTENT_MODES = ["找商品", "找旅遊", "找靈感", "我不確定"] as const;

export type IntentMode = (typeof INTENT_MODES)[number];
export type ParserSource = "openai" | "fallback";
export type SearchSource = "serpapi" | "mock" | "none";

export interface ParsedIntent {
  intentMode: IntentMode;
  features: string[];
  keywords: string[];
  englishKeywords: string[];
  coreClues: string[];
  negativeTerms: string[];
  searchQueries: string[];
}

export interface Candidate {
  id: string;
  image: string;
  title: string;
  source: string;
  link: string;
  snippet?: string;
}

export interface SearchRequest {
  intentMode: IntentMode;
  wanted: string;
  unwanted: string;
  likedCandidateId?: string;
  restartRefinement?: boolean;
  mockMode?: boolean;
}

export interface SearchDebug {
  apiKeyStatus: {
    openaiConfigured: boolean;
    serpApiConfigured: boolean;
  };
  parserSource: ParserSource;
  searchSource: SearchSource;
  intentMode: IntentMode;
  generatedQueries: string[];
  errorMessage?: string;
}

export interface SearchResponse {
  parsedIntent: ParsedIntent | null;
  candidates: Candidate[];
  debug: SearchDebug;
}
