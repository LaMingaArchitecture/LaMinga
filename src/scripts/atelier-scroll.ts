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

// Mobile only: flip the fixed transparent header to a solid band once scrolled off the hero, so
// panel content (esp. the team title) never reads under the floating nav. On the desktop snap frame
// the header is absolute and sections clear it via padding, so the CSS ignores this flag there.
const setupHeaderState = (root: HTMLElement): void => {
  let scrolled: boolean | undefined;
  const update = (): void => {
    const y = window.scrollY || document.documentElement.scrollTop || root.scrollTop || 0;
    const next = y > window.innerHeight * 0.6;
    if (next === scrolled) return; // only touch the DOM when the state actually flips
    scrolled = next;
    document.body.toggleAttribute('data-atelier-scrolled', next);
  };
  window.addEventListener('scroll', update, { passive: true });
  root.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
};

// Hand the below-the-fold section backgrounds their real source once the hero has had the network
// to itself. They ship with a blank placeholder because `loading="lazy"` does not hold them back:
// the backgrounds are overscanned for the parallax (`top: -15%; height: 130%`), so the next
// section's box crosses the fold and the browser treats it as near-viewport — while the section's
// own `overflow: hidden` means not one pixel of it is on screen. Fetched alongside the hero
// they cost the LCP over a second, for nothing visible.
const LAZY_BG_CEILING = 2000;
const setupLazyBg = (root: HTMLElement, sections: HTMLElement[]): void => {
  const hydrate = (img: HTMLImageElement): void => {
    const { src, srcset } = img.dataset;
    if (!src) return;
    delete img.dataset.src;
    delete img.dataset.srcset;
    if (srcset) img.srcset = srcset;
    img.src = src;
  };
  let started = false;
  const start = (): void => {
    if (started) return;
    started = true;
    // Root on whichever box actually scrolls. rootMargin only expands the ROOT's rect, while the
    // target stays clipped by intermediate scrollers — so a viewport-rooted observer buys zero
    // lead time on the desktop snap frame, where the article is the scroller, not the window.
    const scroller = root.scrollHeight > root.clientHeight + 1 ? root : null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          entry.target.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(hydrate);
        });
      },
      // A viewport of lead time, so the next section's photo is in place before it snaps in.
      { root: scroller, rootMargin: '100% 0px' },
    );
    sections.forEach((section) => io.observe(section));
  };
  // `load` is the signal we want (the hero is done), but it is hostage to every other subresource
  // on the page — a stalled image holds it forever and the backgrounds would never arrive. Race it.
  if (document.readyState === 'complete') start();
  else {
    window.addEventListener('load', start, { once: true });
    window.setTimeout(start, LAZY_BG_CEILING);
  }
};

const enhance = (root: HTMLElement): void => {
  const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-atelier-sec]'));
  if (sections.length === 0) return;
  // First: the backgrounds ship blank, so this has to run even if a later setup throws.
  setupLazyBg(root, sections);
  // Reveal + parallax styles apply only once enhanced, so with no JS everything stays visible.
  root.classList.add('atelier--enhanced');
  setupReveal(sections);
  setupVideo(root, sections);
  setupParallax(root, sections);
  setupHeaderState(root);
};

document.querySelectorAll<HTMLElement>('[data-atelier]').forEach(enhance);

export {};
