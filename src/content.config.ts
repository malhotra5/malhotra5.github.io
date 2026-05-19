import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    image: z.string().optional(),
    imageCaption: z.string().optional(),
    readTime: z.string().optional(),
    originalUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
  }),
});

export const collections = { blog };
