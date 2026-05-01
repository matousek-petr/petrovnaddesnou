import { getCollection } from 'astro:content';

const SITE = 'https://petrovnaddesnou.vercel.app';

export async function GET() {
  const staticPages = [
    { url: '',                        priority: '1.0', changefreq: 'weekly'  },
    { url: '/obec',                   priority: '0.8', changefreq: 'monthly' },
    { url: '/urad',                   priority: '0.9', changefreq: 'weekly'  },
    { url: '/uredni-deska',           priority: '0.9', changefreq: 'daily'   },
    { url: '/aktuality',              priority: '0.9', changefreq: 'daily'   },
    { url: '/zivot',                  priority: '0.8', changefreq: 'weekly'  },
    { url: '/rezervace-hriste',       priority: '0.7', changefreq: 'weekly'  },
    { url: '/obcasnik',               priority: '0.7', changefreq: 'monthly' },
    { url: '/ordinacni-hodiny-lekaru',priority: '0.8', changefreq: 'monthly' },
    { url: '/kontakt',                priority: '0.8', changefreq: 'monthly' },
  ];

  const aktuality = await getCollection('aktuality');
  const aktualityUrls = aktuality.map((a) => ({
    url: `/aktuality/${a.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }));

  const obcasnik = await getCollection('obcasnik');
  const obcasnikUrls = obcasnik.map((o) => ({
    url: `/obcasnik/${o.slug}`,
    priority: '0.6',
    changefreq: 'never',
  }));

  const allUrls = [...staticPages, ...aktualityUrls, ...obcasnikUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, changefreq, priority }) => `  <url>
    <loc>${SITE}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
}
