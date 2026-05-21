# 15 love — site

Astro static site. Content comes from **Strapi on Render** at build time (same as local when `.env` is configured).

## Local development

```sh
cp .env.example site/.env
# Paste your STRAPI_TOKEN into site/.env
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
| `STRAPI_URL` | `https://strapi-client-15-love.onrender.com` (also in `vercel.json`) |
| `STRAPI_TOKEN` | **You must add this in Vercel** → Project → Settings → Environment Variables (Production, Preview, Development) |

Without `STRAPI_TOKEN`, the build fails instead of publishing empty or stale pages.

After adding the token, redeploy from the Vercel dashboard or push to `main`.

Production deploys track the **`main`** branch. The Astro app source lives in `site/src` (see root `astro.config.mjs`). Pushes only to other branches (e.g. `push-image-width`) will not update the live site until they are merged into `main`.

## Commands

| Command | Action |
| ------- | ------ |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build (fetches Strapi) |
| `npm run preview` | Preview `./dist/` |
| `npm run cms:check` | Test Strapi credentials |
