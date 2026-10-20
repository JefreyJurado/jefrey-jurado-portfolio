// Card sizes for the home-page grid, so it reads like a magazine spread instead of identical pairs:
// one full-width feature, then alternating large/small pairs. Used on the server for the first render
// and in the browser again whenever a filter changes which cards are visible.
export type CardSize = 'full' | 'big' | 'small';

const pattern: CardSize[] = ['full', 'big', 'small', 'small', 'big', 'big', 'small'];

export function sizesFor(count: number): CardSize[] {
  const sizes = Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);
  // A pair with only one card would leave a hole, so make that last card full width.
  const lastPos = (count - 1) % pattern.length;
  if (count > 0 && [1, 3, 5].includes(lastPos)) sizes[count - 1] = 'full';
  return sizes;
}
