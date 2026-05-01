import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const UDE_BASE = process.env.PUBLIC_UDE_BASE_URL || 'https://ude.ginis.cloud/petrov-nad-desnou';
const contentDir = path.join(process.cwd(), 'src', 'content', 'uredni_deska');
const outDir = path.join(process.cwd(), 'public', 'dokumenty');

async function fetchToFile(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status };
  const dest = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(dest);
    res.body.on('error', reject);
    dest.on('finish', resolve);
  });
  return { ok: true };
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const full = path.join(contentDir, f);
    const src = fs.readFileSync(full, 'utf8');
    const { data } = matter(src);
    const fileUrl = data.fileUrl;
    if (!fileUrl || !fileUrl.startsWith('/')) {
      console.log(`${f}: skipping (no local fileUrl)`);
      continue;
    }
    const basename = path.basename(fileUrl);
    const outPath = path.join(outDir, basename);
    if (fs.existsSync(outPath)) {
      console.log(`${basename}: already exists`);
      continue;
    }
    const remote = `${UDE_BASE}${fileUrl}`;
    console.log(`${f}: fetching ${remote} -> ${outPath}`);
    try {
      const r = await fetchToFile(remote, outPath);
      if (!r.ok) {
        console.log(`  -> failed: HTTP ${r.status}`);
        // remove partial file if created
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      } else {
        console.log(`  -> saved`);
      }
    } catch (err) {
      console.error(`  -> error: ${err.message}`);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    }
  }
}

run().catch(err => { console.error(err); process.exit(1); });
