/**
 * Build a Storyblok Image Service URL.
 * @param filename absolute Storyblok asset URL (https://a.storyblok.com/f/...)
 * @param size     "{w}x{h}" — use 0 to keep aspect ratio (e.g. "1600x0")
 */
export function sbImage(filename: string, size = '1200x0'): string {
  if (!filename) return '';
  return `${filename}/m/${size}/filters:format(webp):quality(80)`;
}
