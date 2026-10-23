// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Used to build absolute URLs for link previews (og:image, canonical) and the sitemap.
  site: 'https://jefrey-jurado-portfolio.vercel.app',
  // The About page is now the home page; keep old links working.
  redirects: {
    '/about': '/',
  },
  // Pages are still built ahead of time; the adapter only runs the /keystatic admin page on demand.
  // webAnalytics adds Vercel's cookie-free visitor counter to every page.
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [
    react(),
    keystatic(),
    // Lists every page for search engines at /sitemap-index.xml (the old /about redirect and the admin are left out).
    sitemap({ filter: (page) => !page.endsWith('/about/') && !page.includes('/keystatic') }),
  ],
});
