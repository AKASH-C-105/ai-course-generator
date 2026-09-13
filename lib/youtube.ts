const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const IGNORED_TERMS = new Set([
  "about",
  "and",
  "chapter",
  "course",
  "for",
  "from",
  "guide",
  "how",
  "in",
  "introduction",
  "learn",
  "lesson",
  "of",
  "the",
  "to",
  "tutorial",
]);

const TERM_ALIASES: Record<string, string[]> = {
  gcp: ["gcp", "google cloud", "google cloud platform"],
  aws: ["aws", "amazon web services"],
  azure: ["azure", "microsoft azure"],
  js: ["js", "javascript"],
  ts: ["ts", "typescript"],
  k8s: ["k8s", "kubernetes"],
};

function getRelevantTerms(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, " ")
      .split(/\s+/)
      .filter((term) => term.length >= 3 && !IGNORED_TERMS.has(term)),
  )];
}

function getTermVariants(term: string): string[] {
  return TERM_ALIASES[term] || [term];
}

function scoreVideo(query: string, title: string, description: string): number {
  const terms = getRelevantTerms(query);
  if (!terms.length) return 0;

  const titleText = title.toLowerCase();
  const searchableText = `${title} ${description}`.toLowerCase();
  let matchedTerms = 0;
  let titleMatches = 0;

  for (const term of terms) {
    const variants = getTermVariants(term);
    const matchedInTitle = variants.some((variant) => titleText.includes(variant));
    const matched = matchedInTitle || variants.some((variant) => searchableText.includes(variant));

    if (matched) matchedTerms += 1;
    if (matchedInTitle) titleMatches += 1;
  }

  const termCoverage = matchedTerms / terms.length;
  const titleCoverage = titleMatches / terms.length;
  return termCoverage * 0.65 + titleCoverage * 0.35;
}

export async function getYouTubeVideoId(query: string): Promise<string> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("[YouTube Search] YOUTUBE_API_KEY is not configured");
    return "";
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      q: query.trim(),
      type: "video",
      order: "relevance",
      maxResults: "10",
      videoEmbeddable: "true",
      safeSearch: "moderate",
    });
    const url = `${YOUTUBE_SEARCH_URL}?${params.toString()}`;
    console.log(`[YouTube Search] Searching for: "${query}"`);

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[YouTube Search] API failed (${response.status}): ${errorBody}`);
      return "";
    }

    const data = (await response.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: { title?: string; description?: string };
      }>;
    };
    const candidates = data.items
      ?.filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id!.videoId!,
        title: item.snippet?.title || "",
        score: scoreVideo(query, item.snippet?.title || "", item.snippet?.description || ""),
      }))
      .sort((first, second) => second.score - first.score) || [];
    const bestMatch = candidates.find((candidate) => {
      const titleScore = scoreVideo(query, candidate.title, "");
      return titleScore >= 0.2 && candidate.score >= 0.2;
    });
    const videoId = bestMatch?.videoId || "";

    if (videoId) {
      console.log(
        `[YouTube Search] Resolved relevant video: "${bestMatch.title}" (${bestMatch.score.toFixed(2)})`,
      );
      return videoId;
    }

    console.warn(`[YouTube Search] No relevant embeddable video found for "${query}"`);
    return "";
  } catch (error) {
    console.error("[YouTube Search] Error fetching YouTube video ID:", error);
    return "";
  }
}
