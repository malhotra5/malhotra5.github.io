import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Blog Editor' },
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true },
        }),
        date: fields.text({
          label: 'Date',
          description: 'e.g. "Sep 24, 2025"',
          validation: { isRequired: true },
        }),
        image: fields.text({
          label: 'Hero Image',
          description: 'Path to hero image, e.g. /img/hero.png',
        }),
        imageCaption: fields.text({
          label: 'Image Caption',
          multiline: true,
        }),
        readTime: fields.text({
          label: 'Read Time',
          description: 'e.g. "5 min read"',
        }),
        originalUrl: fields.url({
          label: 'Original URL',
          description: 'Link to original post (e.g. Substack)',
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        author: fields.text({ label: 'Author' }),
        content: fields.mdx({
          label: 'Content',
        }),
      },
    }),
  },
});
