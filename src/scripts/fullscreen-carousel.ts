// Fullscreen carousel — progressive enhancement over the CSS scroll-snap track.
// Navigates by scrolling the SAME native snap container (never a CSS transform), so scroll-snap,
// swipe, keyboard and buttons all share one source of truth (scroll position, read back via an
// IntersectionObserver). Adds arrows, ArrowLeft/Right keys, per-slide + live-region ARIA, and
// plays/pauses each slide's <video> by visibility. Honors prefers-reduced-motion. Multi-instance.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

const enhance = (root: HTMLElement): void => {
  const track = root.querySelector<HTMLElement>('[data-fc-track]');
  if (!track) return;
  const slides = Array.from(track.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );
  if (slides.length === 0) return;

  const prev = root.querySelector<HTMLButtonElement>('[data-fc-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-fc-next]');
  const currentEl = root.querySelector<HTMLElement>('[data-fc-current]');
  const live = root.querySelector<HTMLElement>('[data-fc-live]');
  const count = slides.length;
  let index = 0;

  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositive');
    slide.setAttribute('aria-label', `${i + 1} sur ${count}`);
  });

  const render = (): void => {
    if (currentEl) currentEl.textContent = String(index + 1);
    if (live) live.textContent = `Diapositive ${index + 1} sur ${count}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === count - 1;
    // Never orphan focus when the focused arrow disables at an end.
    if (prev?.disabled && document.activeElement === prev) next?.focus();
    if (next?.disabled && document.activeElement === next) prev?.focus();
  };

  const goTo = (target: number): void => {
    index = Math.max(0, Math.min(count - 1, target));
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: reduce.matches ? 'auto' : 'smooth',
    });
    render();
  };

  // Play only the CURRENT slide's video (the one ≥60% visible) and pause every other, so a
  // barely-visible slide mid-swipe never starts playback and two videos never play at once.
  const syncVideos = (activeSlide: HTMLElement): void => {
    slides.forEach((slide) => {
      const video = slide.querySelector('video');
      if (!video) return;
      if (slide === activeSlide && !reduce.matches) void video.play().catch(() => {});
      else video.pause();
    });
  };

  // Reflect the active slide's `data-fc-clair` onto the root so overlaid controls/HUD (which read
  // `--hud-ink`) flip light/dark per the editor's titre_clair flag. Home slides carry no such
  // marker → root stays non-clair → no homepage change.
  const syncClair = (activeSlide: HTMLElement): void => {
    root.toggleAttribute('data-clair', activeSlide.hasAttribute('data-fc-clair'));
  };

  // Keep `index` truthful for swipe/scroll and drive video playback off the same ≥0.6 gate.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;
        const slide = entry.target as HTMLElement;
        index = slides.indexOf(slide);
        render();
        syncVideos(slide);
        syncClair(slide);
      });
    },
    { root: track, threshold: [0.6] },
  );
  slides.forEach((slide) => io.observe(slide));

  prev?.addEventListener('click', () => goTo(index - 1));
  next?.addEventListener('click', () => goTo(index + 1));

  // Recap/mosaic slide: any <button data-fc-goto="i"> jumps to slide i (delegated; the prev/next
  // buttons carry no data-fc-goto, so they're unaffected). goTo clamps out-of-range targets.
  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-fc-goto]');
    if (!target || !root.contains(target)) return;
    const to = Number(target.dataset.fcGoto);
    if (Number.isFinite(to)) goTo(to);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  if (reduce.matches) track.querySelectorAll('video').forEach((video) => video.pause());

  root.classList.add('fc--enhanced');
  render();
  syncClair(slides[index]);
};

document.querySelectorAll<HTMLElement>('[data-fc]').forEach(enhance);

export {};
