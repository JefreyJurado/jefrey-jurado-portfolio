// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used to build absolute URLs for link previews (og:image, canonical).
  site: 'https://jefrey-jurado-portfolio.vercel.app',
  // The About page is now the home page; keep old links working.
  redirects: {
    '/about': '/',
  },
});
