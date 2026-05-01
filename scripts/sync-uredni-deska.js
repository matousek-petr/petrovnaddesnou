import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UDE_BASE = process.env.PUBLIC_UDE_BASE_URL || 'https://ude.ginis.cloud/petrov-nad-desnou';

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.text();
}

function extractPdfLinks(html) {
  // Very small parser: find <a ... href="...pdf" ...>text</a>
  const re = /<a[^>]+href\s*=\s*"([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
  const results = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    results.push({ href, text });
  }
  return results;
}

async function run() {
  const page = await fetchPage(UDE_BASE + '/');
  const pdfs = extractPdfLinks(page).map(item => ({
    url: item.href.startsWith('/') ? `${UDE_BASE}${item.href}` : item.href,
    title: item.text || path.basename(item.href)
  }));

  const outDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'uredni-deska-sync.json');
  fs.writeFileSync(outFile, JSON.stringify({ fetchedAt: new Date().toISOString(), source: UDE_BASE, items: pdfs }, null, 2));
  console.log(`Wrote ${outFile} (${pdfs.length} items)`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
