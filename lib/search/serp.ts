import type { Candidate } from "./types";

interface SerpImageResult {
  original?: string;
  thumbnail?: string;
  title?: string;
  source?: string;
  link?: string;
}

export async function searchImages(query: string): Promise<Candidate[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("hl", "zh-tw");
  url.searchParams.set("google_domain", "google.com");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { images_results?: SerpImageResult[] };
  const items = data.images_results ?? [];

  return items.slice(0, 12).map((item, index) => ({
    id: `${index}-${item.link ?? item.original ?? "unknown"}`,
    image: item.original ?? item.thumbnail ?? "",
    title: item.title ?? "Untitled",
    source: item.source ?? "Unknown",
    link: item.link ?? ""
  }));
}
