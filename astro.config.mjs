// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Used to build absolute URLs for link previews (og:image, canonical) and the sitemap.
  site: 'https://jefrey-jurado-portfolio.vercel.app',
  // The About page is now the home page; keep old links working.
  redirects: {
    '/about': '/',
  },
  // Lists every page for search engines at /sitemap-index.xml (the old /about redirect is left out).
  integrations: [sitemap({ filter: (page) => !page.endsWith('/about/') })],
});
