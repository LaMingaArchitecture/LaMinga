/**
 * Build a Storyblok Image Service URL.
 * @param filename absolute Storyblok asset URL (https://a.storyblok.com/f/...)
 * @param size     "{w}x{h}" — use 0 to keep aspect ratio (e.g. "1600x0")
 */
export function sbImage(filename: string, size = '1200x0'): string {
  if (!filename) return '';
  return `${filename}/m/${size}/filters:format(webp):quality(80)`;
}

export type SbFormat = 'webp' | 'avif';

/** Responsive width ladder for edge-to-edge visuals — single source of truth (img + preload). */
export const FULLSCREEN_WIDTHS = [640, 960, 1280, 1600, 1920] as const;

/** `sizes` hint for full-bleed media (one visual per viewport width). */
export const SIZES_FULLSCREEN = '100vw';

/**
 * Non-srcset fallback widths shared by the renderer and the LCP preload so their URLs stay
 * byte-identical (no double-download): the `<img src>` and a poster's `<video poster>`.
 */
export const HERO_IMG_WIDTH = 1280;
export const POSTER_WIDTH = 1600;

/** One image-service URL at an explicit width (height auto via `0`). */
export function sbImageW(
  filename: string,
  width: number,
  format: SbFormat = 'webp',
  quality = 80,
): string {
  if (!filename) return '';
  return `${filename}/m/${width}x0/filters:format(${format}):quality(${quality})`;
}

/** A `srcset` string across widths for one format (w-descriptors). */
export function sbSrcset(
  filename: string,
  widths: readonly number[] = FULLSCREEN_WIDTHS,
  format: SbFormat = 'webp',
  quality = 80,
): string {
  if (!filename) return '';
  return widths.map((w) => `${sbImageW(filename, w, format, quality)} ${w}w`).join(', ');
}
