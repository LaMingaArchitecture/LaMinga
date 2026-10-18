// The nav « Projets » links open the explorer unfiltered: dropping the stored state makes the
// plain /projets visit start clean, while returning from a project (back button, in-page links)
// still restores the visitor's filters.
import { EXPLORER_STORAGE_KEY } from '../lib/explorer-filter';

document.querySelectorAll<HTMLAnchorElement>('a[data-projets-reset]').forEach((link) =>
  link.addEventListener('click', () => {
    try {
      sessionStorage.removeItem(EXPLORER_STORAGE_KEY);
    } catch {
      /* storage may be unavailable */
    }
  }),
);

export {};
