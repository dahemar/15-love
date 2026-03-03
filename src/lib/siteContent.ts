import { localSiteContent, type SiteContent, type EventPost, type EventBlock, type HomeFeedPost } from "../data/siteContent";

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
  return value as T[]; // respect empty arrays from Strapi (don't fall back)
}

type PostCategory = "news" | "events" | "releases";

type PostRecord = {
  id: string;
  title: string;
  category: PostCategory;
  body?: string;
  publishedAt?: string;
  images?: unknown;
  image?: unknown;
  credits?: unknown;
  eventBlocks?: unknown[];
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

function parseUploadedImage(value: unknown, strapiBase: string): { src: string; alt: string } | null {
  if (!value || typeof value !== "object") return null;
  const src = value as Record<string, unknown>;
  const rawUrl = typeof src.url === "string" ? src.url : null;
  if (!rawUrl) return null;

  return {
    src: rawUrl.startsWith("/") ? `${strapiBase}${rawUrl}` : rawUrl,
    alt:
      typeof src.alternativeText === "string" && src.alternativeText.trim().length > 0
        ? src.alternativeText.trim()
        : "Background image",
  };
}

function parseImageArray(value: unknown): { src: string; alt: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseImage).filter((item): item is { src: string; alt: string } => Boolean(item));
}

function parseMediaImagesFromEventBlocks(value: unknown, strapiBase: string): { src: string; alt: string }[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((block) => {
      if (!block || typeof block !== "object") return null;
      const src = block as Record<string, unknown>;
      if (src.__component !== "events.media") return null;

      const image = src.image as Record<string, unknown> | null | undefined;
      if (!image || typeof image !== "object") return null;

      const rawUrl = typeof image.url === "string" ? image.url : null;
      if (!rawUrl) return null;

      const resolvedUrl = rawUrl.startsWith("/") ? `${strapiBase}${rawUrl}` : rawUrl;
      const alt = typeof image.alternativeText === "string" && image.alternativeText.trim().length > 0
        ? image.alternativeText.trim()
        : "Image";

      return { src: resolvedUrl, alt };
    })
    .filter((item): item is { src: string; alt: string } => Boolean(item));
}

function parseLeadingMediaImagesFromEventBlocks(value: unknown, strapiBase: string, limit = 2): { src: string; alt: string }[] {
  if (!Array.isArray(value)) return [];

  const images: { src: string; alt: string }[] = [];
  for (const block of value) {
    if (!block || typeof block !== "object") break;
    const src = block as Record<string, unknown>;
    if (src.__component !== "events.media") break;

    const image = src.image as Record<string, unknown> | null | undefined;
    if (!image || typeof image !== "object") continue;

    const rawUrl = typeof image.url === "string" ? image.url : null;
    if (!rawUrl) continue;

    images.push({
      src: rawUrl.startsWith("/") ? `${strapiBase}${rawUrl}` : rawUrl,
      alt:
        typeof image.alternativeText === "string" && image.alternativeText.trim().length > 0
          ? image.alternativeText.trim()
          : "Image",
    });

    if (images.length >= limit) break;
  }

  return images;
}

