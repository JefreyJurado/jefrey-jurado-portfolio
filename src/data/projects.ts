import type { ImageMetadata } from 'astro';
import path from 'node:path';
import sharp from 'sharp';

// Every image inside src/assets/work/<slug>/ is picked up automatically,
// sorted by filename. Name files 01-..., 02-... to control the order.
// The first image is used as the cover on the home page.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/work/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
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

// Words that should stay in capitals (or a set spelling) when a filename becomes a caption.
const spellings: Record<string, string> = {
  tesda: 'TESDA', bir: 'BIR', pcx: 'PCX', cvsu: 'CvSU', smith: 'SMITH', ph: 'PH', mcearly: 'McEarly',
  balwik: 'BALWIK', nhers: "Nher's", ivys: "Ivy's", sofias: "Sofia's", wencys: "Wency's", st: 'St.',
  pvi: 'PVI', axa: 'AXA', de: 'de', la: 'la', lifepeaks: 'LifePeaks', shinsures: 'SHInsures', dont: "Don't",
};

// "05-cover-story.jpg" -> "Cover Story". Rename a file to change its caption.
function captionFrom(path: string): string {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/^\d+-/, '');
  return name
    .split('-')
    .map((w) => spellings[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function imagesFor(slug: string): Promise<WorkImage[]> {
  const keys = Object.keys(files)
    .filter((p) => p.startsWith(`/src/assets/work/${slug}/`))
    .sort();
  return Promise.all(
    keys.map(async (p) => ({ img: files[p].default, caption: captionFrom(p), tint: await tintOf(p) })),
  );
}

// Filter buttons on the home page, in display order.
export const groups = {
  editorial: 'Editorial',
  packaging: 'Packaging',
  branding: 'Logos & Branding',
  social: 'Social Media',
  print: 'Albums & Print',
} as const;

export type Group = keyof typeof groups;

export interface Project {
  slug: string;
  group: Group;
  title: string;
  client: string;
  category: string;
  year: string;
  role: string;
  tools: string[];
  summary: string;
  description: string[];
}

// Projects appear on the site in this order. A project stays hidden until
// its image folder has at least one image in it.
const all: Project[] = [
  {
    slug: 'southern-tagalog-herald',
    group: 'editorial',
    title: 'The Southern Tagalog Herald',
    client: 'The Southern Tagalog Herald Newspaper',
    category: 'Newspaper Design',
    year: '2019 – 2026',
    role: 'Graphic Designer & Editor-in-Chief',
    tools: ['InDesign', 'Photoshop'],
    summary: 'Weekly layout for three regional editions — 156 issues a year, zero missed deadlines.',
    description: [
      'Led the full weekly production cycle for the Laguna, Batangas and Cavite editions of a regional newspaper, from news gathering to print-ready CTP files sent to the press every Friday.',
      'Each issue is built from a master InDesign template: placing stories, photos, captions, ads and legal notices, balancing pages, setting headline hierarchy and running page-by-page final checks.',
      'Shown here: 2026 front pages from all three editions, plus an inside editorial page.',
    ],
  },
  {
    slug: 'balwik-magazine',
    group: 'editorial',
    title: 'BALWIK Magazine',
    client: 'BALWIK Publishing House · Sariaya, Quezon',
    category: 'Magazine Design',
    year: '2021',
    role: 'Layout Artist',
    tools: ['InDesign', 'Photoshop'],
    summary: 'Covers and inside pages for a monthly community magazine, from its first issue on.',
    description: [
      'Designed the monthly issues of BALWIK, a community news magazine in Quezon province, starting with Volume 1, Number 1 in September 2021.',
      'Each cover is built around one strong portrait and a short cover line. Inside, a consistent grid, colour-coded section heads and large pull-quote titles carry cover stories, features, interviews, editorials and opinion columns in English and Filipino.',
    ],
  },
  {
    slug: 'noors-gourmet-food',
    group: 'packaging',
    title: "Noor's Gourmet Food",
    client: "Noor's Gourmet Food",
    category: 'Packaging & Branding',
    year: '2021 – 2024',
    role: 'Packaging Designer & Brand Developer',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'A packaging system for a growing line of halal food products — spices, coffee, teas, jams and more.',
    description: [
      "Designed packaging for more than fifteen products across Noor's food lines, including spice powders, coffee and rice coffee blends, herbal teas, jams, juices and ready-to-eat dishes.",
      'Each line gets its own colour story and photography so it stands apart on the shelf, while the gold Noor seal, the halal and satisfaction marks, and a consistent label structure keep the whole range recognisable as one brand.',
    ],
  },
  {
    slug: 'paper-ph-magazine',
    group: 'editorial',
    title: 'PAPER.Ph Magazine',
    client: 'Prime Alliance of Publishers, Editors & Reporters of the Philippines',
    category: 'Magazine Design',
    year: '2020',
    role: 'Magazine Designer',
    tools: ['InDesign', 'Photoshop'],
    summary: "The launch issue of a national media association's magazine, plus its event print.",
    description: [
      "Designed the first issue of PAPER.Ph's magazine, launched at the association's first anniversary under the theme “The Media, the New Era, and the New Normal.”",
      'The issue covers news, opinion, feature and message pages, photo spreads and advertiser greetings. I also designed the event tarpaulins, certificates and guest ribbons in the same navy-and-gold look.',
    ],
  },
  {
    slug: 'logo-design',
    group: 'branding',
    title: 'Logo Design',
    client: 'Various clients',
    category: 'Logo & Identity',
    year: '2020 – 2024',
    role: 'Logo Designer',
    tools: ['Illustrator', 'Photoshop'],
    summary: 'Logos, mascots and seals for food brands, government contests, schools and small businesses.',
    description: [
      "A selection of marks across very different briefs: a bold illustrated badge for Kusina ni Ineng, a superhero-inspired mascot for TESDA's “Lingap ay Maaasahan” theme, a contest entry for the Bureau of Internal Revenue, and seals for two chapels.",
      'For the contest logos I also wrote the logo explanation that goes with each one: what every shape and colour stands for, and how it connects to the brief.',
    ],
  },
  {
    slug: 'kcd-technical-institute',
    group: 'social',
    title: 'KCD Technical Institute',
    client: 'KCD Technical Institute',
    category: 'Social Media & Campaigns',
    year: '2018',
    role: 'Graphic Designer & Marketing Staff',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'Enrollment campaigns, workshop posters and event graphics for a technical-vocational school.',
    description: [
      "Designed the school's weekly Facebook graphics and printed tarpaulins: senior high enrollment drives, free summer workshops, scholarship programs, overseas job orientations and campus events.",
      'Every piece went through a brief → design → revision → dean approval → publish workflow. Each campaign got its own look, while the KCD header and contact block kept the series consistent.',
    ],
  },
  {
    slug: 'two-hearts-institute',
    group: 'social',
    title: 'Two Hearts Institute',
    client: 'Secular Male Institute of the Two Hearts of Jesus and Mary',
    category: 'Social Media & Print',
    year: '2021 – 2023',
    role: 'Graphic Designer',
    tools: ['Photoshop', 'InDesign', 'Illustrator'],
    summary: 'Facebook posts, event posters, a daily saint series and a vocation brochure for a religious institute.',
    description: [
      "Designed the institute's day-to-day visual communication: live-stream announcements, feast day and novena posters, anniversary greetings, invitations and a daily “Saint of the Day” quote series that ran for months.",
      'Also designed a tri-fold vocation brochure and recruitment posters. Navy, gold and the institute seal tie the work together so every post is recognisable in the feed.',
    ],
  },
  {
    slug: 'nenas-herald-coffee',
    group: 'packaging',
    title: "Nena's Herald Coffee",
    client: "Nena's-Herald Health & Beauty Products",
    category: 'Packaging',
    year: '2022 – 2024',
    role: 'Packaging Designer',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'Stand-up pouch packaging for a line of six herbal coffee blends.',
    description: [
      'Designed the pouch system for a family of herbal coffee blends: Herbal, Collagen, Inday, Insulin, Purple and Tindog.',
      'One shared layout, logo placement and leaf motif keep the range consistent, while each blend gets its own colour so customers can tell them apart at a glance. Also designed the matching calling card.',
    ],
  },
  {
    slug: 'wgomez-rice',
    group: 'packaging',
    title: 'WGomez Rice Sacks',
    client: 'WGomez Vegetables & Grain Trading · Nueva Ecija',
    category: 'Packaging & Branding',
    year: '2020',
    role: 'Packaging Designer',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'A 25 kg rice sack series and trading logo for a Nueva Ecija rice wholesaler.',
    description: [
      'Designed the WGomez trading seal and a family of 25 kg rice sacks, one per variety and brand: Ivy’s, Sofia’s, Wave Nher’s and Wency’s.',
      'Each sack uses a single bold colour field so the varieties are easy to tell apart in a warehouse stack, with a shared front layout and an “Export Quality” back panel.',
    ],
  },
  {
    slug: 'birds-calendar',
    group: 'print',
    title: 'Philippine Birds Calendar',
    client: 'Private client',
    category: 'Calendar Design',
    year: '2021',
    role: 'Graphic Designer',
    tools: ['Photoshop', 'InDesign'],
    summary: 'A 2022 wall calendar featuring a different native Philippine bird each month.',
    description: [
      'A landscape wall calendar where each month features a native Philippine bird, with a short note about the species.',
      "Each month's accent colour is drawn from that bird's plumage, and a curved photo frame keeps the dates and the photo balanced on every page.",
    ],
  },
  {
    slug: 'ordination-album',
    group: 'print',
    title: 'Sacerdotal Ordination Album',
    client: 'Rev. Fr. Dennis M. Millano · Diocese of San Pablo',
    category: 'Photo Album Design',
    year: '2018',
    role: 'Photographer & Album Designer',
    tools: ['Photoshop', 'InDesign'],
    summary: 'A commemorative album telling the story of a priestly ordination, rite by rite.',
    description: [
      'Photographed the ordination at the Cathedral Parish of St. Paul the First Hermit, then designed the commemorative album.',
      'The album follows the order of the rite, from the procession and litany of saints to the laying on of hands, anointing and first blessing. Gold script titles, scripture quotes and layered photo collages give each moment its own spread.',
    ],
  },
  {
    slug: 'asean-times-magazine',
    group: 'editorial',
    title: 'ASEAN Times Magazine',
    client: 'ASEAN Times Magazine',
    category: 'Magazine Layout',
    year: '2020',
    role: 'Magazine Layout Designer',
    tools: ['InDesign', 'Photoshop'],
    summary: 'Monthly 36-page full-colour magazine layouts, plus Chinese-language newspaper pages.',
    description: [
      'Delivered monthly 36-page full-colour magazine layouts, building typographic systems and illustrated spreads that keep long-form content readable.',
      'Also produced occasional Chinese-language newspaper layouts, handling bilingual English/Chinese typesetting.',
    ],
  },
  {
    slug: 'social-media-posters',
    group: 'social',
    title: 'AXA Advisor Team Marketing',
    client: 'LifePeaks Heaven · AXA Philippines advisor team',
    category: 'Social Media & Branding',
    year: '2019 – 2021',
    role: 'Marketing Graphic Designer',
    tools: ['Photoshop', 'Illustrator', 'Canva'],
    summary: 'Weekly social media posters, recruitment ads, award templates and team logos for an AXA advisor team.',
    description: [
      'Over a two-year remote partnership, produced the weekly social media content for an AXA Philippines advisor team: financial-literacy and insurance posters in English and Filipino, recruitment ads, and award certificates for top advisors.',
      'Also designed the team identities, LifePeaks Heaven, LifePeaks Capital and SHInsures, and built reusable award templates so new certificates could be made quickly each month. Award certificates naming individual advisors are left out here for their privacy.',
    ],
  },
  {
    slug: 'product-labels',
    group: 'packaging',
    title: "Orell's & Kasama Labels",
    client: 'RGH Corporation',
    category: 'Packaging',
    year: '2023',
    role: 'Packaging Designer',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'Wrap-around labels for Premium Banana Thins and Sweet & Spicy Chili Jam.',
    description: [
      "Wrap-around labels for two products distributed by RGH Corporation: Orell's Premium Banana Thins, built around a friendly banana mascot, and KASAMA Cooperatives' Sweet & Spicy Chili Jam.",
      'Both labels carry full nutrition panels, barcodes and regulatory text laid out to print-ready specifications.',
    ],
  },
  {
    slug: 'calling-cards',
    group: 'branding',
    title: 'Calling Cards',
    client: 'Various clients',
    category: 'Branding',
    year: '2021 – 2024',
    role: 'Graphic Designer',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'Business cards for a food trading brand, a newspaper publisher and a local supplier.',
    description: [
      'A set of calling cards designed for small businesses, each matched to its industry: navy and gold for Noor Food Products Trading, a newsprint motif for The Southern Tagalog Herald, and stone textures for a gravel and sand supplier.',
    ],
  },
];

const withImages = (
  await Promise.all(all.map(async (p) => ({ ...p, images: await imagesFor(p.slug) })))
).filter((p) => p.images.length > 0);

// The strongest projects, shown first on the Work page under "Featured", in this order.
const featuredSlugs = [
  'southern-tagalog-herald',
  'balwik-magazine',
  'noors-gourmet-food',
  'paper-ph-magazine',
  'wgomez-rice',
  'logo-design',
];

export const featured = featuredSlugs
  .map((slug) => withImages.find((p) => p.slug === slug))
  .filter((p) => p !== undefined);
export const moreWork = withImages.filter((p) => !featuredSlugs.includes(p.slug));
// Featured first, so next/previous on project pages follows the Work page order.
export const projects = [...featured, ...moreWork];
