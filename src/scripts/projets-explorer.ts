// Projets explorer: programme ∩ thematique filtering + grid/Index view toggle.
// State is read from the URL (deep-links) then sessionStorage, and written back to both, so
// returning to /projets restores the former filters. Programmes/thematiques come from Storyblok —
// nothing is hardcoded here.
type View = 'grid' | 'index';
interface State {
  programme: string | null;
  thematique: string | null;
  view: View;
}

const KEY = 'projets-explorer';
const root = document.querySelector<HTMLElement>('[data-explorer]');

if (root) {
  const programmeButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-programme-filter]'),
  );
  const thematiqueButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-thematique-filter]'),
  );
  const viewToggle = root.querySelector<HTMLButtonElement>('[data-view-toggle]');
  const views = Array.from(root.querySelectorAll<HTMLElement>('[data-view]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-filterable]'));
  const empty = root.querySelector<HTMLElement>('[data-empty]');

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
    return { programme, thematique, view };
  };

  const state = readState();

  const persist = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
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

  const apply = () => {
    programmeButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.programmeFilter === state.programme)),
    );
    thematiqueButtons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.thematiqueFilter === state.thematique)),
    );
    viewToggle?.setAttribute('aria-pressed', String(state.view === 'index'));

    let visible = 0;
    items.forEach((item) => {
      const matchProgramme = !state.programme || item.dataset.programme === state.programme;
      const matchThematique =
        !state.thematique || (item.dataset.thematiques ?? '').split(' ').includes(state.thematique);
      const show = matchProgramme && matchThematique;
      item.hidden = !show;
      // Count once (items are duplicated across the two views).
      if (show && item.closest('[data-view="grid"]')) visible += 1;
    });

    // When nothing matches, hide BOTH view containers (so the Index thead doesn't linger) and
    // show the empty message instead.
    const isEmpty = visible === 0;
    views.forEach((v) => (v.hidden = isEmpty || v.dataset.view !== state.view));
    if (empty) empty.hidden = !isEmpty;
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
  viewToggle?.addEventListener('click', () => {
    state.view = state.view === 'index' ? 'grid' : 'index';
    apply();
    persist();
  });

  apply();
  persist();
}

export {};
