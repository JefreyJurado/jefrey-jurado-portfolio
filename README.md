# Jefrey Jurado — Portfolio Website

Built with [Astro](https://astro.build). Images are optimized to WebP automatically at build time.

## Run it

```sh
npm install      # first time only
npm run dev      # open http://localhost:4321
npm run build    # production build into dist/
```

## Add or update work

Use the admin page:

- **Live site:** https://jefrey-jurado-portfolio.vercel.app/keystatic, sign in with GitHub. Each save is committed to
  the repo and the site redeploys in about a minute.
- **On this computer:** `npm run dev`, then open http://localhost:4321/keystatic. Saves go straight to the files here.

Each project is one JSON file in `src/content/projects/`, with its images in `src/assets/work/<project>/`.
The form fields are defined in `keystatic.config.ts`.

- The first image is the cover on the Work page. Export around 2400px on the long side (JPG, PNG or WebP).
- A project stays hidden until it has at least one image.
- Videos: paste a YouTube or Vimeo link (unlisted is fine) and add a thumbnail as the first image.
- Fill in "The brief" under Case study to show a case study instead of "About the project".

## Other things to edit

- Contact email, LinkedIn, location: `src/data/site.ts`
- Résumé PDF: replace `public/jefrey-jurado-resume.pdf`
- Home page (About: intro, facts, bio): `src/pages/index.astro`
- Work page (project grid and filters): `src/pages/work/index.astro`
- Filter groups: `src/data/projects.ts` and the matching options in `keystatic.config.ts`
- Colours and fonts: `src/styles/global.css` (top of the file)
