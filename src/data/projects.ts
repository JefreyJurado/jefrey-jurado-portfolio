import type { ImageMetadata } from 'astro';
import path from 'node:path';
import sharp from 'sharp';

// Projects are edited in the admin page at /keystatic (see keystatic.config.ts), which saves
// one JSON file per project in src/content/projects/ and its images in src/assets/work/<slug>/.
const entries = import.meta.glob<ProjectEntry>('/src/content/projects/*.json', { eager: true, import: 'default' });
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/work/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
  { eager: true },
);

export interface WorkImage {
  img: ImageMetadata;
  caption: string;
  // Soft background colour sampled from the image itself, used behind it on the site.
  tint: string;
}

const NEUTRAL_TINT = 'hsl(40 6% 94%)';

// Averages the image's colourful pixels (ignoring white paper, black and greys)
// and returns that hue as a light pastel, so each design sits on a background that matches it.
async function tintOf(globKey: string): Promise<string> {
  const { data, info } = await sharp(path.join(process.cwd(), globKey))
    .resize(48, 48, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0, g = 0, b = 0, weight = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const [R, G, B] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(R, G, B);
    const sat = max === 0 ? 0 : (max - Math.min(R, G, B)) / max;
    if (max < 30 || sat < 0.18) continue;
    r += R * sat; g += G * sat; b += B * sat; weight += sat;
  }
  if (weight < 20) return NEUTRAL_TINT;

  const [h, s] = rgbToHsl(r / weight, g / weight, b / weight);
  // Averaging mutes colours, so lift the saturation back into a clear but soft pastel range.
  const sat = Math.min(Math.max(s * 1.5, 0.3), 0.62);
  return `hsl(${Math.round(h)} ${Math.round(sat * 100)}% 90%)`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

// Filter buttons on the Work page, in display order.
export const groups = {
  editorial: 'Editorial',
  packaging: 'Packaging',
  branding: 'Logos & Branding',
  social: 'Social Media',
  print: 'Albums & Print',
  video: 'Video Editing',
} as const;

export type Group = keyof typeof groups;

export interface CaseStudy {
  stats: { value: string; label: string }[];
  brief: string;
  did: string;
  decisions: string[];
  result?: string;
}

// The shape of a project file as the admin page saves it.
interface ProjectEntry {
  title: string;
  group: Group;
  featured: boolean;
  order: number | null;
  client: string;
  category: string;
  year: string;
  role: string;
  tools: string[];
  summary: string;
  description: string[];
  caseStudy: CaseStudy;
  images: { image: string | null; caption: string }[];
  videos: { url: string | null; caption: string }[];
}

export interface Video {
  embed: string;
  caption: string;
}

export interface Project {
  slug: string;
  group: Group;
  featured: boolean;
  title: string;
  client: string;
  category: string;
  year: string;
  role: string;
  tools: string[];
  summary: string;
  description: string[];
  // Only set when the brief is filled in.
  caseStudy?: CaseStudy;
  images: WorkImage[];
  videos: Video[];
}

// Turns a YouTube or Vimeo link into its embeddable player URL; other links are skipped.
function embedUrl(url: string): string | undefined {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}${vimeo[2] ? `?h=${vimeo[2]}` : ''}`;
  return undefined;
}

async function toProject(file: string, entry: ProjectEntry): Promise<Project & { order: number }> {
  const slug = file.split('/').pop()!.replace(/\.json$/, '');
  const images = await Promise.all(
    entry.images
      .filter((item) => item.image && files[item.image])
      .map(async (item) => ({ img: files[item.image!].default, caption: item.caption, tint: await tintOf(item.image!) })),
  );
  const videos = entry.videos.flatMap((v) => {
    const embed = v.url ? embedUrl(v.url) : undefined;
    return embed ? [{ embed, caption: v.caption }] : [];
  });
  const cs = entry.caseStudy;
  return {
    ...entry,
    slug,
    order: entry.order ?? 100,
    caseStudy: cs?.brief ? { ...cs, result: cs.result || undefined } : undefined,
    images,
    videos,
  };
}

// A project stays hidden until it has at least one image (its cover).
const all = (await Promise.all(Object.entries(entries).map(([file, entry]) => toProject(file, entry))))
  .filter((p) => p.images.length > 0)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const featured = all.filter((p) => p.featured);
export const moreWork = all.filter((p) => !p.featured);
// Featured first, so next/previous on project pages follows the Work page order.
export const projects = [...featured, ...moreWork];
