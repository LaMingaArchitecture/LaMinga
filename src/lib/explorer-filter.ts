// Pure + dependency-free: imported by the Projets explorer browser script.

/** A filterable row/tile's data attributes (space-separated slug lists, normalized haystack). */
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

const hasToken = (list: string | undefined, token: string): boolean =>
  (list ?? '').split(' ').includes(token);

export function matchesFilters(item: FilterableItem, state: FilterState): boolean {
  return (
    (!state.programme || hasToken(item.programmes, state.programme)) &&
    (!state.thematique || hasToken(item.thematiques, state.thematique)) &&
    (!state.query || (item.search ?? '').includes(state.query))
  );
}
