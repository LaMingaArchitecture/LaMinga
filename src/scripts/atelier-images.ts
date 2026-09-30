// Deferred Atelier photos (backgrounds + team portraits), started by atelier-scroll.ts. `desktop` is
// its snap-frame media query, passed in so both files share one breakpoint.
// Below-the-fold photos wait until the hero has had the network to itself. The backgrounds ship
// with a blank placeholder because `loading="lazy"` does not hold them back: they are overscanned
// for the parallax (`top: -15%; height: 130%`), so the next section's box crosses the fold and the
// browser treats it as near-viewport while the section's `overflow: hidden` shows none of it.
// Desktop snap frame: every photo is fetched at once (team portraits promoted from lazy to eager),
// so no section snaps in before its photo. Mobile document scroll: each background is fetched a
// viewport ahead and the portraits keep native lazy loading, so a visitor who stays on the hero
// does not download the page.
const DEFERRED_IMAGES_DEADLINE_MS = 2000;
export const setupDeferredImages = (
  root: HTMLElement,
  sections: HTMLElement[],
  desktop: MediaQueryList,
): void => {
  const hydrate = (img: HTMLImageElement): void => {
    const { src, srcset } = img.dataset;
    if (!src) return;
    delete img.dataset.src;
    delete img.dataset.srcset;
    if (srcset) img.srcset = srcset;
    img.src = src;
  };
  const loadAll = (): void => {
    root.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(hydrate);
    root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
    });
  };
  const loadAhead = (): void => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          entry.target.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(hydrate);
        });
      },
      { rootMargin: '100% 0px' },
    );
    sections.forEach((section) => io.observe(section));
  };
  let started = false;
  const start = (): void => {
    if (started) return;
    started = true;
    if (desktop.matches) loadAll();
    else {
      loadAhead();
      // Rotating a tablet to landscape switches to the snap frame, which needs every photo.
      desktop.addEventListener('change', (event) => event.matches && loadAll());
    }
  };
  // `load` is the signal we want (the hero is done), but it is hostage to every other subresource
  // on the page — a stalled image holds it forever and the photos would never arrive. Race it.
  if (document.readyState === 'complete') start();
  else {
    window.addEventListener('load', start, { once: true });
    window.setTimeout(start, DEFERRED_IMAGES_DEADLINE_MS);
  }
};
