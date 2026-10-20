// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The About page is now the home page; keep old links working.
  redirects: {
    '/about': '/',
  },
});
