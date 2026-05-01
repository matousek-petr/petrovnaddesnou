import { getCollection } from 'astro:content';

export async function GET() {
  const allPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/obec', priority: '0.8', changefreq: 'monthly' },
    { url: '/urad', priority: '0.9', changefreq: 'weekly' },
    { url: '/uredni-deska', priority: '0.9', changefreq: 'daily' },
    { url: '/aktuality', priority: '0.9', changefreq: 'daily' },
    { url: '/zivot', priority: '0.8', changefreq: 'weekly' },
    { url: '/rezervace-hriste', priority: '0.8', changefreq: 'weekly' },
    { url: '/kontakt', priority: '0.8', changefreq: 'monthly' },
  ];

  // Přidej jednotlivé články
  const aktuality = await getCollection('aktuality');
  const aktualityUrls = aktuality.map((a) => ({
    url: `/aktuality/${a.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const allUrls = [...allPages, ...aktualityUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(
    (page) => `
  <url>
    <loc>https://www.petrovnaddesnou.cz${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `
  ).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
}
