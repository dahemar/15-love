import type { SiteContent } from "../data/siteContent";
import { resolveStrapiToken, resolveStrapiUrl } from "./cmsConfig";
import { normalizeNewsImageWidth } from "./newsImageWidth";
import { buildPostHref } from "./postRoutes";

export { normalizeNewsImageWidth } from "./newsImageWidth";
export type { NewsImageWidth } from "./newsImageWidth";

const STRAPI_URL = resolveStrapiUrl();
const STRAPI_TOKEN = resolveStrapiToken();
const STRAPI_CACHE_TTL_MS = Number(import.meta.env.STRAPI_CACHE_TTL_MS ?? (import.meta.env.DEV ? "0" : "60000"));
const STRAPI_DEV_BURST_CACHE_TTL_MS = Number(import.meta.env.STRAPI_DEV_BURST_CACHE_TTL_MS ?? "1000");

let cachedStrapiContent: SiteContent | null = null;
let cachedStrapiContentExpiresAt = 0;
let inFlightStrapiContentRequest: Promise<SiteContent> | null = null;

function getEffectiveStrapiCacheTtlMs(): number {
  if (!import.meta.env.DEV) return Math.max(0, STRAPI_CACHE_TTL_MS);
  if (STRAPI_CACHE_TTL_MS > 0) return STRAPI_CACHE_TTL_MS;
  return Math.max(0, STRAPI_DEV_BURST_CACHE_TTL_MS);
}

async function refreshStrapiContent(): Promise<SiteContent> {
  const content = await fetchStrapiSiteContent();
  cachedStrapiContent = content;
  cachedStrapiContentExpiresAt = Date.now() + getEffectiveStrapiCacheTtlMs();
  return content;
}

function refreshStrapiContentInBackground() {
  if (inFlightStrapiContentRequest) return;

  inFlightStrapiContentRequest = refreshStrapiContent()
    .catch((error) => {
      console.warn("[15love] Background refresh from Strapi failed:", error instanceof Error ? error.message : String(error));
      if (!cachedStrapiContent) {
        throw error;
      }
      return cachedStrapiContent;
    })
    .finally(() => {
      inFlightStrapiContentRequest = null;
    });
}

type PostCategory = "news" | "events" | "releases";

export const DEFAULT_ABOUT_TEXT = `15 love is a record label
based in copenhagen, denmark
to get in touch, send an e-mail to
info@15love.dk
looking forward to hearing from you`;

const RELEASE_CREDIT_FIELDS = [
  { key: "artistName", label: "Artist name:" },
  { key: "albumTitle", label: "Album title:" },
  { key: "catalogueNumber", label: "Catalogue number:" },
  { key: "releaseDateLabel", label: "Release date:" },
  { key: "format", label: "Format:" },
] as const;
type ArchiveEntry = SiteContent["archiveEntries"][number];
type NewsPost = SiteContent["newsPosts"][number];
type EventPost = SiteContent["eventPosts"][number];
type ReleaseCard = SiteContent["releaseCards"][number];

function pickStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.filter((item): item is string => typeof item === "string");
  return normalized.length ? normalized : fallback;
}

function pickObjectArray<T>(value: unknown, fallback: T[]): T[] {
  if (!Array.isArray(value)) return fallback;
  return value.length ? (value as T[]) : fallback;
}

function parseStrapiEntity(item: any): Record<string, unknown> {
  if (!item || typeof item !== "object") return {};
  if (item.data && typeof item.data === "object") return parseStrapiEntity(item.data);
  if (item.attributes && typeof item.attributes === "object") return item.attributes;
  return item as Record<string, unknown>;
}

function normalizeCategory(value: unknown): PostCategory | null {
  if (value === "news" || value === "events" || value === "releases") return value;
  return null;
}

function resolveMediaUrl(url: string, baseUrl: string): string {
  if (!url.startsWith("/")) return url;
  if (url.startsWith("/uploads/") || url.startsWith("/api/")) return `${baseUrl}${url}`;
  return url;
}

function parseImageLike(value: unknown, baseUrl: string): { src: string; alt: string; width?: number; height?: number } | null {
  if (!value || typeof value !== "object") return null;

  const node = parseStrapiEntity(value);
  const rawUrl = typeof node.url === "string" ? node.url : typeof node.src === "string" ? node.src : null;
  if (!rawUrl) return null;

  const alt =
    typeof node.alternativeText === "string" && node.alternativeText.trim().length > 0
      ? node.alternativeText.trim()
      : typeof node.alt === "string" && node.alt.trim().length > 0
        ? node.alt.trim()
        : "Thumbnail";

  return {
    src: resolveMediaUrl(rawUrl, baseUrl),
    alt,
    width: typeof node.width === "number" ? node.width : undefined,
    height: typeof node.height === "number" ? node.height : undefined,
  };
}

