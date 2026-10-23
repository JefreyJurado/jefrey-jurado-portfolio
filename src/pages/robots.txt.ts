import type { APIRoute } from 'astro';

// Lets search engines crawl everything and points them to the sitemap.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);
};
