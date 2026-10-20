# Jefrey Jurado — Portfolio Website

Built with [Astro](https://astro.build). Images are optimized to WebP automatically at build time.

## Run it

```sh
npm install      # first time only
npm run dev      # open http://localhost:4321
npm run build    # production build into dist/
```

## Add or update work

1. Put images in `src/assets/work/<project-folder>/` (JPG, PNG or WebP).
   - Name them `01-...`, `02-...` to set the order. **The first image is the cover.**
   - Export around 2400px on the long side.
2. Edit the project's text in `src/data/projects.ts` (title, client, year, description).
3. A project is hidden until its folder has at least one image.

These folders are ready and waiting for images:

| Folder | Project |
| --- | --- |
| `asean-times-magazine` | Magazine spreads |
| `social-media-posters` | AXA Insurance posters & certificates |

To add a brand-new project, create a new folder and add a matching entry in `src/data/projects.ts`.

## Other things to edit

- Contact email, LinkedIn, location: `src/data/site.ts`
- Résumé PDF: replace `public/jefrey-jurado-resume.pdf`
- Home page (About: intro, facts, bio): `src/pages/index.astro`
- Work page (project grid and filters): `src/pages/work/index.astro`
- Colours and fonts: `src/styles/global.css` (top of the file)
