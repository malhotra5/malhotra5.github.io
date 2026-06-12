import React from 'react';
import { config, fields, collection } from '@keystatic/core';
import { block, mark } from '@keystatic/core/content-components';
import { highlighterIcon } from '@keystar/ui/icon/icons/highlighterIcon';

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
          options: {
            image: {
              directory: 'public/img',
              publicPath: '/img/',
            },
          },
          components: {
            Figure: block({
              label: 'Figure',
              description: 'An image with alt text and optional caption',
              schema: {
                src: fields.text({
                  label: 'Image path',
                  description: 'e.g. /img/hero.png',
                  validation: { isRequired: true },
                }),
                alt: fields.text({
                  label: 'Alt text',
                  validation: { isRequired: true },
                }),
                caption: fields.text({ label: 'Caption' }),
              },
              ContentView: (props) => {
                return React.createElement(
                  'figure',
                  {
                    style: {
                      margin: '1rem 0',
                      textAlign: 'center' as const,
                    },
                  },
                  React.createElement('img', {
                    src: props.value.src,
                    alt: props.value.alt,
                    style: {
                      maxWidth: '100%',
                      borderRadius: '8px',
                    },
                  }),
                  props.value.caption &&
                    React.createElement(
                      'figcaption',
                      {
                        style: {
                          marginTop: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#666',
                        },
                      },
                      props.value.caption,
                    ),
                );
              },
            }),
            Comment: block({
              label: 'Comment',
              description: 'An editorial note — visible in the editor, hidden on the site',
              schema: {
                note: fields.text({
                  label: 'Note',
                  multiline: true,
                  validation: { isRequired: true },
                }),
              },
              ContentView: (props) =>
                React.createElement(
                  'div',
                  {
                    style: {
                      margin: '0.5rem 0',
                      padding: '0.75rem 1rem',
                      background: '#FFF9E5',
                      borderLeft: '4px solid #F5C518',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#6B5900',
                      whiteSpace: 'pre-wrap' as const,
                    },
                  },
                  React.createElement(
                    'span',
                    {
                      style: {
                        fontWeight: 'bold',
                        marginRight: '0.5rem',
                      },
                    },
                    '📝 Note:',
                  ),
                  props.value.note,
                ),
            }),
            Highlight: mark({
              label: 'Highlight',
              icon: highlighterIcon,
              tag: 'span',
              style: { backgroundColor: '#FFF176', padding: '0 2px', borderRadius: '2px' },
              schema: {
                note: fields.text({
                  label: 'Note',
                  description: 'Optional comment on this highlight',
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
