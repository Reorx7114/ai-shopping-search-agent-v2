import OpenAI from "openai";
import { INTENT_MODES, type IntentMode, type ParsedIntent } from "./types";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function normalizeIntentMode(mode: string): IntentMode {
  return (INTENT_MODES.find((m) => m === mode) ?? "我不確定") as IntentMode;
}

function ensureNegativeQueryTerms(query: string, negativeTerms: string[]): string {
  const existing = new Set(query.split(/\s+/));
  const missing = negativeTerms.filter((term) => !existing.has(`-${term}`));
  return [query, ...missing.map((term) => `-${term}`)].join(" ").trim();
}

export async function parseIntent(input: {
  intentMode: IntentMode;
  wanted: string;
  unwanted: string;
}): Promise<ParsedIntent> {
  const fallbackNegativeTerms = input.unwanted
    .split(/[、,，\n]/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (!client) {
    const baseQuery = `${input.wanted} ${fallbackNegativeTerms.map((term) => `-${term}`).join(" ")}`.trim();
    return {
      intentMode: input.intentMode,
      features: [],
      keywords: [input.wanted],
      englishKeywords: [],
      coreClues: [input.wanted],
      negativeTerms: fallbackNegativeTerms,
      searchQueries: [baseQuery]
    };
  }

  const prompt = `你是搜尋意圖解析器。回傳 JSON，欄位固定：intentMode,features,keywords,englishKeywords,coreClues,negativeTerms,searchQueries。
intentMode 只能是 ${INTENT_MODES.join("/")}。
使用者想要：${input.wanted}
使用者不要：${input.unwanted || "(無)"}
規則：negativeTerms 必須擷取中英文排除詞；searchQueries 每筆都必須包含對應的負面詞（以 -詞 格式）。`;

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "intent_parse",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            intentMode: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            keywords: { type: "array", items: { type: "string" } },
            englishKeywords: { type: "array", items: { type: "string" } },
            coreClues: { type: "array", items: { type: "string" } },
            negativeTerms: { type: "array", items: { type: "string" } },
            searchQueries: { type: "array", items: { type: "string" } }
          },
          required: [
            "intentMode",
            "features",
            "keywords",
            "englishKeywords",
            "coreClues",
            "negativeTerms",
            "searchQueries"
          ]
        }
      }
    }
  });

  const parsed = JSON.parse(completion.output_text) as ParsedIntent;
  const negativeTerms = Array.from(new Set([...fallbackNegativeTerms, ...(parsed.negativeTerms ?? [])]));

  return {
    ...parsed,
    intentMode: normalizeIntentMode(parsed.intentMode),
    negativeTerms,
    searchQueries: (parsed.searchQueries ?? []).map((query) => ensureNegativeQueryTerms(query, negativeTerms))
  };
}
