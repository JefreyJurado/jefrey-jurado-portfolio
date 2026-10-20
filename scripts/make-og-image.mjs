// Builds public/og.jpg, the preview image shown when the site link is shared
// (LinkedIn, Facebook, Messenger, email). Run: node scripts/make-og-image.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;
const covers = [
  'src/assets/work/southern-tagalog-herald/01-laguna-anilag-festival.jpg',
  'src/assets/work/balwik-magazine/01-october-cover.jpg',
  'src/assets/work/noors-gourmet-food/01-coffee-moringa.jpg',
];

const background = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#73030d"/>
      <stop offset="1" stop-color="#732f3b"/>
    </linearGradient>
    <radialGradient id="glow" cx="1" cy="0" r="0.9">
      <stop offset="0" stop-color="#f2f2f2" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#f2f2f2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="64" y="72" width="168" height="40" rx="20" fill="none" stroke="#f2f2f2" stroke-opacity="0.45"/>
  <text x="148" y="98" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="2" fill="#f2f2f2" fill-opacity="0.9">PORTFOLIO</text>
  <text x="64" y="232" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700" letter-spacing="-3" fill="#f2f2f2">Jefrey</text>
  <text x="64" y="320" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="700" letter-spacing="-3" fill="#f2f2f2">Jurado</text>
  <text x="64" y="378" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#f2f2f2" fill-opacity="0.85">Graphic Designer &amp; Layout Artist</text>
  <text x="64" y="420" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#f2f2f2" fill-opacity="0.7">Newspapers · Magazines · Packaging · Branding</text>
  <rect x="64" y="486" width="356" height="56" rx="28" fill="#f2f2f2"/>
  <text x="242" y="522" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#73030d">12+ years · 0 missed deadlines</text>
</svg>`);

// Three covers fanned out on white cards on the right.
const cardW = 210;
const cardH = 290;
const slots = [
  { left: 640, top: 190, angle: -7 },
  { left: 800, top: 150, angle: 0 },
  { left: 960, top: 190, angle: 7 },
];

const layers = await Promise.all(
  covers.map(async (file, i) => {
    const art = await sharp(file).resize(cardW - 24, cardH - 24, { fit: 'contain', background: '#ffffff' }).toBuffer();
    const card = await sharp({ create: { width: cardW, height: cardH, channels: 4, background: '#ffffff' } })
      .composite([{ input: art, left: 12, top: 12 }])
      .png()
      .toBuffer();
    const rotated = await sharp(card).rotate(slots[i].angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    return { input: rotated, left: slots[i].left - 20, top: slots[i].top - 10 };
  }),
);

await sharp(background).composite(layers).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og.jpg');
console.log('wrote public/og.jpg');
