type NewsBlock =
  | {
      __component: "news.rich-text";
      id: number;
      body: string;
    }
  | {
      __component: "news.media";
      id: number;
      image: { url: string; alt: string; width?: number; height?: number } | null;
      imagePosition: "left" | "right" | "center" | "full";
      imageWidth?: "narrow" | "medium" | "wide";
      caption?: string;
    };

export type NewsPostView = {
  id: string;
  title: string;
  href: string;
  newsBlocks: NewsBlock[];
};

function cleanTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toNewsBlocks(card: any): NewsBlock[] {
  const blocks: NewsBlock[] = [];

  const images = Array.isArray(card?.images) ? card.images : [];
  images.forEach((image: any, index: number) => {
    if (!image || typeof image !== "object" || typeof image.src !== "string") return;
    blocks.push({
      __component: "news.media",
      id: index + 1,
      image: {
        url: image.src,
        alt: typeof image.alt === "string" && image.alt.trim() ? image.alt : "Image",
      },
      imagePosition: index % 2 === 0 ? "left" : "right",
      imageWidth: "medium",
    });
  });

  if (typeof card?.body === "string" && card.body.trim()) {
    blocks.push({
      __component: "news.rich-text",
      id: blocks.length + 1,
      body: card.body,
    });
  }

  return blocks;
}

export function getNewsPostViews(content: any): NewsPostView[] {
  const cards = Array.isArray(content?.newsCards) ? content.newsCards : [];
  const titles = Array.isArray(content?.newsList) ? content.newsList : [];

  if (!cards.length) return [];

  return cards.map((card: any, index: number) => {
    const cardId = card?.id != null ? String(card.id) : `news-${index + 1}`;
    const titleCandidate =
      typeof card?.title === "string" && card.title.trim()
        ? card.title
        : typeof titles[index] === "string"
          ? titles[index]
          : `News ${index + 1}`;

    return {
      id: cardId,
      title: cleanTitle(titleCandidate),
      href: `/news/${cardId}/`,
      newsBlocks: toNewsBlocks(card),
    };
  });
}
