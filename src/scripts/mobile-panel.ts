// Mobile lateral panel — progressive enhancement over the CSS-only checkbox toggle.
// Adds scroll-lock, background `inert`, a focus-trap, focus return on every close path, and a
// desktop-resize close. The closed panel is already non-focusable via `visibility:hidden` (CSS);
// `inert` reinforces it (and hides the background) for browsers that support it.
const root = document.querySelector<HTMLElement>('.mobile-nav');

if (root) {
  const checkbox = root.querySelector<HTMLInputElement>('.mobile-nav__checkbox');
  const panel = root.querySelector<HTMLElement>('.mobile-nav__panel');
  const scrim = root.querySelector<HTMLElement>('.mobile-nav__scrim');
  const closeButton = panel?.querySelector<HTMLButtonElement>('.mobile-nav__close');
  const desktop = window.matchMedia('(min-width: 48rem)');
  // Regions hidden from AT / pointer while the modal panel is open (footer is a sibling of main).
  const backdrop = [
    document.getElementById('contenu'),
    document.querySelector<HTMLElement>('.site-footer'),
  ].filter((el): el is HTMLElement => el !== null);

  const focusables = (): HTMLElement[] =>
    panel ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : [];

  const reflect = (open: boolean) => {
    document.body.classList.toggle('panel-open', open);
    panel?.toggleAttribute('inert', !open);
    backdrop.forEach((el) => el.toggleAttribute('inert', open));
  };

  const close = (returnFocus: boolean) => {
    if (checkbox) checkbox.checked = false;
    reflect(false);
    if (returnFocus) checkbox?.focus();
  };

  // Initial (closed) state: inert the panel.
  reflect(Boolean(checkbox?.checked));

  checkbox?.addEventListener('change', () => {
    if (checkbox.checked) {
      reflect(true);
      focusables()[0]?.focus();
    } else {
      close(true);
    }
  });

  scrim?.addEventListener('click', () => close(true));
  closeButton?.addEventListener('click', () => close(true));

  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  panel
    ?.querySelectorAll('a[href]')
    .forEach((link) => link.addEventListener('click', () => close(false)));

  desktop.addEventListener('change', (event) => {
    if (event.matches) close(false);
  });
}

export {};
