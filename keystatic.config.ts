import { config, collection, fields } from '@keystatic/core';

// The admin page at /keystatic. Locally it edits the files on disk; on the live site
// Jefrey signs in with GitHub and each save becomes a commit, which redeploys the site.
export default config({
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: { owner: 'JefreyJurado', name: 'jefrey-jurado-portfolio' } },
  ui: {
    brand: { name: 'Jefrey Jurado — Portfolio' },
  },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { data: 'json' },
      columns: ['category', 'year'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: { label: 'Web address', description: 'Used in the page link, e.g. /work/balwik-magazine/' },
        }),
        group: fields.select({
          label: 'Filter group',
          description: 'Which Work page filter this project appears under.',
          options: [
            { label: 'Editorial', value: 'editorial' },
            { label: 'Packaging', value: 'packaging' },
            { label: 'Logos & Branding', value: 'branding' },
            { label: 'Social Media', value: 'social' },
            { label: 'Albums & Print', value: 'print' },
            { label: 'Video Editing', value: 'video' },
          ],
          defaultValue: 'editorial',
        }),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Show in the Featured section at the top of the Work page.',
        }),
        order: fields.integer({
          label: 'Order',
          description: 'Lower numbers appear first. Featured projects always come before the rest.',
          defaultValue: 100,
        }),
        category: fields.text({ label: 'Category', description: 'Shown on the card, e.g. "Magazine Design".' }),
        client: fields.text({ label: 'Client' }),
        role: fields.text({ label: 'My role' }),
        year: fields.text({ label: 'Year', description: 'e.g. "2023" or "2021 – 2024".' }),
        tools: fields.array(fields.text({ label: 'Tool' }), {
          label: 'Tools',
          itemLabel: (props) => props.value || 'Tool',
        }),
        summary: fields.text({ label: 'Summary', description: 'One sentence, shown under the title.', multiline: true }),
        description: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
          label: 'About the project',
          description: 'Used when there is no case study below.',
          itemLabel: (props) => props.value.slice(0, 60) || 'Paragraph',
        }),
        caseStudy: fields.object(
          {
            stats: fields.array(
              fields.object({
                value: fields.text({ label: 'Number', description: 'e.g. "156" or "15+"' }),
                label: fields.text({ label: 'Label', description: 'e.g. "issues a year"' }),
              }),
              { label: 'Key numbers', itemLabel: (props) => `${props.fields.value.value} ${props.fields.label.value}` },
            ),
            brief: fields.text({ label: 'The brief', multiline: true }),
            did: fields.text({ label: 'What I did', multiline: true }),
            decisions: fields.array(fields.text({ label: 'Decision', multiline: true }), {
              label: 'Design decisions',
              itemLabel: (props) => props.value.slice(0, 60) || 'Decision',
            }),
            result: fields.text({ label: 'Result', description: 'Optional. Leave empty to hide it.', multiline: true }),
          },
          {
            label: 'Case study',
            description: 'Optional. Fill in "The brief" to show the case study instead of "About the project".',
          },
        ),
        images: fields.array(
          fields.object({
            image: fields.image({
              label: 'Image',
              directory: 'src/assets/work',
              publicPath: '/src/assets/work/',
              validation: { isRequired: true },
            }),
            caption: fields.text({ label: 'Caption' }),
            alt: fields.text({
              label: 'Image description',
              description:
                'Optional. One sentence saying what the image shows, read out to blind visitors and used by Google. Not shown on the page.',
              multiline: true,
            }),
          }),
          {
            label: 'Images',
            description:
              'The first image is the cover on the Work page. Drag to reorder. For a video project, add a thumbnail here.',
            itemLabel: (props) => props.fields.caption.value || 'Image',
          },
        ),
        videos: fields.array(
          fields.object({
            url: fields.url({ label: 'YouTube or Vimeo link', validation: { isRequired: true } }),
            caption: fields.text({ label: 'Caption' }),
          }),
          {
            label: 'Videos',
            description: 'Paste a YouTube or Vimeo link (unlisted is fine). Shown above the image gallery.',
            itemLabel: (props) => props.fields.caption.value || props.fields.url.value || 'Video',
          },
        ),
      },
    }),
  },
});
