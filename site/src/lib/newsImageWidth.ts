export const NEWS_IMAGE_WIDTHS = ["xs", "narrow", "medium", "wide", "xl", "max"] as const;

export type NewsImageWidth = (typeof NEWS_IMAGE_WIDTHS)[number];

export const DEFAULT_NEWS_IMAGE_WIDTH: NewsImageWidth = "medium";

export function isNewsImageWidth(value: unknown): value is NewsImageWidth {
  return typeof value === "string" && (NEWS_IMAGE_WIDTHS as readonly string[]).includes(value);
}

export function normalizeNewsImageWidth(value: unknown): NewsImageWidth {
  return isNewsImageWidth(value) ? value : DEFAULT_NEWS_IMAGE_WIDTH;
}

export function newsImageDimensions(size: NewsImageWidth): { width: number; height: number } {
  switch (size) {
    case "xs":
      return { width: 120, height: 120 };
    case "narrow":
      return { width: 190, height: 190 };
    case "medium":
      return { width: 320, height: 260 };
    case "wide":
      return { width: 460, height: 320 };
    case "xl":
      return { width: 540, height: 360 };
    case "max":
      return { width: 636, height: 420 };
    default:
      return { width: 320, height: 260 };
  }
}

export const NEWS_IMAGE_WIDTH_CSS: Record<NewsImageWidth, string> = {
  xs: "140px",
  narrow: "220px",
  medium: "320px",
  wide: "460px",
  xl: "540px",
  max: "636px",
};
