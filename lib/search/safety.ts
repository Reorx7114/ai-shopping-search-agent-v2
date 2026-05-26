import type { IntentMode, SearchRequest } from "./types";

const ILLEGAL_CATEGORY_PATTERNS: RegExp[] = [
  // drugs / contraband
  /毒品|一級毒品|二級毒品|三級毒品|四級毒品|k他命|ketamine|海洛因|heroin|安非他命|meth|搖頭丸|mdma|fm2|毒咖啡包|喪屍菸彈|大麻|cannabis|marijuana/i,
  /電子菸|菸彈|煙彈|vape|vaping|買毒|拿貨|管道|門路|黑話|毒交易/i,
  // sexual services
  /嫖妓|買春|找雞|約砲|打炮|陪睡|過夜|女伴過夜|找女人陪我|女人陪我過夜|半套|全套|樓鳳|茶訊|援交|1s|2s|3s/i,
  /escort|sex\s*service|overnight\s*companion|female\s*companion\s*overnight/i,
  // weapons explosives
  /槍枝|手槍|步槍|黑槍|子彈|彈藥|花生米|噴子|芭樂|土炮|改槍|假槍|空氣槍|瓦斯槍|bb槍|火藥|炸藥|爆裂物|爆竹改造/i,
  // fraud / black market / fake docs
  /詐騙教學|話術|車手|水房|洗錢|人頭帳戶|人頭門號|盜刷|黑卡|假證件|假身分證|假護照|假駕照|假發票|個資買賣|資料外流購買|黑市服務|地下服務/i,
  // darknet
  /暗網|dark\s*web|darknet|onion|非法市場|地下市場|黑市|darknet\s*marketplace|onion\s*market/i
];

const FACILITATION_PATTERNS: RegExp[] = [
  /怎麼不被抓|怎麼避開警察|怎麼安全交易|哪裡拿貨|哪裡有門路|怎麼聯絡|私下交易|匿名購買|不留紀錄|免實名|隱密配送/i,
  /how\s*to\s*avoid\s*police|anonymous\s*buy|no\s*record|private\s*deal/i
];

const RISK_HINT_PATTERNS: RegExp[] = [/買|賣|交易|取得|製作|改造|門路|管道|聯絡|market|buy|get|source|channel/i];

export interface SafetyCheckResult {
  blocked: boolean;
  reason?: string;
}

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export function buildSafetyInput(body: SearchRequest): string {
  const parts = [
    body.query,
    body.wanted,
    body.negativeInput,
    body.unwanted,
    body.selectedCandidate?.title,
    body.selectedCandidate?.source,
    body.selectedCandidate?.link,
    body.refinementType,
    body.intentMode
  ];
  return normalizeText(parts.filter(Boolean).join(" "));
}

export function checkSearchSafety(body: SearchRequest): SafetyCheckResult {
  const text = buildSafetyInput(body);
  const hitIllegalCategory = ILLEGAL_CATEGORY_PATTERNS.some((re) => re.test(text));
  const hitFacilitation = FACILITATION_PATTERNS.some((re) => re.test(text));
  const hitRiskHint = RISK_HINT_PATTERNS.some((re) => re.test(text));

  if (hitIllegalCategory) {
    return { blocked: true, reason: "此需求可能涉及違法或高風險服務，因此無法協助搜尋。" };
  }

  if (hitFacilitation && hitRiskHint) {
    return { blocked: true, reason: "此需求可能涉及違法或高風險服務，因此無法協助搜尋。" };
  }

  return { blocked: false };
}

export function buildBlockedResponse(intentMode: IntentMode) {
  return {
    blocked: true,
    safetyReason: "此需求可能涉及違法或高風險服務，因此無法協助搜尋。",
    candidates: [],
    parsedIntent: null,
    intentMode,
    generatedQueries: [],
    errorMessage: "Blocked by safety layer"
  };
}