function stripText(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(value: string, maxLength = 220): string {
  const clean = stripText(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}`;
}

function parseBodyFromEventBlocks(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const parts: string[] = [];

  for (const block of value) {
    if (!block || typeof block !== "object") continue;
    const src = block as Record<string, unknown>;
    const component = src.__component;

    if (component === "events.rich-text") {
      const body = typeof src.body === "string" ? src.body : "";
      if (body) parts.push(body);
    }

    if (component === "events.details") {
      const description = typeof src.description === "string" ? src.description : "";
      if (description) parts.push(description);
    }
  }

  return parts.join("\n\n");
}

function buildHomeFeedPosts(posts: PostRecord[], strapiBase: string, limit = 200): HomeFeedPost[] {
  return posts.slice(0, limit).map((post) => {
    const legacyImages = parseImageArray(post.images);
    const leadingMediaImages = parseLeadingMediaImagesFromEventBlocks(post.eventBlocks, strapiBase, 2);

    let images: { src: string; alt: string }[] = [];
    if (post.category === "releases") {
      const releaseImage = parseImage(post.image);
      images = releaseImage ? [releaseImage] : [];
    } else if (legacyImages.length) {
      images = legacyImages.slice(0, 2);
    } else if (leadingMediaImages.length) {
      images = leadingMediaImages;
    }

    const eventBlockBody = parseBodyFromEventBlocks(post.eventBlocks);
    const textSource = post.body && post.body.trim().length > 0 ? post.body : eventBlockBody;

    return {
      id: post.id,
      category: post.category,
      title: post.title,
      excerpt: buildExcerpt(textSource || post.title),
      images,
      href: `/${post.category}#${post.id}`,
    };
  });
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
    const publishedAt = typeof src.publishedAt === "string" ? src.publishedAt : "";
    if (
      (category !== "news" && category !== "events" && category !== "releases") ||
      typeof title !== "string" ||
      !title.trim() ||
      !publishedAt
    ) {
      continue;
    }

    const idSource = (src.documentId ?? src.id) as unknown;
    posts.push({
      id: typeof idSource === "string" || typeof idSource === "number" ? String(idSource) : `${category}-${posts.length}`,
      title: title.trim(),
      category,
      body: typeof src.body === "string" ? src.body : undefined,
      publishedAt,
      images: src.images,
      image: src.image,
      credits: src.credits,
      eventBlocks: Array.isArray(src.eventBlocks) ? src.eventBlocks : [],
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

function parseEventBlocks(raw: unknown[], strapiBase: string): EventBlock[] {
  const blocks: EventBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const b = item as Record<string, unknown>;
    const comp = b.__component;

    if (comp === "events.details") {
      blocks.push({
        __component: "events.details",
        id: typeof b.id === "number" ? b.id : 0,
        headline: typeof b.headline === "string" ? b.headline : "",
        venue: typeof b.venue === "string" ? b.venue : undefined,
        description: typeof b.description === "string" ? b.description : undefined,
        dateLabel: typeof b.dateLabel === "string" ? b.dateLabel : undefined,
      });
    } else if (comp === "events.rich-text") {
      blocks.push({
        __component: "events.rich-text",
        id: typeof b.id === "number" ? b.id : 0,
        title: typeof b.title === "string" ? b.title : undefined,
        body: typeof b.body === "string" ? b.body : undefined,
      });
    } else if (comp === "events.media") {
      // image may be: { url, alternativeText, width, height } (v5 flat) or null/undefined
      const imgRaw = b.image as Record<string, unknown> | null | undefined;
      let image: { url: string; alt: string; width?: number; height?: number } | null = null;
      if (imgRaw && typeof imgRaw === "object") {
        const url = typeof imgRaw.url === "string" ? imgRaw.url : null;
        if (url) {
          const resolvedUrl = url.startsWith("/") ? `${strapiBase}${url}` : url;
          image = {
            url: resolvedUrl,
            alt: typeof imgRaw.alternativeText === "string" && imgRaw.alternativeText.trim()
              ? imgRaw.alternativeText.trim()
              : "Image",
            width: typeof imgRaw.width === "number" ? imgRaw.width : undefined,
            height: typeof imgRaw.height === "number" ? imgRaw.height : undefined,
          };
        }
      }
      const pos = b.imagePosition;
      blocks.push({
        __component: "events.media",
        id: typeof b.id === "number" ? b.id : 0,
        image,
        caption: typeof b.caption === "string" ? b.caption : undefined,
        imagePosition: pos === "right" ? "right" : pos === "full" ? "full" : "left",
      });
    }
  }
  return blocks;
}

function parseEventPosts(posts: PostRecord[], strapiBase: string): EventPost[] {
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    eventBlocks: parseEventBlocks(Array.isArray(post.eventBlocks) ? post.eventBlocks : [], strapiBase),
  }));
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
    eventPosts: [],
    homeFeedPosts: [],
    about: {
      text:
        typeof src.aboutText === "string" && src.aboutText.trim().length > 0
          ? src.aboutText
          : localSiteContent.about.text,
      backgroundImage: null,
    },
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
  const siteContentEndpoint = `${baseUrl}/api/site-content?populate[aboutBackground]=*`;
  const postsEndpoint = `${baseUrl}/api/posts?sort[0]=publishedAt:desc&pagination[pageSize]=200&populate[eventBlocks][populate]=*`;
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

    const normalizedSiteContent = siteContentResponse.ok
      ? normalizeStrapiPayload(await siteContentResponse.json())
      : null;

    const base = normalizedSiteContent ? mergeContent(normalizedSiteContent) : localSiteContent;

    const aboutBackground = normalizedSiteContent
      ? parseUploadedImage((normalizedSiteContent as Record<string, unknown>).aboutBackground, baseUrl)
      : null;

    if (!postsResponse.ok) {
      return base;
    }

    const postsJson = await postsResponse.json();
    const rawPosts = Array.isArray(postsJson?.data) ? postsJson.data : [];
    const posts = parsePosts(rawPosts);
    const buckets = pickLatestPostsByCategory(posts, 9);

    // Enrich local fallback cards with titles from Strapi posts (one-to-one by index)
    const newsCardsWithTitles = base.newsCards.map((card, i) => ({
      ...card,
      title: buckets.news[i]?.title ?? card.title,
    }));

    // Build Strapi-sourced cards for all news posts.
    // Images are optional: posts without images still render as text cards.
    const newsCardsFromPosts = buckets.news
      .map((post) => {
        const imagesFromLegacy = parseImageArray(post.images);
        const imagesFromBlocks = parseMediaImagesFromEventBlocks(post.eventBlocks, baseUrl);
        const images = imagesFromLegacy.length ? imagesFromLegacy : imagesFromBlocks;
        return {
          id: post.id,
          title: post.title,
          images: images.slice(0, 2),
          body: post.body,
        };
      });

    const releaseCardsFromPosts = buckets.releases.map((post) => {
      const image = parseImage(post.image);
      return {
        id: post.id,
        image,
        credits: parseCredits(post.credits),
        body: typeof post.body === "string" ? post.body : "",
      };
    });

    const eventPostsFromStrapi = parseEventPosts(buckets.events, baseUrl);
    const homeFeedPostsFromStrapi = buildHomeFeedPosts(posts, baseUrl);

    return {
      ...base,
      newsList: buckets.news.length ? buckets.news.map((post) => post.title) : base.newsList,
      eventsList: buckets.events.length ? buckets.events.map((post) => post.title) : base.eventsList,
      releaseList: buckets.releases.length ? buckets.releases.map((post) => post.title) : base.releaseList,
      newsCards: newsCardsFromPosts.length ? newsCardsFromPosts : newsCardsWithTitles,
      releaseCards: releaseCardsFromPosts.length ? releaseCardsFromPosts : base.releaseCards,
      eventPosts: eventPostsFromStrapi,
      homeFeedPosts: homeFeedPostsFromStrapi,
      about: {
        ...base.about,
        backgroundImage: aboutBackground,
      },
    };
  } catch {
    return localSiteContent;
  }
}
