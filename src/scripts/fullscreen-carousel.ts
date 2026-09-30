// Fullscreen carousel — progressive enhancement over the CSS scroll-snap track.
// Navigates by scrolling the SAME native snap container (never a CSS transform), so scroll-snap,
// swipe, keyboard and buttons all share one source of truth (scroll position, read back via an
// IntersectionObserver). Adds a split prev/next mouse cursor, ArrowLeft/Right keys, focus-only
// arrow buttons, per-slide + live-region ARIA, and plays/pauses each slide's <video> by visibility.
// Stepping loops seamlessly (see `loopClone`); a forward swipe off the last slide loops too, a
// backward swipe off the first still stops. Honors prefers-reduced-motion. Multi-instance.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
// Inside the Storyblok Visual Editor a click on a slide selects its blok, so it must not also step.
const inEditor = window.self !== window.top;
// Quiet period after the last scroll event that counts as "the scroll has settled" (Safari has no
// `scrollend` event).
const SCROLL_SETTLE_MS = 120;

// Inert, hidden copy of the first slide parked after the last one, so a wrap can slide onto it with
// the same smooth animation as any other step and then swap to the real first slide unseen.
const makeLoopClone = (first: HTMLElement): HTMLElement => {
  const clone = first.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  clone.querySelectorAll('video').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
  return clone;
};

const enhance = (root: HTMLElement): void => {
  const track = root.querySelector<HTMLElement>('[data-fc-track]');
  if (!track) return;
  const slides = Array.from(track.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement,
  );
  if (slides.length === 0) return;

  const prev = root.querySelector<HTMLButtonElement>('[data-fc-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-fc-next]');
  const live = root.querySelector<HTMLElement>('[data-fc-live]');
  const count = slides.length;
  let index = 0;
  let pointerX: number | null = null;
  let lastPointerType = '';

  // Not in the Storyblok editor: a duplicated blok would confuse its click-to-select overlay, so
  // there a wrap just jumps.
  const loopClone = count > 1 && !inEditor ? makeLoopClone(slides[0]) : null;
  if (loopClone) track.append(loopClone);

  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositive');
    slide.setAttribute('aria-label', `${i + 1} sur ${count}`);
  });

  // Which half of the track the mouse is over → the cursor arrow (CSS reads data-fc-side). Stepping
  // wraps, so both sides always lead somewhere — except with a single slide.
  const sideAt = (clientX: number): 'prev' | 'next' | null => {
    if (count < 2) return null;
    const { left, width } = track.getBoundingClientRect();
    return clientX < left + width / 2 ? 'prev' : 'next';
  };

  const syncSide = (): void => {
    const side = pointerX === null ? null : sideAt(pointerX);
    if (side) root.dataset.fcSide = side;
    else delete root.dataset.fcSide;
  };

  const render = (): void => {
    if (live) live.textContent = `Diapositive ${index + 1} sur ${count}`;
    syncSide();
  };

  const scrollToPosition = (position: number, isSmooth: boolean): void => {
    track.scrollTo({
      left: position * track.clientWidth,
      behavior: isSmooth && !reduce.matches ? 'smooth' : 'auto',
    });
  };

  // Wraps go through the clone (position `count`): forward slides onto it and `settleLoop` swaps to
  // the real first slide; backward first jumps onto it (identical to slide 1), then slides back.
  const goTo = (target: number): void => {
    const wrapsForward = target >= count;
    const wrapsBackward = target < 0;
    index = ((target % count) + count) % count;
    if (loopClone && wrapsForward) {
      scrollToPosition(count, true);
    } else if (loopClone && wrapsBackward) {
      scrollToPosition(count, false);
      requestAnimationFrame(() => scrollToPosition(index, true));
    } else {
      scrollToPosition(index, !wrapsForward && !wrapsBackward);
    }
    render();
  };

  // Resting on the clone (after a forward wrap or a swipe past the last slide) → swap to slide 1.
  let settleTimer: number | undefined;
  const settleLoop = (): void => {
    if (!loopClone) return;
    if (track.scrollLeft >= count * track.clientWidth - 1) scrollToPosition(0, false);
  };
  track.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleLoop, SCROLL_SETTLE_MS);
    },
    { passive: true },
  );

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
  // buttons carry no data-fc-goto, so they're unaffected).
  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-fc-goto]');
    if (!target || !root.contains(target)) return;
    const to = Number(target.dataset.fcGoto);
    if (Number.isFinite(to)) goTo(to);
  });

  // Mouse only, checked per event (not once at load) so touch taps on hybrid devices never step
  // and a mouse plugged in later still gets the cursor.
  if (!inEditor) {
    track.addEventListener('pointerdown', (event) => {
      lastPointerType = event.pointerType;
    });
    track.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      syncSide();
    });
    track.addEventListener('pointerleave', () => {
      pointerX = null;
      syncSide();
    });
    // Links (home title) and buttons (recap tiles) keep their own action. A click ending a text
    // selection is not a navigation; neither is the 2nd click of a double-click, which would read
    // an intermediate index mid smooth-scroll.
    track.addEventListener('click', (event) => {
      if (lastPointerType !== 'mouse' || event.detail > 1) return;
      if ((event.target as HTMLElement).closest('a, button')) return;
      const selection = document.getSelection();
      if (selection && !selection.isCollapsed) return;
      const side = sideAt(event.clientX);
      if (side) goTo(index + (side === 'prev' ? -1 : 1));
    });
  }

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

  // The arrows ship disabled (see FullscreenCarousel.astro); a single slide has nowhere to go.
  if (count > 1) {
    if (prev) prev.disabled = false;
    if (next) next.disabled = false;
  }
  render();
  syncClair(slides[index]);
};

document.querySelectorAll<HTMLElement>('[data-fc]').forEach(enhance);

export {};
