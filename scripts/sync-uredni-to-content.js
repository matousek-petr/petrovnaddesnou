import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UDE_BASE = process.env.PUBLIC_UDE_BASE_URL || 'https://ude.ginis.cloud/petrov-nad-desnou';
const SRC_CONTENT = path.join(process.cwd(), 'src', 'content', 'uredni_deska');

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[čć]/g, 'c')
    .replace(/[ď]/g, 'd')
    .replace(/[éěèë]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[ň]/g, 'n')
    .replace(/[óòöô]/g, 'o')
    .replace(/[ř]/g, 'r')
    .replace(/[šß]/g, 's')
    .replace(/[ť]/g, 't')
    .replace(/[úùůûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.text();
}

function parseDate(text) {
  // Expect formats like "01. 05. 2026" or "1. 5. 2026"
  const m = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!m) return null;
  const [ , d, mth, y ] = m;
  return `${y}-${String(mth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    const old = fs.readFileSync(filePath, 'utf8');
    if (old === content) return 'unchanged';
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return 'written';
}

function extractItems(html) {
  // Parse repeated document cards: look for <div class="card" ...> ... </div>
  // For each card extract category (first span), title (h2), date (time), href (first .pdf anchor in the card)
  const cardRe = /<div[^>]*class="[^"]*card[^"]*"[\s\S]*?<\/div>\s*<\/div>|<div[^>]*class="[^"]*card[^"]*"[\s\S]*?<\/div>/gi;
  const matches = [];
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const card = m[0];
    const catMatch = card.match(/<span[^>]*>([^<]+)<\/span>/i);
    const titleMatch = card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const timeMatch = card.match(/<time[^>]*>([\s\S]*?)<\/time>/i);
    const hrefMatch = card.match(/<a[^>]+href=["']([^"']+\.pdf)["'][^>]*>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g,'').trim() : null;
    const category = catMatch ? catMatch[1].trim() : null;
    const dateText = timeMatch ? timeMatch[1].trim() : null;
    const href = hrefMatch ? hrefMatch[1].trim() : null;
    if (title && href) {
      matches.push({ title, category, dateText, href });
    }
  }
  return matches;
}

async function run() {
  ensureDir(SRC_CONTENT);
  console.log(`Fetching ${UDE_BASE}/`);
  const html = await fetchPage(UDE_BASE + '/');
  const items = extractItems(html);
  console.log(`Found ${items.length} items`);
  for (const it of items) {
    const date = it.dateText ? parseDate(it.dateText) : null;
    const basename = path.basename(it.href);
    const fileUrl = `/dokumenty/${basename}`;
    const slugBase = slugify(it.title || basename.replace(/\.pdf$/i,''));
    let filename = `${slugBase}.md`;
    // avoid collisions
    let i = 1;
    while (fs.existsSync(path.join(SRC_CONTENT, filename))) {
      // read existing and compare title
      const existing = fs.readFileSync(path.join(SRC_CONTENT, filename), 'utf8');
      if (existing.includes(`title: ${it.title}`)) break; // same
      filename = `${slugBase}-${i}.md`;
      i++;
    }
    const front = {
      title: it.title,
      pubDate: date || new Date().toISOString().slice(0,10),
      category: it.category || 'Úřední oznámení',
      fileUrl
    };
    const md = `---\n${Object.entries(front).map(([k,v]) => `${k}: ${v}`).join('\n')}\n---\n\n` + (it.title ? `# ${it.title}\n\n` : '') + `Původní dokument: ${UDE_BASE}${it.href}\n`;
    const outPath = path.join(SRC_CONTENT, filename);
    const res = writeIfChanged(outPath, md);
    console.log(`${filename}: ${res}`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
