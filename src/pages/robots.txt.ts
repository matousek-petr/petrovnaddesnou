export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://petrovnaddesnou.vercel.app/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=86400',
    },
  });
}
