export type PostCategory = "news" | "events" | "releases";

export function buildPostHref(category: PostCategory, id: string): string {
  return `/${category}/${encodeURIComponent(String(id).trim())}/`;
}

export function normalizePostTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019\u201c\u201d]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}