function parseImageSource(
  imageValue: unknown,
  baseUrl: string,
  fallbackUrl?: unknown,
  fallbackAlt?: unknown,
): { src: string; alt: string; width?: number; height?: number } | null {
  const direct = parseImageLike(imageValue, baseUrl);
  if (direct) return direct;

  if (typeof fallbackUrl === "string" && fallbackUrl.trim().length > 0) {
    return {
      src: resolveMediaUrl(fallbackUrl.trim(), baseUrl),
      alt: typeof fallbackAlt === "string" && fallbackAlt.trim().length > 0 ? fallbackAlt.trim() : "Thumbnail",
    };
  }

  return null;
}

function normalizeNewsImagePosition(value: unknown): "left" | "right" | "center" | "full" {
  if (value === "right" || value === "center" || value === "full") return value;
  return "left";
}

function normalizeNewsImageParagraph(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function normalizeEventImagePosition(value: unknown): "left" | "right" | "full" {
  if (value === "right" || value === "full") return value;
  return "left";
}

function isHtmlLikeText(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function splitNewsSectionBody(value: string): string[] {
  const body = value.trim();
  if (!body) return [];

  if (isHtmlLikeText(body) && /<\/p>/i.test(body)) {
    const htmlParagraphs = body
      .split(/(?<=<\/p>)/i)
      .map((part) => part.trim())
      .filter(Boolean);

    if (htmlParagraphs.length > 1) return htmlParagraphs;
  }

  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isNewsMediaComponent(value: unknown): boolean {
  return value === "media" || value === "news.media";
}

function pushNewsMediaBlock(
  parsedBlocks: NewsPost["newsBlocks"],
  image: { src: string; alt: string; width?: number; height?: number },
  options: {
    id?: unknown;
    caption?: unknown;
    imagePosition?: unknown;
    imageWidth?: unknown;
    imageParagraph?: unknown;
  },
) {
  const block: NewsPost["newsBlocks"][number] = {
    __component: "media",
    id: typeof options.id === "number" ? options.id : parsedBlocks.length + 1,
    image: {
      url: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
    },
    caption: typeof options.caption === "string" && options.caption.trim().length > 0 ? options.caption.trim() : undefined,
    imagePosition: normalizeNewsImagePosition(options.imagePosition),
    imageWidth: normalizeNewsImageWidth(options.imageWidth),
  };

  const imageParagraph = normalizeNewsImageParagraph(options.imageParagraph);
  if (imageParagraph) block.imageParagraph = imageParagraph;

  parsedBlocks.push(block);
}

function pushNewsRichTextBlock(parsedBlocks: NewsPost["newsBlocks"], body: string, id?: unknown) {
  const trimmed = body.trim();
  if (!trimmed) return;

  parsedBlocks.push({
    __component: "news.rich-text",
    id: typeof id === "number" ? id : parsedBlocks.length + 1,
    body: trimmed,
  });
}

type NewsRichTextBlockParsed = Extract<NewsPost["newsBlocks"][number], { __component: "news.rich-text" }>;
type NewsMediaBlockParsed = Extract<NewsPost["newsBlocks"][number], { __component: "media" }>;

function pushNewsMediaFromBlock(parsedBlocks: NewsPost["newsBlocks"], media: NewsMediaBlockParsed) {
  if (!media.image) return;
  pushNewsMediaBlock(
    parsedBlocks,
    {
      src: media.image.url,
      alt: media.image.alt,
      width: media.image.width,
      height: media.image.height,
    },
    {
      id: media.id,
      caption: media.caption,
      imagePosition: media.imagePosition,
      imageWidth: media.imageWidth,
      imageParagraph: media.imageParagraph,
    },
  );
}

/** body + one or more media blocks → interleave images in text flow. */
function coalesceBodyWithMediaBlocks(parsedBlocks: NewsPost["newsBlocks"]): NewsPost["newsBlocks"] {
  const richBlocks = parsedBlocks.filter(
    (block): block is NewsRichTextBlockParsed =>
      block.__component === "news.rich-text" && typeof block.body === "string" && block.body.trim().length > 0,
  );
  const mediaBlocks = parsedBlocks.filter(
    (block): block is NewsMediaBlockParsed => block.__component === "media" && !!block.image,
  );

  if (richBlocks.length !== 1 || mediaBlocks.length === 0) return parsedBlocks;
  if (richBlocks.length + mediaBlocks.length !== parsedBlocks.length) return parsedBlocks;

  const rich = richBlocks[0];
  const body = rich.body.trim();
  const sections = splitNewsSectionBody(body);
  const merged: NewsPost["newsBlocks"] = [];

  const mediaByParagraph = mediaBlocks.map((media) => ({
    media,
    paragraph: normalizeNewsImageParagraph(media.imageParagraph) ?? 1,
  }));

  const appendMediaForParagraph = (paragraphNumber: number) => {
    for (const { media, paragraph } of mediaByParagraph) {
      if (paragraph === paragraphNumber) pushNewsMediaFromBlock(merged, media);
    }
  };

  if (sections.length > 0) {
    for (const [index, section] of sections.entries()) {
      appendMediaForParagraph(index + 1);
      pushNewsRichTextBlock(merged, section, index === 0 ? rich.id : undefined);
    }

    for (const { media, paragraph } of mediaByParagraph) {
      if (paragraph > sections.length) pushNewsMediaFromBlock(merged, media);
    }

    return merged;
  }

  appendMediaForParagraph(1);
  pushNewsRichTextBlock(merged, body, rich.id);
  return merged;
}

function finalizeNewsBlocks(parsedBlocks: NewsPost["newsBlocks"], src: Record<string, unknown>, baseUrl: string) {
  ensureTopLevelNewsBody(parsedBlocks, src);

  const hasInlineMedia = parsedBlocks.some((block) => block.__component === "media" && !!block.image);
  if (!hasInlineMedia) {
    const fallbackTopLevelImage = parseImageLike(src.image, baseUrl);
    if (fallbackTopLevelImage) {
      pushNewsMediaBlock(parsedBlocks, fallbackTopLevelImage, {
        imagePosition: "left",
        imageWidth: "medium",
      });
    }
  }

  const coalesced = coalesceBodyWithMediaBlocks(parsedBlocks);
  if (coalesced !== parsedBlocks) {
    parsedBlocks.length = 0;
    parsedBlocks.push(...coalesced);
  }
}

function hasNewsRichTextBlock(parsedBlocks: NewsPost["newsBlocks"]): boolean {
  return parsedBlocks.some(
    (block) =>
      block.__component === "news.rich-text" &&
      typeof block.body === "string" &&
      block.body.trim().length > 0,
  );
}

/** Strapi often stores prose on the post `body` field while media lives in eventBlocks/newsBlocks. */
function ensureTopLevelNewsBody(parsedBlocks: NewsPost["newsBlocks"], src: Record<string, unknown>) {
  const body = typeof src.body === "string" ? src.body.trim() : "";
  if (!body || hasNewsRichTextBlock(parsedBlocks)) return;
  parsedBlocks.unshift({
    __component: "news.rich-text",
    id: 0,
    body,
  });
}

function appendNewsBlocksFromEventBlocks(parsedBlocks: NewsPost["newsBlocks"], src: Record<string, unknown>, baseUrl: string) {
  if (!Array.isArray(src.eventBlocks)) return;

  for (const block of src.eventBlocks) {
    if (!block || typeof block !== "object") continue;
    const parsed = parseStrapiEntity(block);

    if (parsed.__component === "events.rich-text") {
      const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
      if (!body) continue;
      pushNewsRichTextBlock(parsedBlocks, body, parsed.id);
      continue;
    }

    if (parsed.__component === "events.media") {
      const image = parseImageSource(parsed.image, baseUrl, parsed.imageUrl, parsed.caption);
      if (!image) continue;
      const alreadyHasSameImage = parsedBlocks.some(
        (existing) => existing.__component === "media" && existing.image?.url === image.src,
      );
      if (alreadyHasSameImage) continue;
      pushNewsMediaBlock(parsedBlocks, image, {
        id: parsed.id,
        caption: parsed.caption,
        imagePosition: parsed.imagePosition,
        imageWidth: parsed.imageWidth,
        imageParagraph: parsed.imageParagraph,
      });
    }
  }
}

function resolvePostId(item: unknown, src: Record<string, unknown>, title: string): string {
  const rawItem = item as Record<string, unknown> | null;
  const rawId = rawItem?.documentId ?? src.documentId ?? rawItem?.id ?? src.id;
  return String(rawId ?? title).trim();
}

function resolveLegacyPostId(item: unknown, src: Record<string, unknown>): string | undefined {
  const rawItem = item as Record<string, unknown> | null;
  const rawId = rawItem?.id ?? src.id;
  if (rawId === undefined || rawId === null) return undefined;
  return String(rawId).trim();
}

function resolvePostDate(src: Record<string, unknown>): string {
  return (
    (typeof src.publishedOn === "string" && src.publishedOn) ||
    (typeof src.publishedAt === "string" && src.publishedAt) ||
    (typeof src.createdAt === "string" && src.createdAt) ||
    (typeof src.updatedAt === "string" && src.updatedAt) ||
    "1970-01-01T00:00:00.000Z"
  );
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clampText(value: string, maxLength = 210): string {
  const normalized = stripHtml(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function pickPostThumbnail(src: Record<string, unknown>, baseUrl: string): { src: string; alt: string } | null {
  const single = parseImageLike(src.image, baseUrl);
  if (single) return { src: single.src, alt: single.alt };

  if (Array.isArray(src.images) && src.images.length > 0) {
    const first = parseImageLike(src.images[0], baseUrl);
    if (first) return { src: first.src, alt: first.alt };
  }

  if (Array.isArray(src.newsBlocks)) {
    for (const block of src.newsBlocks) {
      if (!block || typeof block !== "object") continue;
      const parsed = parseStrapiEntity(block);
      if (!isNewsMediaComponent(parsed.__component)) continue;
      const image = parseImageSource(parsed.image, baseUrl, parsed.imageUrl, parsed.caption);
      if (image) return { src: image.src, alt: image.alt };
    }
  }

  if (Array.isArray(src.eventBlocks)) {
    for (const block of src.eventBlocks) {
      if (!block || typeof block !== "object") continue;
      const parsed = parseStrapiEntity(block);
      if (parsed.__component !== "events.media") continue;
      const image = parseImageLike(parsed.image, baseUrl);
      if (image) return { src: image.src, alt: image.alt };
    }
  }

  return null;
}

function parseTags(src: Record<string, unknown>, category: PostCategory): string[] {
  const parsed = new Set<string>();
  const rawTags = src.tags;

  if (Array.isArray(rawTags)) {
    for (const tag of rawTags) {
      if (typeof tag === "string" && tag.trim().length > 0) {
        parsed.add(tag.trim().toLowerCase());
        continue;
      }

      if (tag && typeof tag === "object") {
        const normalized = parseStrapiEntity(tag);
        const label =
          typeof normalized.name === "string"
            ? normalized.name
            : typeof normalized.title === "string"
              ? normalized.title
              : typeof normalized.label === "string"
                ? normalized.label
                : null;
        if (label && label.trim().length > 0) parsed.add(label.trim().toLowerCase());
      }
    }
  }

  if (parsed.size === 0) {
    parsed.add(category);
  }

  return Array.from(parsed);
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function buildArchiveEntries(items: unknown[], baseUrl: string): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  for (const item of items) {
    const src = parseStrapiEntity(item);
    const category = normalizeCategory(src.category);
    const title = typeof src.title === "string" ? src.title.trim() : "";
    if (!category || !title) continue;

    const id = resolvePostId(item, src, title);
    const legacyId = resolveLegacyPostId(item, src);
    const publishedAt = resolvePostDate(src);

    entries.push({
      id,
      legacyId,
      title,
      category,
      publishedAt,
      dateLabel: formatDateLabel(publishedAt),
      tags: parseTags(src, category),
      thumbnail: pickPostThumbnail(src, baseUrl),
      href: buildPostHref(category, id),
    });
  }

  entries.sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
  return entries;
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

function parseNewsBlocks(src: Record<string, unknown>, baseUrl: string): NewsPost["newsBlocks"] {
  const parsedBlocks: NewsPost["newsBlocks"] = [];

  if (Array.isArray(src.newsBlocks)) {
    for (const block of src.newsBlocks) {
      if (!block || typeof block !== "object") continue;
      const parsed = parseStrapiEntity(block);

      if (parsed.__component === "news.rich-text") {
        const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
        if (!body) continue;
        pushNewsRichTextBlock(parsedBlocks, body, parsed.id);
        continue;
      }

      if (isNewsMediaComponent(parsed.__component)) {
        const image = parseImageSource(parsed.image, baseUrl, parsed.imageUrl, parsed.imageAlt ?? parsed.caption);
        if (!image) continue;
        pushNewsMediaBlock(parsedBlocks, image, {
          id: parsed.id,
          caption: parsed.caption,
          imagePosition: parsed.imagePosition,
          imageWidth: parsed.imageWidth,
          imageParagraph: parsed.imageParagraph,
        });
      }
    }
  }

  if (parsedBlocks.length === 0) {
    appendNewsBlocksFromEventBlocks(parsedBlocks, src, baseUrl);
  }

  if (parsedBlocks.length > 0) {
    finalizeNewsBlocks(parsedBlocks, src, baseUrl);
    return parsedBlocks;
  }

  if (Array.isArray(src.images)) {
    for (const [index, imageValue] of src.images.slice(0, 2).entries()) {
      const image = parseImageLike(imageValue, baseUrl);
      if (!image) continue;
      pushNewsMediaBlock(parsedBlocks, image, {
        imagePosition: index % 2 === 0 ? "left" : "right",
        imageWidth: "medium",
      });
    }
  } else {
    const image = parseImageLike(src.image, baseUrl);
    if (image) {
      pushNewsMediaBlock(parsedBlocks, image, {
        imagePosition: "left",
        imageWidth: "medium",
      });
    }
  }

  const body = typeof src.body === "string" ? src.body.trim() : "";
  if (body) {
    pushNewsRichTextBlock(parsedBlocks, body);
  }

  finalizeNewsBlocks(parsedBlocks, src, baseUrl);
  return parsedBlocks;
}

function buildNewsPosts(items: unknown[], baseUrl: string): NewsPost[] {
  const posts: NewsPost[] = [];

  for (const item of items) {
    const src = parseStrapiEntity(item);
    if (src.category !== "news") continue;

    const title = typeof src.title === "string" ? src.title.trim() : "";
    if (!title) continue;

    const newsBlocks = parseNewsBlocks(src, baseUrl);
    if (!newsBlocks.length) continue;

    posts.push({
      id: resolvePostId(item, src, title),
      legacyId: resolveLegacyPostId(item, src),
      title,
      summary: typeof src.summary === "string" && src.summary.trim().length > 0 ? src.summary.trim() : undefined,
      publishedAt: resolvePostDate(src),
      newsBlocks,
    });
  }

  posts.sort((left, right) => new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime());
  return posts;
}

function parseEventBlocks(src: Record<string, unknown>, baseUrl: string): EventPost["eventBlocks"] {
  const blocks: EventPost["eventBlocks"] = [];

  if (Array.isArray(src.eventBlocks)) {
    for (const block of src.eventBlocks) {
      if (!block || typeof block !== "object") continue;
      const parsed = parseStrapiEntity(block);

      if (parsed.__component === "events.details") {
        blocks.push({
          __component: "events.details",
          id: typeof parsed.id === "number" ? parsed.id : blocks.length + 1,
          venue: typeof parsed.venue === "string" ? parsed.venue.trim() : undefined,
          description: typeof parsed.description === "string" ? parsed.description.trim() : undefined,
          dateLabel: typeof parsed.dateLabel === "string" ? parsed.dateLabel.trim() : undefined,
        });
        continue;
      }

      if (parsed.__component === "events.rich-text") {
        const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
        blocks.push({
          __component: "events.rich-text",
          id: typeof parsed.id === "number" ? parsed.id : blocks.length + 1,
          title: typeof parsed.title === "string" ? parsed.title.trim() : undefined,
          body: body || undefined,
        });
        continue;
      }

      if (parsed.__component === "events.media") {
        const image = parseImageLike(parsed.image, baseUrl);
        const block: EventPost["eventBlocks"][number] = {
          __component: "events.media",
          id: typeof parsed.id === "number" ? parsed.id : blocks.length + 1,
          image: image
            ? {
                url: image.src,
                alt: image.alt,
                width: image.width,
                height: image.height,
              }
            : null,
          caption: typeof parsed.caption === "string" ? parsed.caption.trim() : undefined,
          imagePosition: normalizeEventImagePosition(parsed.imagePosition),
          imageWidth: normalizeNewsImageWidth(parsed.imageWidth),
        };
        const imageParagraph = normalizeNewsImageParagraph(parsed.imageParagraph);
        if (imageParagraph) block.imageParagraph = imageParagraph;
        blocks.push(block);
      }
    }
  }

  if (blocks.length > 0) return blocks;

  const body = typeof src.body === "string" ? src.body.trim() : "";
  blocks.push({
    __component: "events.details",
    id: 1,
    description: body || undefined,
  });

  const fallbackImage = parseImageLike(src.image, baseUrl);
  if (fallbackImage) {
    blocks.push({
      __component: "events.media",
      id: 2,
      image: { url: fallbackImage.src, alt: fallbackImage.alt, width: fallbackImage.width, height: fallbackImage.height },
      caption: undefined,
      imagePosition: "left",
      imageWidth: "medium",
    });
  }

  return blocks;
}

function buildEventPosts(items: unknown[], baseUrl: string): EventPost[] {
  const posts: EventPost[] = [];

  for (const item of items) {
    const src = parseStrapiEntity(item);
    if (src.category !== "events") continue;

    const title = typeof src.title === "string" ? src.title.trim() : "";
    if (!title) continue;

    const eventBlocks = parseEventBlocks(src, baseUrl);
    posts.push({
      id: resolvePostId(item, src, title),
      legacyId: resolveLegacyPostId(item, src),
      title,
      summary: typeof src.summary === "string" && src.summary.trim().length > 0 ? src.summary.trim() : undefined,
      publishedAt: resolvePostDate(src),
      body: typeof src.body === "string" && src.body.trim().length > 0 ? src.body.trim() : undefined,
      eventBlocks,
    });
  }

  posts.sort((left, right) => new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime());
  return posts;
}

function releaseDetailsToCredits(details: Record<string, unknown>): ReleaseCard["credits"] {
  const credits: ReleaseCard["credits"] = [];

  for (const field of RELEASE_CREDIT_FIELDS) {
    const value = typeof details[field.key] === "string" ? details[field.key].trim() : "";
    if (value) credits.push({ label: field.label, value });
  }

  return credits;
}

function parseCreditsFromBody(body: string): { credits: ReleaseCard["credits"]; remainder: string } {
  const lines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const credits: ReleaseCard["credits"] = [];
  const remainder: string[] = [];

  for (const line of lines) {
    let matched = false;

    for (const field of RELEASE_CREDIT_FIELDS) {
      const labelPattern = field.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = line.match(new RegExp(`^${labelPattern}\\s*(.*)$`, "i"));
      if (match) {
        const value = match[1].trim();
        if (value) credits.push({ label: field.label, value });
        matched = true;
        break;
      }
    }

    if (!matched) {
      const generic = line.match(/^([^:]+):\s*(.+)$/);
      if (generic) {
        const rawLabel = generic[1].trim().toLowerCase();
        const field = RELEASE_CREDIT_FIELDS.find((entry) => {
          const normalized = entry.label.replace(/:$/, "").trim().toLowerCase();
          return normalized === rawLabel;
        });
        if (field) {
          credits.push({ label: field.label, value: generic[2].trim() });
          matched = true;
        }
      }
    }

    if (!matched) remainder.push(line);
  }

  return { credits, remainder: remainder.join("\n\n") };
}

function parseReleaseLinks(src: Record<string, unknown>): ReleaseCard["links"] {
  if (!Array.isArray(src.releaseLinks)) return [];

  const links: ReleaseCard["links"] = [];
  for (const entry of src.releaseLinks) {
    if (!entry || typeof entry !== "object") continue;
    const parsed = parseStrapiEntity(entry);
    const label = typeof parsed.label === "string" ? parsed.label.trim() : "";
    const url = typeof parsed.url === "string" ? parsed.url.trim() : "";
    if (label && url) links.push({ label, url });
  }

  return links;
}

function parseReleaseCredits(src: Record<string, unknown>): ReleaseCard["credits"] {
  const details = parseStrapiEntity(src.releaseDetails);
  if (details && typeof details === "object") {
    const fromDetails = releaseDetailsToCredits(details);
    if (fromDetails.length > 0) return fromDetails;
  }

  if (!Array.isArray(src.credits)) return [];

  const credits: ReleaseCard["credits"] = [];
  for (const entry of src.credits) {
    if (!entry || typeof entry !== "object") continue;
    const c = entry as Record<string, unknown>;
    const label = typeof c.label === "string" ? c.label.trim() : "";
    const value = typeof c.value === "string" ? c.value.trim() : "";
    if (label && value) credits.push({ label, value });
  }

  return credits;
}

function extractAboutTextFromPosts(items: unknown[]): string | null {
  for (const item of items) {
    const src = parseStrapiEntity(item);
    if (src.category !== "about") continue;

    const body = typeof src.body === "string" ? src.body.trim() : "";
    if (body) return body;
  }

  return null;
}

function buildReleaseCards(items: unknown[], baseUrl: string): ReleaseCard[] {
  const cards: ReleaseCard[] = [];

  for (const item of items) {
    const src = parseStrapiEntity(item);
    if (src.category !== "releases") continue;

    const title = typeof src.title === "string" ? src.title.trim() : "";
    if (!title) continue;

    const summary = typeof src.summary === "string" && src.summary.trim().length > 0 ? src.summary.trim() : undefined;
    let body = typeof src.body === "string" && src.body.trim().length > 0 ? src.body.trim() : "";
    let credits = parseReleaseCredits(src);
    const links = parseReleaseLinks(src);

    if (credits.length === 0 && body) {
      const parsedBody = parseCreditsFromBody(body);
      if (parsedBody.credits.length > 0) {
        credits = parsedBody.credits;
        body = parsedBody.remainder;
      }
    }

    const image = pickPostThumbnail(src, baseUrl);

    cards.push({
      id: resolvePostId(item, src, title),
      legacyId: resolveLegacyPostId(item, src),
      title,
      summary,
      publishedAt: resolvePostDate(src),
      image: image ?? { src: "", alt: title },
      credits,
      body,
      links,
    });
  }

  cards.sort((left, right) => new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime());
  return cards;
}

function getNewsExcerpt(post: NewsPost): string {
  if (post.summary && post.summary.trim().length > 0) return clampText(post.summary, 170);
  const rich = post.newsBlocks.find(
    (block): block is Extract<NewsPost["newsBlocks"][number], { __component: "news.rich-text" }> =>
      block.__component === "news.rich-text" && typeof block.body === "string" && block.body.trim().length > 0,
  );
  return clampText(rich?.body ?? post.title, 170);
}

function getNewsImage(post: NewsPost): SiteContent["homeFeedPosts"][number]["image"] {
  const media = post.newsBlocks.find(
    (block): block is Extract<NewsPost["newsBlocks"][number], { __component: "media" }> =>
      block.__component === "media" && !!block.image,
  );
  if (!media || !media.image) return null;
  return { src: media.image.url, alt: media.image.alt };
}

function getEventExcerpt(post: EventPost): string {
  if (post.summary && post.summary.trim().length > 0) return clampText(post.summary, 170);

  const detail = post.eventBlocks.find(
    (block): block is Extract<EventPost["eventBlocks"][number], { __component: "events.details" }> =>
      block.__component === "events.details" && typeof block.description === "string" && block.description.trim().length > 0,
  );
  if (detail?.description) return clampText(detail.description, 170);

  const rich = post.eventBlocks.find(
    (block): block is Extract<EventPost["eventBlocks"][number], { __component: "events.rich-text" }> =>
      block.__component === "events.rich-text" && typeof block.body === "string" && block.body.trim().length > 0,
  );
  if (rich?.body) return clampText(rich.body, 170);

  if (post.body && post.body.trim().length > 0) return clampText(post.body, 170);
  return clampText(post.title, 170);
}

function getEventImage(post: EventPost): SiteContent["homeFeedPosts"][number]["image"] {
  const media = post.eventBlocks.find(
    (block): block is Extract<EventPost["eventBlocks"][number], { __component: "events.media" }> =>
      block.__component === "events.media" && !!block.image,
  );
  if (!media || !media.image) return null;
  return { src: media.image.url, alt: media.image.alt };
}

function getFeedImage(image: SiteContent["homeFeedPosts"][number]["image"]): SiteContent["homeFeedPosts"][number]["image"] {
  return image;
}

function getReleaseExcerpt(card: ReleaseCard): string {
  if (card.summary && card.summary.trim().length > 0) return clampText(card.summary, 170);
  if (card.body && card.body.trim().length > 0) return clampText(card.body, 170);
  return clampText(card.title ?? "release", 170);
}

function findNewsPost(entry: ArchiveEntry, posts: NewsPost[]): NewsPost | undefined {
  return posts.find((post) => post.id === entry.id) ?? posts.find((post) => normalizeText(post.title) === normalizeText(entry.title));
}

function findEventPost(entry: ArchiveEntry, posts: EventPost[]): EventPost | undefined {
  return posts.find((post) => post.id === entry.id) ?? posts.find((post) => normalizeText(post.title) === normalizeText(entry.title));
}

function withReleaseTitles(content: SiteContent): ReleaseCard[] {
  return content.releaseCards.map((card, index) => ({
    ...card,
    title: card.title || content.releaseList[index] || undefined,
  }));
}

function findReleaseCard(entry: ArchiveEntry, cards: ReleaseCard[]): ReleaseCard | undefined {
  return cards.find((card) => card.id === entry.id) ?? cards.find((card) => normalizeText(card.title ?? "") === normalizeText(entry.title));
}

function buildHomeFeedPosts(content: SiteContent): SiteContent["homeFeedPosts"] {
  const titledReleaseCards = withReleaseTitles(content);

  return [...content.archiveEntries]
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .map((entry) => {
      if (entry.category === "news") {
        const post = findNewsPost(entry, content.newsPosts);
        return {
          id: entry.id,
          category: entry.category,
          title: entry.title,
          excerpt: post ? getNewsExcerpt(post) : clampText(entry.title, 170),
          image: getFeedImage(post ? getNewsImage(post) ?? entry.thumbnail : entry.thumbnail),
          publishedAt: entry.publishedAt,
          dateLabel: entry.dateLabel,
          href: entry.href,
        };
      }

      if (entry.category === "events") {
        const post = findEventPost(entry, content.eventPosts);
        return {
          id: entry.id,
          category: entry.category,
          title: entry.title,
          excerpt: post ? getEventExcerpt(post) : clampText(entry.title, 170),
          image: getFeedImage(post ? getEventImage(post) ?? entry.thumbnail : entry.thumbnail),
          publishedAt: entry.publishedAt,
          dateLabel: entry.dateLabel,
          href: entry.href,
        };
      }

      const card = findReleaseCard(entry, titledReleaseCards);
      return {
        id: entry.id,
        category: entry.category,
        title: entry.title,
        excerpt: card ? getReleaseExcerpt(card) : clampText(entry.title, 170),
        image: getFeedImage(card ? card.image ?? entry.thumbnail : entry.thumbnail),
        publishedAt: entry.publishedAt,
        dateLabel: entry.dateLabel,
        href: entry.href,
      };
    });
}

function pickRenderedTitles(content: SiteContent): Pick<SiteContent, "newsList" | "eventsList" | "releaseList"> {
  const newsList = content.newsPosts.slice(0, 9).map((post) => post.title);
  const eventsList = content.eventPosts.slice(0, 9).map((post) => post.title);
  const releaseList = withReleaseTitles(content)
    .slice(0, 9)
    .map((card) => card.title)
    .filter((title): title is string => typeof title === "string" && title.trim().length > 0);

  return {
    newsList: newsList.length ? newsList : content.newsList,
    eventsList: eventsList.length ? eventsList : content.eventsList,
    releaseList: releaseList.length ? releaseList : content.releaseList,
  };
}

function withDerivedContent(content: SiteContent): SiteContent {
  const archiveEntries = content.archiveEntries.map((entry) => ({
    ...entry,
    href: buildPostHref(entry.category, entry.id),
  }));

  const renderedTitles = pickRenderedTitles(content);
  const contentWithLinks = {
    ...content,
    archiveEntries,
  };

  return {
    ...contentWithLinks,
    newsList: renderedTitles.newsList,
    eventsList: renderedTitles.eventsList,
    releaseList: renderedTitles.releaseList,
    homeFeedPosts: buildHomeFeedPosts(contentWithLinks),
  };
}

function emptyStrapiSiteContent(): SiteContent {
  return {
    newsList: [],
    newsPosts: [],
    eventsList: [],
    newsCards: [],
    newsFlowText: "",
    releaseList: [],
    releaseCards: [],
    eventPosts: [],
    homeFeedPosts: [],
    about: { text: "", backgroundImage: null },
    archiveEntries: [],
  };
}

function mergeContent(raw: unknown, baseUrl: string): SiteContent {
  const src = (raw ?? {}) as Record<string, unknown>;
  const base = emptyStrapiSiteContent();
  const bgImage = parseImageLike(src.aboutBackground, baseUrl);

  const aboutText = typeof src.aboutText === "string" ? src.aboutText.trim() : "";

  return {
    ...base,
    about: {
      text: aboutText || DEFAULT_ABOUT_TEXT,
      backgroundImage: bgImage ? { src: bgImage.src, alt: bgImage.alt } : null,
    },
  };
}

function normalizeStrapiPayload(json: any): Record<string, unknown> {
  if (json && typeof json === "object") {
    if (json.data?.attributes && typeof json.data.attributes === "object") return json.data.attributes;
    if (json.data && typeof json.data === "object") return json.data;
  }
  return json ?? {};
}

async function fetchStrapiSiteContent(): Promise<SiteContent> {
  const baseUrl = STRAPI_URL.replace(/\/+$/, "");
  const siteContentEndpoint = `${baseUrl}/api/site-content?populate=aboutBackground`;
  const postsQuery = [
    "sort[0]=publishedOn:desc",
    "sort[1]=publishedAt:desc",
    "pagination[pageSize]=200",
    "populate[image][fields][0]=url",
    "populate[image][fields][1]=alternativeText",
    "populate[image][fields][2]=width",
    "populate[image][fields][3]=height",
    "populate[newsBlocks][populate]=*",
    "populate[eventBlocks][populate]=*",
    "populate[releaseDetails]=*",
    "populate[releaseLinks]=*",
  ].join("&");
  const postsEndpoint = `${baseUrl}/api/posts?${postsQuery}`;

  const headers = {
    ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
  };

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

  if (!siteContentResponse.ok) {
    throw new Error(`[15love] Strapi site-content returned ${siteContentResponse.status}`);
  }

  const merged = mergeContent(normalizeStrapiPayload(await siteContentResponse.json()), baseUrl);

  if (!postsResponse.ok) {
    throw new Error(`[15love] Strapi posts returned ${postsResponse.status}`);
  }

  const postsJson = await postsResponse.json();
  const posts = Array.isArray(postsJson?.data) ? postsJson.data : [];
  const aboutFromPost = extractAboutTextFromPosts(posts);
  const base = {
    ...merged,
    about: {
      ...merged.about,
      text: aboutFromPost || merged.about.text || DEFAULT_ABOUT_TEXT,
    },
  };
  const archiveEntries = buildArchiveEntries(posts, baseUrl);
  const newsPosts = buildNewsPosts(posts, baseUrl);
  const eventPosts = buildEventPosts(posts, baseUrl);
  const releaseCards = buildReleaseCards(posts, baseUrl);

  return withDerivedContent({
    ...base,
    newsPosts,
    eventPosts,
    releaseCards,
    archiveEntries,
  });
}

function requireStrapiCredentials(): void {
  if (!STRAPI_TOKEN) {
    throw new Error(
      "[15love] STRAPI_TOKEN is required (site/.env locally, Vercel → Environment Variables in production).",
    );
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  requireStrapiCredentials();

  const effectiveCacheTtlMs = getEffectiveStrapiCacheTtlMs();
  const now = Date.now();

  if (cachedStrapiContent && now < cachedStrapiContentExpiresAt) {
    return cachedStrapiContent;
  }

  if (cachedStrapiContent) {
    refreshStrapiContentInBackground();
    return cachedStrapiContent;
  }

  if (inFlightStrapiContentRequest) {
    return inFlightStrapiContentRequest;
  }

  try {
    inFlightStrapiContentRequest = refreshStrapiContent();
    const content = await inFlightStrapiContentRequest;
    cachedStrapiContentExpiresAt = now + effectiveCacheTtlMs;
    return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[15love] Strapi fetch failed (${STRAPI_URL}): ${message}`);
  } finally {
    inFlightStrapiContentRequest = null;
  }
}
