const mode = (process.env.CMS_MODE ?? (process.env.STRAPI_URL || process.env.VERCEL || process.env.CI ? "strapi" : "local")).toLowerCase();
const url = (process.env.STRAPI_URL ?? (process.env.VERCEL || process.env.CI ? "https://strapi-client-15-love.onrender.com" : "")).replace(/\/+$/, "");
const token = process.env.STRAPI_TOKEN?.trim();

const isDeploy = Boolean(process.env.VERCEL || process.env.CI);

if (!isDeploy) {
  process.exit(0);
}

if (mode !== "strapi") {
  console.error(
    "[15love] Deploy build requires CMS_MODE=strapi (or omit CMS_MODE on Vercel). Current:",
    process.env.CMS_MODE ?? "(unset)",
  );
  process.exit(1);
}

if (!url) {
  console.error("[15love] Deploy build requires STRAPI_URL (or use the default Render URL on Vercel).");
  process.exit(1);
}

if (!token) {
  console.error(
    "[15love] Deploy build requires STRAPI_TOKEN in Vercel project settings (Settings → Environment Variables).\n" +
      "Copy the same token from your local site/.env — Strapi returns 403 without it.",
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
