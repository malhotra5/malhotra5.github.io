import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

const isDev = process.argv.includes('dev');

const integrations = [tailwind(), mdx(), react()];
let adapter;

if (isDev) {
  const keystatic = (await import('@keystatic/astro')).default;
  const node = (await import('@astrojs/node')).default;
  integrations.push(keystatic());
  adapter = node({ mode: 'standalone' });
}

export default defineConfig({
  integrations,
  site: 'https://malhotra5.github.io',
  ...(adapter && { adapter }),
});
