/** Production Strapi (Render). */
export const PRODUCTION_STRAPI_URL = "https://strapi-client-15-love.onrender.com";

export function resolveStrapiUrl(): string {
  const fromEnv = (import.meta.env.STRAPI_URL as string | undefined)?.trim();
  return fromEnv || PRODUCTION_STRAPI_URL;
}

export function resolveStrapiToken(): string | undefined {
  const token = (import.meta.env.STRAPI_TOKEN as string | undefined)?.trim();
  return token || undefined;
}
