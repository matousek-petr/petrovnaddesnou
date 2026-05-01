import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const CONTENT_DIR = './src/content';

/**
 * GET /api/entries/:collection
 * Vrátí všechny entries z kolekce
 */
app.get('/api/entries/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const dir = path.join(CONTENT_DIR, collection);
    
    const files = await fs.readdir(dir);
    const entries = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(dir, file), 'utf-8');
        const [frontmatter, body] = content.split('---').slice(1);
        
        entries.push({
          slug: file.replace('.md', ''),
          data: frontmatter,
          body: body.trim(),
        });
      }
    }

    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/entries/:collection/:slug
 * Vrátí jednu entry
 */
app.get('/api/entries/:collection/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const [frontmatter, body] = content.split('---').slice(1);

    res.json({
      slug,
      data: frontmatter,
      body: body.trim(),
    });
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

/**
 * POST /api/entries/:collection
 * Vytvoří nový entry
 */
app.post('/api/entries/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { slug, data, body } = req.body;
    
    const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
    const content = `---\n${data}\n---\n\n${body}`;
    
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ slug, data, body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/entries/:collection/:slug
 * Aktualizuje entry
 */
app.patch('/api/entries/:collection/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const { data, body } = req.body;
    
    const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
    const content = `---\n${data}\n---\n\n${body}`;
    
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ slug, data, body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/entries/:collection/:slug
 * Smaže entry
 */
app.delete('/api/entries/:collection/:slug', async (req, res) => {
  try {
    const { collection, slug } = req.params;
    const filePath = path.join(CONTENT_DIR, collection, `${slug}.md`);
    
    await fs.unlink(filePath);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CMS Backend API běží na http://localhost:${PORT}`);
});
