# 15 love: Current Site Status Handoff

Date: March 31, 2026

## Project layout

- Frontend: `site/`
- Design source files: `material/`
- Utility scripts: `tools/`

## Current frontend status

- The Astro site builds successfully.
- Latest verified build result: 28 pages built successfully.
- CMS mode is currently set to `strapi` in `site/.env`.
- Frontend is using the remote Strapi instance on Render.

## Current CMS configuration

From `site/.env`:

- `CMS_MODE=strapi`
- `STRAPI_URL=https://strapi-client-15-love.onrender.com`
- `STRAPI_TOKEN=` read-only token already configured locally

## Important known backend quirk

The currently deployed Render Strapi instance still has a schema mismatch:

- It accepts `eventBlocks` on `post`.
- It rejects `newsBlocks` with `ValidationError: Invalid key newsBlocks`.
- The frontend already works around this in `site/src/lib/siteContent.ts` by mapping legacy `eventBlocks` into news blocks when `newsBlocks` is missing.
- The Strapi posts query must remain compatible with Render and currently uses `populate=*`.

## Performance work already done

### Navigation and data fetching

- Removed Astro `ClientRouter` / view transitions because it broke the custom scale layout and caused zoomed pages after navigation.
- Switched Astro prefetch strategy away from aggressive viewport prefetching.
- Added in-memory Strapi caching in `site/src/lib/siteContent.ts`.
- Current cache TTL:
  - dev: 300000 ms
  - non-dev: 60000 ms
- Result: server-side route generation is now fast after the first request.

### Landing page to home transition

- Added targeted prefetch logic in `site/src/components/MockupPage.astro`.
- The landing page now prefetches `/home` on idle and also on hover, touch, or focus of the hotspot.

### Asset optimization

- Converted the main fonts to WOFF2 and kept OTF as fallback in `site/src/styles/global.css`.
- Updated preload in `site/src/layouts/BaseLayout.astro` to use WOFF2.
- Converted most large mockup images from PNG to JPG in `site/public/mockups/` and updated paths in `site/src/data/mockups.ts`.
- Kept `page-11.png` as PNG because the JPG version was larger.

## Measured asset improvements

- `Inter Regular-5af3.otf`: 255 KB -> 109 KB as WOFF2
- `TT2020 Style B Regular-4409.otf`: 3528 KB -> 1844 KB as WOFF2
- `page-03` splash mockup: 3695 KB PNG -> 736 KB JPG
- `page-08` home mockup: 3101 KB PNG -> 1324 KB JPG
- Overall mockup set reduction was substantial, but perceived slowness may still remain on slower machines or while dev tooling is active.

## Current UX status

- The user still reports that the landing-to-home transition feels slow.
- Verified server timings show the main bottleneck is no longer Astro route generation.
- Remaining perceived slowness is likely dominated by browser-side asset loading and dev-mode overhead.

## Local dev notes

There were repeated issues with stale Astro dev servers and IPv6-only listeners causing `127.0.0.1 refused to connect`.

Best known command to run locally:

```bash
cd "/Users/david/Desktop/web/15 love/site"
npm run dev -- --host 127.0.0.1 --port 4321
```

If the port is blocked, first inspect and kill stale listeners:

```bash
lsof -nP -iTCP:4321-4324 -sTCP:LISTEN
ps -axo pid,ppid,command | grep -E '[a]stro dev|[n]pm run dev'
kill <pid>
```

## Files changed recently

- `site/src/lib/siteContent.ts`
- `site/src/components/MockupPage.astro`
- `site/src/layouts/BaseLayout.astro`
- `site/src/styles/global.css`
- `site/src/data/mockups.ts`
- `site/public/fonts/Inter Regular-5af3.woff2`
- `site/public/fonts/TT2020 Style B Regular-4409.woff2`
- `site/public/mockups/page-03.jpg`
- `site/public/mockups/page-08.jpg`
- `site/public/mockups/page-17.jpg`
- `site/public/mockups/page-21.jpg`
- `site/public/mockups/page-24.jpg`
- `site/public/mockups/page-27.jpg`
- `site/public/mockups/page-30.jpg`

## Recommended next steps

1. Profile the landing-to-home transition in the browser Network panel to confirm which asset still dominates the first navigation.
2. Subset the `TT2020` font to only the glyphs actually used on the site. This should reduce it much further.
3. Consider replacing any remaining heavy full-screen mockups with modern compressed formats if visual quality remains acceptable.
4. If remote CMS edits must appear instantly in dev, add a manual cache-bust route or query flag instead of lowering the global cache too far.
5. Once the Render Strapi schema is updated, remove the legacy `eventBlocks` fallback for news.

## Quick resume prompt for next conversation

Use this as the short continuation brief:

"We are working on the 15 love Astro site in `site/`. The site builds, uses remote Strapi on Render, and has already had major performance fixes: removed ClientRouter, added Strapi in-memory caching, landing-to-home targeted prefetch, WOFF2 fonts, and compressed mockup JPGs. The user still feels the landing-to-home transition is slow, so the next step is to profile browser-side asset loading and further reduce first-navigation cost. Also note Render Strapi still rejects `newsBlocks` and the frontend currently uses a legacy `eventBlocks` fallback."