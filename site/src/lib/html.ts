export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function isHtmlLike(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function plainTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

export function renderRichBody(value?: string): string {
  if (!value) return "";
  return isHtmlLike(value) ? value : plainTextToHtml(value);
}
