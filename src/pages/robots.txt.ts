export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://www.petrovnaddesnou.cz/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=86400',
    },
  });
}
