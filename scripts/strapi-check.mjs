const mode = (process.env.CMS_MODE ?? "local").toLowerCase();
const url = process.env.STRAPI_URL;
const token = process.env.STRAPI_TOKEN;

if (mode !== "strapi") {
  console.log("CMS_MODE is not 'strapi'. Current mode:", mode);
  process.exit(0);
}

if (!url) {
  console.error("Missing STRAPI_URL in environment.");
  process.exit(1);
}

const endpoint = `${url.replace(/\/+$/, "")}/api/site-content`;

try {
  const response = await fetch(endpoint, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    console.error(`Strapi check failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const json = await response.json();
  const hasData = !!(json?.data?.attributes || json?.data || json);
  console.log("Strapi reachable:", endpoint);
  console.log("Payload detected:", hasData ? "yes" : "no");
  process.exit(0);
} catch (error) {
  console.error("Strapi check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
