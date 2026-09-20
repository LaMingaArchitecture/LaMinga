/**
 * Per-content-type page chrome (header mode, footer, scroll frame, accent).
 *
 * The production routes and the Visual Editor preview render the same stories through the same
 * layout, so the mapping lives here rather than being re-derived in each route: the preview is
 * only useful to editors if it matches what ships.
 */
export interface LayoutChrome {
  footer?: boolean;
  immersive?: boolean;
  immersiveScroll?: boolean;
  scroll?: boolean;
  accent?: 'coral' | 'violet';
}

/** Immersive pages own a fullscreen frame; the rest scroll as a document under the floating nav. */
const CHROME: Record<string, LayoutChrome> = {
  home_page: { accent: 'coral' },
  project: {},
  project_list: { footer: true },
  atelier_page: { footer: true, immersive: true, immersiveScroll: true },
};

/** Chrome for a story's root component; unknown types fall back to a plain scrolling page. */
export function chromeFor(component: string | undefined): LayoutChrome {
  return (component && CHROME[component]) || { footer: true, scroll: true };
}
