// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  srcDir: 'site/src',
  publicDir: 'site/public',
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
