// Atelier scroll presentation — progressive enhancement over the native scroll. Reveals each
// section's panel on entry, plays only the visible section's <video>, and adds a subtle background
// parallax on the desktop scroll-snap frame. Reveal + video observers are viewport-rooted
// (root: null) so they track true on-screen visibility in BOTH the desktop fixed-frame (the article
// scrolls) and the mobile document scroll (the article does not scroll) — an article-rooted observer
// would never see §1 leave on mobile, so the hero video would decode forever. Honors
// prefers-reduced-motion; mirrors the fullscreen-carousel island scaffold. Multi-instance.
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
// Desktop scroll-snap frame — the SAME breakpoint as AtelierPage.astro's scoped CSS and global.css's
// frame rules. Parallax runs only here; elsewhere the page is a plain scrolling document.
const DESKTOP = window.matchMedia('(min-width: 48rem) and (orientation: landscape)');

// Reveal each panel as it enters the viewport. Any panel already on screen at load is revealed
// synchronously so it never flashes from its hidden start state before the async observer's first
// callback — this covers the first section AND whatever a restored scroll position (reload /
// back-nav) lands on. A panel whose centre is off-screen (a below-the-fold section, or one clipped
// by the desktop article) stays hidden and fades in on scroll as intended.
const setupReveal = (sections: HTMLElement[]): void => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    },
    { threshold: 0.25 },
  );
  const panels = sections
    .map((section) => section.querySelector<HTMLElement>('[data-atelier-panel]'))
    .filter((panel): panel is HTMLElement => panel !== null);
  panels.forEach((panel) => io.observe(panel));
  // Read all rects, then write — reveal panels whose centre is currently within the viewport.
  const onScreen = panels.filter((panel) => {
    const rect = panel.getBoundingClientRect();
    const centre = rect.top + rect.height / 2;
    return centre > 0 && centre < window.innerHeight;
  });
  onScreen.forEach((panel) => panel.classList.add('is-visible'));
};

// Play only the ≥60%-visible section's <video> (there may be none), pause the rest — and pause all
// under reduced motion (ResponsiveMedia hard-codes autoplay). Viewport-rooted → pauses off-screen.
const setupVideo = (root: HTMLElement, sections: HTMLElement[]): void => {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !REDUCE.matches) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: [0, 0.6] },
  );
  sections.forEach((section) => {
    if (section.querySelector('video')) io.observe(section);
  });
  if (REDUCE.matches) root.querySelectorAll('video').forEach((video) => video.pause());
};

// Subtle background parallax — desktop frame + motion-allowed only. Transform the nested .bg layer
// (never the snapping <section>, or it would fight scroll-snap). Drift is FACTOR·viewport; keep
// FACTOR below the `.atelier__bg` overscan in AtelierBg.astro (15%) or an edge shows.
const FACTOR = 0.12;
const setupParallax = (root: HTMLElement, sections: HTMLElement[]): void => {
  if (REDUCE.matches || !DESKTOP.matches) return;

  const bgs = sections
    .map((section) => section.querySelector<HTMLElement>('[data-atelier-bg]'))
    .filter((bg): bg is HTMLElement => bg !== null);
  // Promote the layers to their own compositor layer only now that parallax actually runs (not on
  // mobile / reduced motion, where the transform never changes).
  bgs.forEach((bg) => (bg.style.willChange = 'transform'));

  const active = new Set<HTMLElement>();
  const tops = new WeakMap<HTMLElement, number>();
  const measure = (): void => {
    sections.forEach((section) => tops.set(section, section.offsetTop));
  };
  measure();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) active.add(section);
        else active.delete(section);
      });
    },
    { root, threshold: 0 },
  );
  sections.forEach((section) => io.observe(section));

  let ticking = false;
  const onScroll = (): void => {
    // After a rotation to portrait (desktop→mobile) the resize handler fires this once more; clear
    // any transforms we wrote and stop, so inline transforms don't stay stuck on the now-document.
    if (!DESKTOP.matches) {
      bgs.forEach((bg) => (bg.style.transform = ''));
      return;
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = root.scrollTop;
      active.forEach((section) => {
        const bg = section.querySelector<HTMLElement>('[data-atelier-bg]');
        if (!bg) return;
        const rel = (tops.get(section) ?? section.offsetTop) - scrollTop; // 0 exactly when snapped
        bg.style.transform = `translate3d(0, ${(-rel * FACTOR).toFixed(2)}px, 0)`;
      });
      ticking = false;
    });
  };
  root.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measure();
      onScroll();
    },
    { passive: true },
  );
  onScroll();
};

const enhance = (root: HTMLElement): void => {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-atelier-sec]'));
  if (sections.length === 0) return;
  // Reveal + parallax styles apply only once enhanced, so with no JS everything stays visible.
  root.classList.add('atelier--enhanced');
  setupReveal(sections);
  setupVideo(root, sections);
  setupParallax(root, sections);
};

document.querySelectorAll<HTMLElement>('[data-atelier]').forEach(enhance);

export {};
