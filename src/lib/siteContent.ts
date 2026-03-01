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

function mergeContent(raw: unknown): SiteContent {
  const src = (raw ?? {}) as Record<string, unknown>;
  return {
    newsList: pickStringArray(src.newsList, localSiteContent.newsList),
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
  const endpoint = `${baseUrl}/api/site-content`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) return localSiteContent;

    const json = await response.json();
    const payload = normalizeStrapiPayload(json);
    return mergeContent(payload);
  } catch {
    return localSiteContent;
  }
}
