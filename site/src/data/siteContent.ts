import type { NewsImageWidth } from "../lib/newsImageWidth";

export type NewsImage = { src: string; alt: string };

export type NewsRichTextBlock = {
  __component: "news.rich-text";
  id: number;
  body?: string;
};

export type NewsMediaBlock = {
  __component: "media";
  id: number;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  caption?: string;
  imagePosition: "left" | "right" | "center" | "full";
  imageWidth: NewsImageWidth;
  imageParagraph?: number;
};

export type NewsBlock = NewsRichTextBlock | NewsMediaBlock;

export type NewsPost = {
  id: string;
  legacyId?: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  newsBlocks: NewsBlock[];
};

export type EventDetailsBlock = {
  __component: "events.details";
  id: number;
  venue?: string;
  description?: string;
  dateLabel?: string;
};

export type EventRichTextBlock = {
  __component: "events.rich-text";
  id: number;
  title?: string;
  body?: string;
};

export type EventMediaBlock = {
  __component: "events.media";
  id: number;
  image: { url: string; alt: string; width?: number; height?: number } | null;
  caption?: string;
  imagePosition: "left" | "right" | "center" | "full";
  imageWidth: NewsImageWidth;
  imageParagraph?: number;
};

export type EventBlock = EventDetailsBlock | EventRichTextBlock | EventMediaBlock;

export type EventPost = {
  id: string;
  legacyId?: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  body?: string;
  eventBlocks: EventBlock[];
};

export type HomeFeedPost = {
  id: string;
  category: "news" | "events" | "releases";
  title: string;
  excerpt: string;
  image: NewsImage | null;
  publishedAt: string;
  dateLabel: string;
  href: string;
};

export type AboutContent = {
  text: string;
  backgroundImage: { src: string; alt: string } | null;
};

export type NewsCard = {
  id: string;
  images: NewsImage[];
};

export type ReleaseCredit = { label: string; value: string };

export type ReleaseLink = {
  label: string;
  url: string;
};

export type ReleaseCard = {
  id: string;
  legacyId?: string;
  title?: string;
  summary?: string;
  publishedAt?: string;
  image: { src: string; alt: string };
  credits: ReleaseCredit[];
  body: string;
  links: ReleaseLink[];
};

export type ArchiveEntry = {
  id: string;
  legacyId?: string;
  title: string;
  category: "news" | "events" | "releases";
  publishedAt: string;
  dateLabel: string;
  tags: string[];
  thumbnail: { src: string; alt: string } | null;
  href: string;
};

export type SiteContent = {
  newsList: string[];
  newsPosts: NewsPost[];
  eventsList: string[];
  newsCards: NewsCard[];
  newsFlowText: string;
  releaseList: string[];
  releaseCards: ReleaseCard[];
  eventPosts: EventPost[];
  homeFeedPosts: HomeFeedPost[];
  about: AboutContent;
  archiveEntries: ArchiveEntry[];
};
