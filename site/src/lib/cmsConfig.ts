/** Production Strapi (Render). Used when STRAPI_URL is not set in the environment. */
export const PRODUCTION_STRAPI_URL = "https://strapi-client-15-love.onrender.com";

export type CmsMode = "local" | "strapi";

export function resolveCmsMode(): CmsMode {
  const explicit = (import.meta.env.CMS_MODE as string | undefined)?.trim().toLowerCase();
  if (explicit === "local") return "local";
  if (explicit === "strapi") return "strapi";
  if (import.meta.env.STRAPI_URL) return "strapi";
  if (import.meta.env.PROD) return "strapi";
  return "local";
}

export function resolveStrapiUrl(): string | undefined {
  const fromEnv = (import.meta.env.STRAPI_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return PRODUCTION_STRAPI_URL;
  return undefined;
}

export function resolveStrapiToken(): string | undefined {
  const token = (import.meta.env.STRAPI_TOKEN as string | undefined)?.trim();
  return token || undefined;
}

export function isDeployBuild(): boolean {
  return Boolean(import.meta.env.VERCEL || import.meta.env.CI);
}
