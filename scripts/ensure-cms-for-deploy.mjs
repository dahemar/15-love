const url = (process.env.STRAPI_URL ?? "https://strapi-client-15-love.onrender.com").replace(/\/+$/, "");
const token = process.env.STRAPI_TOKEN?.trim();

const isDeploy = Boolean(process.env.VERCEL || process.env.CI);

if (!isDeploy) {
  process.exit(0);
}

if (!token) {
  console.error(
    "[15love] Deploy build requires STRAPI_TOKEN in Vercel project settings (Settings → Environment Variables).\n" +
      "Copy the same token from site/.env — Strapi returns 403 without it.",
  );
  process.exit(1);
}

const endpoint = `${url}/api/site-content`;
const response = await fetch(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!response.ok) {
  console.error(`[15love] Strapi check failed: ${response.status} ${response.statusText} (${endpoint})`);
  process.exit(1);
}

console.log("[15love] Strapi OK for deploy:", endpoint);
