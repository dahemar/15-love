import { localSiteContent, type SiteContent } from "../data/siteContent";

const CMS_MODE = (import.meta.env.CMS_MODE ?? "local").toLowerCase();
const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

function pickStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.filter((item): item is string => typeof item === "string");
  return normalized.length ? normalized : fallback;
}

function pickObjectArray<T>(value: unknown, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  return value.length ? (value as T[]) : fallback;
}

type PostCategory = "news" | "events" | "releases";

function parseStrapiEntity(item: any): Record<string, unknown> {
  if (!item || typeof item !== "object") return {};
  if (item.attributes && typeof item.attributes === "object") return item.attributes;
  return item as Record<string, unknown>;
}

function pickLatestTitlesByCategory(items: unknown[], limitByCategory: number): Record<PostCategory, string[]> {
  const buckets: Record<PostCategory, string[]> = {
    news: [],
    events: [],
    releases: [],
  };

  for (const item of items) {
    const src = parseStrapiEntity(item);
    const category = src.category;
    const title = src.title;

    if ((category === "news" || category === "events" || category === "releases") && typeof title === "string" && title.trim().length > 0) {
      if (buckets[category].length < limitByCategory) {
        buckets[category].push(title.trim());
      }
    }
  }

  return buckets;
}

function mergeContent(raw: unknown): SiteContent {
  const src = (raw ?? {}) as Record<string, unknown>;
  return {
    newsList: pickStringArray(src.newsList, localSiteContent.newsList),
    eventsList: pickStringArray(src.eventsList, localSiteContent.eventsList),
    newsCards: pickObjectArray(src.newsCards, localSiteContent.newsCards),
    newsFlowText: typeof src.newsFlowText === "string" && src.newsFlowText.trim().length > 0 ? src.newsFlowText : localSiteContent.newsFlowText,
    releaseList: pickStringArray(src.releaseList, localSiteContent.releaseList),
    releaseCards: pickObjectArray(src.releaseCards, localSiteContent.releaseCards),
  };
}

function normalizeStrapiPayload(json: any): Record<string, unknown> {
  // Strapi v4/v5 commonly respond with { data: { attributes: ... } } for single type.
  if (json && typeof json === "object") {
    if (json.data?.attributes && typeof json.data.attributes === "object") return json.data.attributes;
    if (json.data && typeof json.data === "object") return json.data;
  }
  return json ?? {};
}

export async function getSiteContent(): Promise<SiteContent> {
  if (CMS_MODE !== "strapi") return localSiteContent;
  if (!STRAPI_URL) return localSiteContent;

  const baseUrl = STRAPI_URL.replace(/\/+$/, "");
  const siteContentEndpoint = `${baseUrl}/api/site-content`;
  const postsEndpoint = `${baseUrl}/api/posts?fields[0]=title&fields[1]=category&sort[0]=publishedAt:desc&pagination[pageSize]=200`;
  const headers = {
    ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
  };

  try {
    const [siteContentResponse, postsResponse] = await Promise.all([
      fetch(siteContentEndpoint, {
        headers,
        cache: "no-store",
      }),
      fetch(postsEndpoint, {
        headers,
        cache: "no-store",
      }),
    ]);

    const base = siteContentResponse.ok
      ? mergeContent(normalizeStrapiPayload(await siteContentResponse.json()))
      : localSiteContent;

    if (!postsResponse.ok) {
      return base;
    }

    const postsJson = await postsResponse.json();
    const posts = Array.isArray(postsJson?.data) ? postsJson.data : [];
    const buckets = pickLatestTitlesByCategory(posts, 9);

    return {
      ...base,
      newsList: buckets.news.length ? buckets.news : base.newsList,
      eventsList: buckets.events.length ? buckets.events : base.eventsList,
      releaseList: buckets.releases.length ? buckets.releases : base.releaseList,
    };
  } catch {
    return localSiteContent;
  }
}
