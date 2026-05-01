import fs from 'fs';
import path from 'path';

const UDE_BASE = process.env.PUBLIC_UDE_BASE_URL || 'https://ude.ginis.cloud';
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'uredni_deska');

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseDate(value) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseRows(html) {
  const tbodyMatch = html.match(/<tbody class="gov-table__body">([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];

  const tbody = tbodyMatch[1];
  const today = new Date().toISOString().slice(0, 10);
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [];
  let rowMatch;

  while ((rowMatch = rowRe.exec(tbody)) !== null) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
    if (cells.length < 5) continue;

    const referenceCell = cells[0];
    const titleCell = cells[1];
    const fromCell = cells[3];
    const toCell = cells[4];

    const referenceMatches = [...referenceCell.matchAll(/\stitle="([^"]+)"/g)];
    const reference = stripTags(referenceMatches.at(-1)?.[1] || referenceCell);
    const titleMatch = titleCell.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;

    const detailHref = titleMatch[1];
    const title = stripTags(titleMatch[2]);
    const sourceUrl = new URL(detailHref, `${UDE_BASE}/`).href;
    const url = new URL(sourceUrl);
    const category = decodeURIComponent(url.searchParams.get('kategorie') || 'Úřední oznámení');
    const pubDate = parseDate(stripTags(fromCell));
    const endDateText = stripTags(toCell);
    const endDate = parseDate(endDateText);
    const isArchived = Boolean(endDate && endDate < today);

    rows.push({
      reference,
      title,
      category,
      pubDate: pubDate || '2026-05-01',
      endDate,
      sourceUrl,
      isArchived,
    });
  }

  return rows;
}

function toFrontmatter(data) {
  const lines = [
    '---',
    `title: ${JSON.stringify(data.title)}`,
    `pubDate: ${data.pubDate}`,
    `category: ${JSON.stringify(data.category)}`,
    `reference: ${JSON.stringify(data.reference)}`,
    `sourceUrl: ${JSON.stringify(data.sourceUrl)}`,
    `isArchived: ${data.isArchived ? 'true' : 'false'}`,
    '---',
    '',
  ];
  return lines.join('\n');
}

async function run() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const response = await fetch(`${UDE_BASE}/deska.php?deska=OPEDAWO0A01F&format=json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch board: HTTP ${response.status}`);
  }

  const html = await response.text();
  const items = parseRows(html);
  console.log(`Found ${items.length} items`);

  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join(CONTENT_DIR, file));
    }
  }

  for (const item of items) {
    const filename = `${slugify(`${item.reference}-${item.title}`)}.md`;
    const body = [
      toFrontmatter(item),
      `# ${item.title}`,
      '',
      `Původní dokument: [Otevřít na úřední desce](${item.sourceUrl})`,
      '',
      item.endDate ? `Zobrazeno do: ${item.endDate}` : 'Zobrazeno do: bez omezení',
      '',
    ].join('\n');

    fs.writeFileSync(path.join(CONTENT_DIR, filename), body, 'utf8');
    console.log(`Wrote ${filename}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
