// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Run `npm run dev` from the repo root (not site/). Source lives in ./src; env in site/.env.
export default defineConfig({
  srcDir: './src',
  publicDir: './public',
  compressHTML: true,
  prefetch: {
    defaultStrategy: 'hover',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    // Credentials live in site/.env (not committed)
    envDir: 'site',
  },
});
