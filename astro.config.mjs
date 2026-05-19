import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

export default defineConfig({
  integrations: [tailwind(), mdx(), react(), keystatic()],
  site: 'https://malhotra5.github.io',
  adapter: node({ mode: 'standalone' }),
  vite: {
    server: {
      watch: {
        // Don't trigger HMR/reload when Keystatic writes to content files.
        // This prevents the editor from losing cursor position on save.
        ignored: ['**/src/content/blog/**'],
      },
    },
  },
});
