import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.EDITOR_PORT || 12001;

// Draft storage directory
const DRAFTS_DIR = path.join(process.env.HOME || '~', '.website', 'drafts');
fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Project root (two levels up from tools/editor/)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'blog');

app.use(express.json({ limit: '5mb' }));

// Serve the editor UI
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// List all drafts
app.get('/api/drafts', (_req, res) => {
  const files = fs.readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.json'));
  const drafts = files.map((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, f), 'utf-8'));
    return { id: f.replace('.json', ''), ...data };
  });
  drafts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  res.json(drafts);
});

// Get a single draft
app.get('/api/drafts/:id', (req, res) => {
  const file = path.join(DRAFTS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(fs.readFileSync(file, 'utf-8')));
});

// Save (create or update) a draft — called by auto-save
app.post('/api/drafts/:id', (req, res) => {
  const file = path.join(DRAFTS_DIR, `${req.params.id}.json`);
  const data = { ...req.body, updatedAt: Date.now() };
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

// Delete a draft
app.delete('/api/drafts/:id', (req, res) => {
  const file = path.join(DRAFTS_DIR, `${req.params.id}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ ok: true });
});

// Publish a draft → write .mdx file into src/content/blog/
app.post('/api/publish/:id', (req, res) => {
  const file = path.join(DRAFTS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Draft not found' });

  const draft = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const slug = draft.slug || req.params.id;
  const mdx = draftToMdx(draft);

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), mdx);

  res.json({ ok: true, slug, path: `src/content/blog/${slug}.mdx` });
});

// List published posts (for reference in the editor)
app.get('/api/posts', (_req, res) => {
  if (!fs.existsSync(CONTENT_DIR)) return res.json([]);
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts = files.map((f) => {
    const content = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
    const frontmatter = parseFrontmatter(content);
    return { slug: f.replace(/\.mdx?$/, ''), ...frontmatter };
  });
  res.json(posts);
});

function draftToMdx(draft) {
  const frontmatter = [
    '---',
    `title: "${escapeFm(draft.title || 'Untitled')}"`,
    `description: "${escapeFm(draft.description || '')}"`,
    `date: "${draft.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}"`,
  ];

  if (draft.image) frontmatter.push(`image: "${draft.image}"`);
  if (draft.imageCaption) frontmatter.push(`imageCaption: "${escapeFm(draft.imageCaption)}"`);
  if (draft.readTime) frontmatter.push(`readTime: "${draft.readTime}"`);
  if (draft.originalUrl) frontmatter.push(`originalUrl: "${draft.originalUrl}"`);
  if (draft.tags && draft.tags.length)
    frontmatter.push(`tags: [${draft.tags.map((t) => `"${escapeFm(t)}"`).join(', ')}]`);
  if (draft.author) frontmatter.push(`author: "${escapeFm(draft.author)}"`);

  frontmatter.push('---');

  // Check if we need the Figure import
  const body = draft.body || '';
  const needsFigure = body.includes('<Figure');
  const imports = needsFigure ? "\nimport Figure from '../../components/Figure.astro';\n" : '';

  return frontmatter.join('\n') + imports + '\n' + body + '\n';
}

function escapeFm(s) {
  return (s || '').replace(/"/g, '\\"');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  📝 Blog Editor running at http://localhost:${PORT}`);
  console.log(`  💾 Drafts saved to ${DRAFTS_DIR}\n`);
});
