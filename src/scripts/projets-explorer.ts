// Projets explorer: programme ∩ thematique ∩ recherche filtering + Vignettes/Liste view switch.
// programme / thematique / view are read from the URL (deep-links) then sessionStorage and written
// back to both, so returning to /projets restores them; the search text is ephemeral (kept out of
// the URL to keep the deep-link contract simple). Programmes/thematiques come from Storyblok —
// nothing is hardcoded here.
import { normalizeSearch } from '../lib/search';

type View = 'grid' | 'index';
interface State {
  programme: string | null;
  thematique: string | null;
  view: View;
  search: string;
}

const KEY = 'projets-explorer';
const root = document.querySelector<HTMLElement>('[data-explorer]');

if (root) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const programmeButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-programme-filter]'),
  );
  const thematiqueButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-thematique-filter]'),
  );
  const viewVignettes = root.querySelector<HTMLButtonElement>('[data-view-vignettes]');
  const viewIndex = root.querySelector<HTMLButtonElement>('[data-view-index]');
  const searchToggle = root.querySelector<HTMLButtonElement>('[data-search-toggle]');
  const searchInput = root.querySelector<HTMLInputElement>('[data-search-input]');
  const views = Array.from(root.querySelectorAll<HTMLElement>('[data-view]'));
  const gridView = views.find((v) => v.dataset.view === 'grid') ?? null;
  const indexView = views.find((v) => v.dataset.view === 'index') ?? null;
  // Partition the (duplicated) filterable items by view once, so apply() never walks the DOM.
  const gridItems = gridView
    ? Array.from(gridView.querySelectorAll<HTMLElement>('[data-filterable]'))
    : [];
  const indexItems = indexView
    ? Array.from(indexView.querySelectorAll<HTMLElement>('[data-filterable]'))
    : [];
  const empty = root.querySelector<HTMLElement>('[data-empty]');

  const rail = root.querySelector<HTMLElement>('[data-rail]');
  const railControls = root.querySelector<HTMLElement>('[data-rail-controls]');
  const railPrev = root.querySelector<HTMLButtonElement>('[data-rail-prev]');
  const railNext = root.querySelector<HTMLButtonElement>('[data-rail-next]');

  const thumb = root.querySelector<HTMLImageElement>('[data-thumb-el]');
  const indexRows = Array.from(
    root.querySelectorAll<HTMLElement>('[data-view="index"] [data-thumb]'),
  );

  const programmeSlugs = new Set(programmeButtons.map((b) => b.dataset.programmeFilter));
  const thematiqueValues = new Set(thematiqueButtons.map((b) => b.dataset.thematiqueFilter));

  const readState = (): State => {
    const params = new URLSearchParams(location.search);
    // Deep-links are authoritative and all-or-nothing: any of programme/thematique/vue present
    // means the URL fully describes the state (a partial link resets the others). Otherwise fall
    // back to the last stored state so a plain /projets visit restores the former filters.
    const fromUrl = params.has('programme') || params.has('thematique') || params.has('vue');
    let programme: string | null = null;
    let thematique: string | null = null;
    let view: View = 'grid';
    if (fromUrl) {
      programme = params.get('programme');
      thematique = params.get('thematique');
      view = params.get('vue') === 'index' ? 'index' : 'grid';
    } else {
      try {
        const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
        if (saved) {
          programme = saved.programme ?? null;
          thematique = saved.thematique ?? null;
          view = saved.view === 'index' ? 'index' : 'grid';
        }
      } catch {
        /* ignore malformed storage */
      }
    }
    // Ignore unknown tokens so a stale link can't hide the whole grid.
    if (programme && !programmeSlugs.has(programme)) programme = null;
    if (thematique && !thematiqueValues.has(thematique)) thematique = null;
    return { programme, thematique, view, search: '' };
  };

  const state = readState();

  const persist = () => {
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          programme: state.programme,
          thematique: state.thematique,
          view: state.view,
        }),
      );
    } catch {
      /* storage may be unavailable */
    }
    const params = new URLSearchParams();
    if (state.programme) params.set('programme', state.programme);
    if (state.thematique) params.set('thematique', state.thematique);
    if (state.view === 'index') params.set('vue', 'index');
    const qs = params.toString();
    history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  };

  // Is this thematique present in the selected programme's projects? (row 2 availability)
  const thematiqueAvailable = (button: HTMLButtonElement): boolean =>
    !state.programme ||
    (button.dataset.thematiqueProgrammes ?? '').split(' ').includes(state.programme);

  const updateRail = () => {
    if (!rail || !railControls) return;
    const active = !!gridView && !gridView.hidden;
    const max = rail.scrollWidth - rail.clientWidth;
    railControls.hidden = !active || max <= 1;
    if (railPrev) railPrev.disabled = rail.scrollLeft <= 0;
    if (railNext) railNext.disabled = rail.scrollLeft >= max - 1;
  };

  const apply = () => {
    // Any filter/search/view change dismisses the floating hover preview: hiding the hovered row
    // via display:none doesn't reliably fire mouseleave, so clear it explicitly here.
    if (thumb) thumb.hidden = true;

    // Drop a selected thematique that isn't available in the selected programme.
    if (state.programme && state.thematique) {
      const btn = thematiqueButtons.find((b) => b.dataset.thematiqueFilter === state.thematique);
      if (!btn || !thematiqueAvailable(btn)) state.thematique = null;
    }

    programmeButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.programmeFilter === state.programme)),
    );
    thematiqueButtons.forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.thematiqueFilter === state.thematique));
      b.hidden = !thematiqueAvailable(b);
    });
    viewVignettes?.setAttribute('aria-pressed', String(state.view === 'grid'));
    viewIndex?.setAttribute('aria-pressed', String(state.view === 'index'));
    // Colour the matching vignettes only while a programme is selected.
    root.toggleAttribute('data-programme-active', !!state.programme);

    const query = normalizeSearch(state.search);
    const matches = (item: HTMLElement): boolean =>
      (!state.programme || item.dataset.programme === state.programme) &&
      (!state.thematique ||
        (item.dataset.thematiques ?? '').split(' ').includes(state.thematique)) &&
      (!query || (item.dataset.search ?? '').includes(query));

    // Count matches from the grid only (items are duplicated across the two views).
    let visible = 0;
    gridItems.forEach((item) => {
      const show = matches(item);
      item.hidden = !show;
      if (show) visible += 1;
    });
    indexItems.forEach((item) => {
      item.hidden = !matches(item);
    });

    // When nothing matches, hide BOTH view containers and show the empty message instead.
    const isEmpty = visible === 0;
    views.forEach((v) => (v.hidden = isEmpty || v.dataset.view !== state.view));
    if (empty) empty.hidden = !isEmpty;
    updateRail();
  };

  programmeButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const slug = button.dataset.programmeFilter ?? null;
      state.programme = state.programme === slug ? null : slug;
      apply();
      persist();
    }),
  );
  thematiqueButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const value = button.dataset.thematiqueFilter ?? null;
      state.thematique = state.thematique === value ? null : value;
      apply();
      persist();
    }),
  );
  viewVignettes?.addEventListener('click', () => {
    state.view = 'grid';
    apply();
    persist();
  });
  viewIndex?.addEventListener('click', () => {
    state.view = 'index';
    apply();
    persist();
  });

  // Recherche: the tool-row link reveals the input; typing filters live; closing clears it.
  searchToggle?.addEventListener('click', () => {
    if (!searchInput) return;
    const open = searchInput.hidden;
    searchInput.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      searchInput.focus();
    } else {
      searchInput.value = '';
      state.search = '';
      apply();
    }
  });
  searchInput?.addEventListener('input', () => {
    state.search = searchInput.value;
    apply();
  });

  // Vignettes rail: chevrons scroll one viewport; disabled/hidden state follows the scroll position.
  const railStep = () => (rail ? rail.clientWidth * 0.85 : 0);
  railPrev?.addEventListener('click', () =>
    rail?.scrollBy({ left: -railStep(), behavior: reduce ? 'auto' : 'smooth' }),
  );
  railNext?.addEventListener('click', () =>
    rail?.scrollBy({ left: railStep(), behavior: reduce ? 'auto' : 'smooth' }),
  );
  rail?.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);

  // Liste hover: float the project's cover thumbnail beside the hovered row (one request per row).
  if (thumb && thumb.parentElement) {
    const area = thumb.parentElement;
    indexRows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        const src = row.dataset.thumb;
        if (!src) return;
        thumb.src = src;
        thumb.style.top = `${row.getBoundingClientRect().top - area.getBoundingClientRect().top}px`;
        thumb.hidden = false;
      });
      row.addEventListener('mouseleave', () => {
        thumb.hidden = true;
      });
    });
  }

  apply();
  persist();
}

export {};
