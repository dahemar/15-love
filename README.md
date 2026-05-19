# 15 love — site

Astro static site. Content comes from **Strapi on Render** at build time (same as local when `.env` is configured).

## Local development

```sh
cp .env.example .env
# Paste your STRAPI_TOKEN into .env
npm install
npm run dev
```

Verify Strapi:

```sh
npm run cms:check
```

## Deploy (Vercel + GitHub)

The repo does **not** commit `.env`. Vercel must have the same variables as your local `.env`:

| Variable | Value |
| -------- | ----- |
| `CMS_MODE` | `strapi` (also set in `vercel.json`) |
| `STRAPI_URL` | `https://strapi-client-15-love.onrender.com` (also in `vercel.json`) |
| `STRAPI_TOKEN` | **You must add this in Vercel** → Project → Settings → Environment Variables (Production, Preview, Development) |

Without `STRAPI_TOKEN`, the build fails on purpose instead of publishing stale local/Lorem content.

After adding the token, redeploy from the Vercel dashboard or push to `main`.

## Commands

| Command | Action |
| ------- | ------ |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build (fetches Strapi) |
| `npm run preview` | Preview `./dist/` |
| `npm run cms:check` | Test Strapi credentials |
