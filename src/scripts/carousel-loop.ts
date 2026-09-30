// Seamless wrap for the fullscreen carousel. An inert copy of the first slide is parked after the
// last one: a forward wrap slides onto it like any other step, then swaps to the real first slide
// once the scroll settles; a backward wrap jumps onto it (it looks like slide 1) and slides back.
// A forward swipe past the last slide lands on the copy and swaps the same way.

// Quiet period that counts as "the scroll has settled" where `scrollend` is missing (Safari).
const SCROLL_SETTLE_MS = 120;
// scrollWidth and the max scroll offset are rounded to whole pixels, so the copy's exact offset can
// be out of reach by up to a pixel.
const SNAP_TOLERANCE_PX = 2;
const supportsScrollEnd = 'onscrollend' in window;

type WrapDirection = 'forward' | 'backward';

export interface CarouselLoop {
  /** The inert copy of slide 1, or null when looping runs without it (single slide, editor). */
  readonly clone: HTMLElement | null;
  /** True while a wrap animation runs — a step now would start from a stale position. */
  isWrapping(): boolean;
  /** Scrolls to `target` (any integer; out-of-range wraps) and returns the real slide index. */
  goTo(target: number): number;
}

interface LoopOptions {
  /** False in the Storyblok editor, where a duplicated blok confuses its click-to-select overlay. */
  canClone: boolean;
  reduce: MediaQueryList;
}

// Poster only: a live <video> copy would fetch the hero a second time, and its frame could never
// match the real one's anyway.
const makeClone = (first: HTMLElement): HTMLElement => {
  const clone = first.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  clone.querySelectorAll('video').forEach((video) => {
    video.removeAttribute('autoplay');
    video.removeAttribute('src');
    video.preload = 'none';
    video.querySelectorAll('source').forEach((source) => source.remove());
  });
  return clone;
};

export const createLoop = (
  track: HTMLElement,
  slides: HTMLElement[],
  { canClone, reduce }: LoopOptions,
): CarouselLoop => {
  const count = slides.length;
  const clone = canClone && count > 1 ? makeClone(slides[0]) : null;
  if (clone) track.append(clone);
  let wrap: WrapDirection | null = null;
  let isTouching = false;

  // The rendered (fractional) width, not the rounded clientWidth: that error adds up per slide.
  const slideWidth = (): number => slides[0].getBoundingClientRect().width;
  const scrollToPosition = (position: number, isSmooth: boolean): void => {
    track.scrollTo({
      left: position * slideWidth(),
      behavior: isSmooth && !reduce.matches ? 'smooth' : 'auto',
    });
  };
  const isOnClone = (): boolean =>
    clone !== null && track.scrollLeft >= count * slideWidth() - SNAP_TOLERANCE_PX;

  // The copy shows the poster, so the real first video restarts from its opening frame.
  const swapToFirst = (): void => {
    slides[0].querySelectorAll('video').forEach((video) => {
      video.currentTime = 0;
    });
    scrollToPosition(0, false);
  };

  const settle = (): void => {
    if (isTouching) return;
    if (isOnClone() && wrap === 'backward') return;
    if (isOnClone()) swapToFirst();
    wrap = null;
  };

  const goTo = (target: number): number => {
    const index = ((target % count) + count) % count;
    const isWrap = target < 0 || target >= count;
    if (!isWrap || !clone || reduce.matches) {
      scrollToPosition(index, !isWrap);
      return index;
    }
    wrap = target >= count ? 'forward' : 'backward';
    if (wrap === 'forward') {
      scrollToPosition(count, true);
    } else {
      scrollToPosition(count, false);
      requestAnimationFrame(() => scrollToPosition(index, true));
    }
    return index;
  };

  if (clone) {
    let settleTimer: number | undefined;
    const scheduleSettle = (): void => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SCROLL_SETTLE_MS);
    };
    // A finger held still on the copy stops the scroll events; swapping under it would jump the
    // page mid-gesture, so wait for the release.
    track.addEventListener('touchstart', () => (isTouching = true), { passive: true });
    const release = (): void => {
      isTouching = false;
      scheduleSettle();
    };
    track.addEventListener('touchend', release, { passive: true });
    track.addEventListener('touchcancel', release, { passive: true });
    if (supportsScrollEnd) track.addEventListener('scrollend', settle);
    else track.addEventListener('scroll', scheduleSettle, { passive: true });
  }

  return { clone, isWrapping: () => wrap !== null, goTo };
};
