function isHtmlLike(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`);
}

function flattenSingleRootDiv(html: string): string {
  let out = html.trim();
  let prev = "";
  while (out !== prev && /^<div\b[^>]*>[\s\S]*<\/div>$/i.test(out)) {
    prev = out;
    const match = out.match(/^<div\b[^>]*>([\s\S]*)<\/div>$/i);
    out = match ? match[1].trim() : out;
  }
  return out;
}

/** Split release copy into block elements that can flow around a floated cover image. */
export function splitReleaseBodyParagraphs(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const rendered = isHtmlLike(trimmed) ? flattenSingleRootDiv(trimmed) : plainTextToParagraphs(trimmed).join("");

  if (/<\/p>/i.test(rendered)) {
    const parts = rendered
      .split(/(?<=<\/p>)/i)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length) return parts;
  }

  if (isHtmlLike(trimmed)) {
    return [rendered];
  }

  return plainTextToParagraphs(trimmed);
}

/** Inner HTML for a <p class="release-para"> (strip outer <p> if present). */
export function releaseParagraphInnerHtml(block: string): string {
  const trimmed = block.trim();
  const match = trimmed.match(/^<p\b[^>]*>([\s\S]*)<\/p>$/i);
  return match ? match[1].trim() : trimmed;
}
