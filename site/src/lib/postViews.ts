import type {
  EventBlock,
  EventDetailsBlock,
  EventPost,
  EventRichTextBlock,
  NewsBlock,
  NewsPost,
  ReleaseCard,
  SiteContent,
} from "../data/siteContent";
import { buildPostHref, normalizePostTitle } from "./postRoutes";

type ArchiveEntry = SiteContent["archiveEntries"][number];

export type NewsPostView = {
  id: string;
  legacyId?: string;
  title: string;
  href: string;
  publishedAt: string;
  dateLabel: string;
  summary?: string;
  thumbnail: ArchiveEntry["thumbnail"];
  newsBlocks: NewsBlock[];
  tags: string[];
};

export type EventPostView = {
  id: string;
  legacyId?: string;
  title: string;
  href: string;
  publishedAt: string;
  dateLabel: string;
  venue?: string;
  body?: string;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  eventBlocks: EventBlock[];
  tags: string[];
};

export type ReleasePostView = {
  id: string;
  legacyId?: string;
  title: string;
  href: string;
  publishedAt: string;
  dateLabel: string;
  image: { src: string; alt: string } | null;
  credits: ReleaseCard["credits"];
  body: string;
  links: ReleaseCard["links"];
  summary?: string;
  tags: string[];
};

function sortArchiveEntries(entries: ArchiveEntry[]): ArchiveEntry[] {
  return [...entries].sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

function findNewsPost(entry: ArchiveEntry, posts: NewsPost[]): NewsPost | undefined {
  return (
    posts.find((post) => String(post.id) === entry.id) ??
    (entry.legacyId ? posts.find((post) => String(post.legacyId) === entry.legacyId) : undefined) ??
    posts.find((post) => normalizePostTitle(post.title) === normalizePostTitle(entry.title))
  );
}

function findEventPost(entry: ArchiveEntry, posts: EventPost[]): EventPost | undefined {
  return (
    posts.find((post) => String(post.id) === entry.id) ??
    (entry.legacyId ? posts.find((post) => String(post.legacyId) === entry.legacyId) : undefined) ??
    posts.find((post) => normalizePostTitle(post.title) === normalizePostTitle(entry.title))
  );
}

function findReleaseCard(entry: ArchiveEntry, cards: ReleaseCard[]): ReleaseCard | undefined {
  return (
    cards.find((card) => String(card.id) === entry.id) ??
    (entry.legacyId ? cards.find((card) => String(card.legacyId) === entry.legacyId) : undefined) ??
    cards.find((card) => normalizePostTitle(card.title ?? "") === normalizePostTitle(entry.title))
  );
}

function fallbackNewsBlocks(entry: ArchiveEntry): NewsBlock[] {
  if (!entry.thumbnail) return [];

  return [
    {
      __component: "media",
      id: 1,
      image: {
        url: entry.thumbnail.src,
        alt: entry.thumbnail.alt,
      },
      imagePosition: "full",
      imageWidth: "wide",
    },
  ];
}

function fallbackEventBlocks(entry: ArchiveEntry): EventBlock[] {
  const blocks: EventBlock[] = [
    {
      __component: "events.details",
      id: 1,
      dateLabel: entry.dateLabel,
    },
  ];

  if (entry.thumbnail) {
    blocks.push({
      __component: "events.media",
      id: 2,
      image: {
        url: entry.thumbnail.src,
        alt: entry.thumbnail.alt,
      },
      imagePosition: "left",
      imageWidth: "medium",
    });
  }

  return blocks;
}

function eventBodyFromBlocks(post: EventPost): string | undefined {
  const richBody = post.eventBlocks
    .filter((block): block is EventRichTextBlock => block.__component === "events.rich-text")
    .map((block) => block.body ?? "")
    .filter(Boolean)
    .join("\n\n");

  if (richBody) return richBody;

  const details = post.eventBlocks.find((block): block is EventDetailsBlock => block.__component === "events.details");
  return details?.description || post.body;
}

function newsListThumbnail(post: NewsPost | undefined, entry: ArchiveEntry): ArchiveEntry["thumbnail"] {
  if (entry.thumbnail?.src?.trim()) return entry.thumbnail;

  const media = post?.newsBlocks.find(
    (block): block is Extract<NewsPost["newsBlocks"][number], { __component: "media" }> =>
      block.__component === "media" && !!block.image?.url,
  );
  if (media?.image?.url) {
    return { src: media.image.url, alt: media.image.alt };
  }

  return entry.thumbnail;
}

export function getNewsPostViews(content: SiteContent): NewsPostView[] {
  return sortArchiveEntries(content.archiveEntries)
    .filter((entry) => entry.category === "news")
    .map((entry) => {
      const post = findNewsPost(entry, content.newsPosts);

      return {
        id: entry.id,
        legacyId: entry.legacyId,
        title: post?.title || entry.title,
        href: buildPostHref("news", entry.id),
        publishedAt: entry.publishedAt,
        dateLabel: entry.dateLabel,
        summary: post?.summary,
        thumbnail: newsListThumbnail(post, entry),
        newsBlocks: post?.newsBlocks?.length ? post.newsBlocks : fallbackNewsBlocks(entry),
        tags: entry.tags,
      };
    });
}

export function getEventPostViews(content: SiteContent): EventPostView[] {
  return sortArchiveEntries(content.archiveEntries)
    .filter((entry) => entry.category === "events")
    .map((entry) => {
      const post = findEventPost(entry, content.eventPosts);
      const details = post?.eventBlocks.find((block): block is EventDetailsBlock => block.__component === "events.details");
      const imageBlock = post?.eventBlocks.find((block) => block.__component === "events.media" && !!block.image);

      return {
        id: entry.id,
        legacyId: entry.legacyId,
        title: post?.title || entry.title,
        href: buildPostHref("events", entry.id),
        publishedAt: entry.publishedAt,
        dateLabel: details?.dateLabel || entry.dateLabel,
        venue: details?.venue,
        body: post ? eventBodyFromBlocks(post) : undefined,
        image: imageBlock?.__component === "events.media" ? imageBlock.image : entry.thumbnail ? { url: entry.thumbnail.src, alt: entry.thumbnail.alt } : null,
        eventBlocks: post?.eventBlocks?.length ? post.eventBlocks : fallbackEventBlocks(entry),
        tags: entry.tags,
      };
    });
}

export function getReleasePostViews(content: SiteContent): ReleasePostView[] {
  return sortArchiveEntries(content.archiveEntries)
    .filter((entry) => entry.category === "releases")
    .map((entry) => {
      const card = findReleaseCard(entry, content.releaseCards);

      return {
        id: entry.id,
        legacyId: entry.legacyId,
        title: card?.title || entry.title,
        href: buildPostHref("releases", entry.id),
        publishedAt: entry.publishedAt,
        dateLabel: entry.dateLabel,
        image: card?.image?.src?.trim() ? card.image : entry.thumbnail,
        credits: card?.credits ?? [],
        body: card?.body ?? "",
        links: card?.links ?? [],
        summary: card?.summary,
        tags: entry.tags,
      };
    });
}