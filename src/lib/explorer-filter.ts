// Pure + dependency-free: imported by the Projets explorer browser script.

/** Separator of the token lists in data attributes — not a space: datasource values may hold one. */
export const TOKEN_SEPARATOR = '|';

/** A filterable row/tile's data attributes (TOKEN_SEPARATOR-joined lists, normalized haystack). */
export interface FilterableItem {
  programmes?: string;
  thematiques?: string;
  search?: string;
}

export interface FilterState {
  programme: string | null;
  thematique: string | null;
  /** Already normalized with `normalizeSearch`. */
  query: string;
}

export const hasToken = (list: string | undefined, token: string): boolean =>
  (list ?? '').split(TOKEN_SEPARATOR).includes(token);

export function matchesFilters(item: FilterableItem, state: FilterState): boolean {
  return (
    (!state.programme || hasToken(item.programmes, state.programme)) &&
    (!state.thematique || hasToken(item.thematiques, state.thematique)) &&
    (!state.query || (item.search ?? '').includes(state.query))
  );
}

/** Does any filter or search narrow the list? (drives the « Tout afficher » reset). */
export function hasActiveFilters(state: FilterState): boolean {
  return state.programme != null || state.thematique != null || state.query !== '';
}

/** sessionStorage key of the explorer state, cleared by the nav « Projets » links to reset it. */
export const EXPLORER_STORAGE_KEY = 'projets-explorer';
