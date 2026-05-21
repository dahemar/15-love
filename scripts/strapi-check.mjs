const url = (process.env.STRAPI_URL ?? "https://strapi-client-15-love.onrender.com").replace(/\/+$/, "");
const token = process.env.STRAPI_TOKEN?.trim();

if (!token) {
  console.error("Missing STRAPI_TOKEN in environment (required — Strapi returns 403 without it).");
  process.exit(1);
}

const endpoint = `${url}/api/site-content`;
const response = await fetch(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!response.ok) {
  console.error(`Strapi unreachable: ${response.status} ${response.statusText}`);
  console.error("Endpoint:", endpoint);
  process.exit(1);
}

const json = await response.json();
const hasPayload = Boolean(json?.data);
console.log("Strapi reachable:", endpoint);
console.log("Payload detected:", hasPayload ? "yes" : "no");
