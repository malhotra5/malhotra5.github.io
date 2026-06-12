# AGENTS.md — Repository Knowledge

## Overview

Personal portfolio site for Rohit Malhotra. Built with **Astro + Tailwind CSS**, deployed to **GitHub Pages** at `https://malhotra5.github.io`.

- **Repo:** `malhotra5/malhotra5.github.io`
- **Default branch:** `master`
- **Deploy branch:** `gh-pages` (built output, not source)
- **Node version:** 20

## Commands

```bash
npm run dev        # Dev server on port 12000
npm run build      # Production build → dist/
npm run preview    # Preview built site
```

## Project Structure

```
src/
├── components/    # Reusable Astro components (Navbar, BlogCard, Footer, etc.)
├── layouts/       # BaseLayout.astro, BlogPostLayout.astro
├── pages/         # File-based routing (index, blog, ventures, research, projects, hobbies)
│   └── blog/      # Individual blog post pages
├── styles/        # global.css (Tailwind directives + custom styles)
└── utils/         # Shared utilities
    └── base.ts    # ⚠️ Base path helper — see critical section below
public/
├── img/           # Static images
├── js/            # Static JS (pt.min.js particle animation)
└── fonts/         # Web fonts
```

## ⚠️ CRITICAL: Base Path Helper (`src/utils/base.ts`)

This site supports **PR preview deployments** at subpaths like `/pr-preview/pr-<N>/`. Astro's `--base` flag sets `import.meta.env.BASE_URL` at build time, but it does **NOT** automatically rewrite hardcoded paths in your templates.

### The Rule

**Every internal path** — links (`href`), images (`src`), scripts (`src`), favicons — **MUST** use the `base()` helper. Never use a bare string like `"/img/photo.png"` or `"/blog"`.

### How It Works

```ts
// src/utils/base.ts
export function base(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
```

- **Production** (`BASE_URL = /`): `base('/blog')` → `/blog`
- **PR Preview** (`BASE_URL = /pr-preview/pr-8/`): `base('/blog')` → `/pr-preview/pr-8/blog`

### Usage Examples

```astro
---
import { base } from '../utils/base';
---

<!-- Links -->
<a href={base('/')}>Home</a>
<a href={base('/blog')}>Blog</a>
<a href={base('/#about')}>About</a>

<!-- Images -->
<img src={base('/img/photo.png')} alt="Photo" />

<!-- Script tags -->
<script is:inline src={base('/js/pt.min.js')}></script>

<!-- Favicon -->
<link rel="icon" href={base('/favicon.svg')} />

<!-- Dynamic paths -->
<a href={base(`/blog/${slug}`)}>Read more</a>
```

### When NOT to Use `base()`

- External URLs (`https://...`, `mailto:...`)
- Anchor-only links within the same page (`#section` without leading `/`)
- CSS/JS assets managed by Astro's build pipeline (files in `src/` imported via `import`)

### Common Mistake

```astro
<!-- ❌ WRONG — breaks in PR previews -->
<img src="/img/photo.png" />
<a href="/blog">Blog</a>

<!-- ✅ CORRECT -->
<img src={base('/img/photo.png')} />
<a href={base('/blog')}>Blog</a>
```

## Deployment

### Production (merge to `master`)

Workflow: `.github/workflows/deploy.yml`
- Builds with `npm run build` (no `--base` flag, defaults to `/`)
- Adds `.nojekyll` to prevent GitHub Pages from ignoring `_astro/` directory
- Deploys to `gh-pages` branch via `JamesIves/github-pages-deploy-action`
- Uses `clean-exclude: pr-preview` so production deploys don't wipe PR preview subdirectories

### PR Previews (any pull request)

Workflow: `.github/workflows/pr-preview.yml`
- Triggers on PR `opened`, `synchronize`, `reopened`, `closed`
- Builds with `--base /pr-preview/pr-<N>/` so all Astro-generated asset paths are correct
- Deploys to `gh-pages` branch under `pr-preview/pr-<N>/` via `rossjrw/pr-preview-action`
- **Auto-cleans** preview directory when PR is merged or closed
- Preview URL: `https://malhotra5.github.io/pr-preview/pr-<N>/`

### `.nojekyll`

Both workflows create a `.nojekyll` file in the build output. This is **required** because GitHub Pages runs Jekyll by default, which ignores directories starting with `_` (like `_astro/`), breaking all CSS and JS.

## Styling

- **Tailwind CSS v3** with custom config in `tailwind.config.mjs`
- Custom colors: `accent` (cyan), `pink`, `dark`, `gray-text`
- Font: Open Sans (loaded from Google Fonts)
- Global styles in `src/styles/global.css`

## Pages & Nav Order

Navigation tabs are ordered: **About → Ventures → Research → Blog → Projects → Hobbies**

Defined in `src/components/Navbar.astro` as a `navLinks` array.

## Adding a New Blog Post

1. Create `src/pages/blog/<slug>.astro`
2. Import `BlogPostLayout` and `{ base }` from utils
3. Use `base()` for any local image `src` attributes
4. Add the post entry to the `posts` array in `src/pages/blog.astro` (images there also need `base()`)
5. The `BlogCard` component handles link generation with `base()` already

## Adding New Pages or Images

- Any new `<img src="...">`, `<a href="...">`, or `<script src="...">` referencing a local path in `public/` **must** use `base()`.
- Components that receive image paths as props (e.g., `VentureCard`, `ProjectCard`, `BlogCard`) render them directly — apply `base()` where the path is defined (in the page), not in the component.

## Known Issues

- `favicon.svg` is referenced in `BaseLayout.astro` but the file does not exist in `public/`. Browsers silently ignore this.
