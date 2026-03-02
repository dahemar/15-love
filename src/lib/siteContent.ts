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

type PostRecord = {
  id: string;
  title: string;
  category: PostCategory;
  body?: string;
  images?: unknown;
  image?: unknown;
  credits?: unknown;
};

function parseStrapiEntity(item: any): Record<string, unknown> {
  if (!item || typeof item !== "object") return {};
  if (item.attributes && typeof item.attributes === "object") return item.attributes;
  return item as Record<string, unknown>;
}

function parseImage(value: unknown): { src: string; alt: string } | null {
  if (!value || typeof value !== "object") return null;
  const src = (value as any).src;
  const alt = (value as any).alt;
  if (typeof src !== "string" || src.trim().length === 0) return null;
  return {
    src: src.trim(),
    alt: typeof alt === "string" && alt.trim().length > 0 ? alt.trim() : "Image",
  };
}

function parseImageArray(value: unknown): { src: string; alt: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseImage).filter((item): item is { src: string; alt: string } => Boolean(item));
}

function parseCredits(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  const credits = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = (item as any).label;
      const creditValue = (item as any).value;
      if (typeof label !== "string" || typeof creditValue !== "string") return null;
      return { label: label.trim(), value: creditValue.trim() };
    })
    .filter((item): item is { label: string; value: string } => Boolean(item && (item.label || item.value)));

  return credits;
}

function parsePosts(items: unknown[]): PostRecord[] {
  const posts: PostRecord[] = [];

  for (const item of items) {
    const src = parseStrapiEntity(item);
    const category = src.category;
    const title = src.title;
    if ((category !== "news" && category !== "events" && category !== "releases") || typeof title !== "string" || !title.trim()) {
      continue;
    }

    const idSource = (src.documentId ?? src.id) as unknown;
    posts.push({
      id: typeof idSource === "string" || typeof idSource === "number" ? String(idSource) : `${category}-${posts.length}`,
      title: title.trim(),
      category,
      body: typeof src.body === "string" ? src.body : undefined,
      images: src.images,
      image: src.image,
      credits: src.credits,
    });
  }

  return posts;
}

function pickLatestPostsByCategory(items: PostRecord[], limitByCategory: number): Record<PostCategory, PostRecord[]> {
  const buckets: Record<PostCategory, PostRecord[]> = {
    news: [],
    events: [],
    releases: [],
  };

  for (const item of items) {
    if (buckets[item.category].length < limitByCategory) {
      buckets[item.category].push(item);
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
  const postsEndpoint = `${baseUrl}/api/posts?sort[0]=publishedAt:desc&pagination[pageSize]=200`;
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
    const rawPosts = Array.isArray(postsJson?.data) ? postsJson.data : [];
    const posts = parsePosts(rawPosts);
    const buckets = pickLatestPostsByCategory(posts, 9);

    const newsCardsFromPosts = buckets.news
      .map((post) => {
        const images = parseImageArray(post.images);
        if (!images.length) return null;
        return {
          id: post.id,
          images: images.slice(0, 2),
          body: post.body,
        };
      })
      .filter((item): item is SiteContent["newsCards"][number] => Boolean(item));

    const releaseCardsFromPosts = buckets.releases
      .map((post) => {
        const image = parseImage(post.image);
        if (!image) return null;
        return {
          id: post.id,
          image,
          credits: parseCredits(post.credits),
          body: typeof post.body === "string" ? post.body : "",
        };
      })
      .filter((item): item is SiteContent["releaseCards"][number] => Boolean(item));

    return {
      ...base,
      newsList: buckets.news.length ? buckets.news.map((post) => post.title) : base.newsList,
      eventsList: buckets.events.length ? buckets.events.map((post) => post.title) : base.eventsList,
      releaseList: buckets.releases.length ? buckets.releases.map((post) => post.title) : base.releaseList,
      newsCards: newsCardsFromPosts.length ? newsCardsFromPosts : base.newsCards,
      releaseCards: releaseCardsFromPosts.length ? releaseCardsFromPosts : base.releaseCards,
    };
  } catch {
    return localSiteContent;
  }
}
