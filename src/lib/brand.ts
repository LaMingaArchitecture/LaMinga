import type { GlobalSettings } from '../types/storyblok';

/**
 * The charte V3 ships a single web treatment of the logotype — paysage, aplat, corail + rose — and
 * rule 1.4 forbids recolouring, reframing or otherwise altering it, so there is deliberately no
 * per-page variant and no editor override.
 *
 * Two consumers outside the TypeScript build reference the same asset and cannot import this:
 * `scripts/generate-og-default.mjs` (reads the file) and `--nav-logo-ratio` in
 * `src/styles/tokens.css` (encodes its viewBox). Both must be updated alongside a logo swap.
 */
export const LOGO_SRC = '/logo/logo-laminga.svg';

export const SITE_DEFAULT_NAME = 'LaMinga';
export const SITE_DEFAULT_DESCRIPTION = "Atelier d'architecture LaMinga.";

/** The atelier name from global settings, else the default (an emptied field counts as absent). */
export function siteName(settings: GlobalSettings | null | undefined): string {
  return settings?.nom_atelier?.trim() || SITE_DEFAULT_NAME;
}
