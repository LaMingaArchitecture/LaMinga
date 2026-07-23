// Project overlays — the "+ infos" / "+ projets similaires" disclosures on the project page.
// Each pill toggles the panel named by its `aria-controls`. Mutually exclusive (opening one closes
// the other, since both cover the same band over the current visual). Non-modal: focus is NOT
// trapped so the carousel's ArrowLeft/Right nav and the floating header stay usable; Escape closes
// the open panel and returns focus to its pill. Multi-instance safe; coexists with the carousel
// script (separate DOM: overlays live in the carousel's `overlays` slot, not the track).
type Pair = { pill: HTMLButtonElement; panel: HTMLElement };

const enhance = (root: HTMLElement): void => {
  const pills = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-overlay-pill]'));
  const pairs = pills
    .map((pill): Pair | null => {
      const panel = document.getElementById(pill.getAttribute('aria-controls') ?? '');
      return panel ? { pill, panel } : null;
    })
    .filter((pair): pair is Pair => pair !== null);
  if (pairs.length === 0) return;

  // Reflect "any overlay open" onto the root so CSS can hide the card + the inactive pill.
  const syncRoot = (): void => {
    root.toggleAttribute(
      'data-overlay-open',
      pairs.some((pair) => !pair.panel.hidden),
    );
  };

  const setOpen = (pair: Pair, open: boolean): void => {
    pair.panel.hidden = !open;
    pair.pill.setAttribute('aria-expanded', String(open));
    syncRoot();
  };

  pairs.forEach((pair) => {
    pair.pill.addEventListener('click', () => {
      const willOpen = pair.pill.getAttribute('aria-expanded') !== 'true';
      pairs.forEach((other) => setOpen(other, false)); // mutual exclusivity
      if (willOpen) setOpen(pair, true);
    });
  });

  // Global Escape: works wherever focus sits (pill, panel link, carousel counter, slide…).
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = pairs.find((pair) => pair.pill.getAttribute('aria-expanded') === 'true');
    if (!open) return;
    event.preventDefault();
    setOpen(open, false);
    open.pill.focus();
  });
};

document.querySelectorAll<HTMLElement>('[data-project-overlays]').forEach(enhance);

export {};
