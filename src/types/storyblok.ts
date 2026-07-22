import type { ISbStoryData, SbBlokData } from '@storyblok/astro';
import { renderRichText } from '@storyblok/astro';

/** Storyblok richtext document — exactly the type `renderRichText` accepts. */
export type RichText = NonNullable<Parameters<typeof renderRichText>[0]>;

/** Storyblok asset (image/file) object. */
export interface StoryblokAsset {
  id?: number;
  filename: string;
  alt?: string;
  title?: string;
  name?: string;
  copyright?: string;
}

/** Native color-picker returns an object; a plain hex text field returns a string. */
export type StoryblokColor = string | { color?: string; plugin?: string };

/** Relation field: the resolved story when `resolve_relations` ran, else the uuid string. */
export type SbRelation = ISbStoryData | string;

export interface TeamMemberBlok extends SbBlokData {
  component: 'team_member';
  nom: string;
  photo?: StoryblokAsset;
  role?: string;
  bio?: RichText;
}

export interface SocialLinkBlok extends SbBlokData {
  component: 'social_link';
  plateforme: string;
  url: string;
  /** SVG icon — rendered from the raw filename, not the image service. */
  icone?: StoryblokAsset;
}

export interface ProgrammeBlok extends SbBlokData {
  component: 'programme';
  nom: string;
  couleur?: StoryblokColor;
}

export interface EngagementBlok extends SbBlokData {
  component: 'engagement';
  /** SVG icon — rendered from the raw filename, not the image service. */
  icone?: StoryblokAsset;
  libelle: string;
}

export interface MediaSlideBlok extends SbBlokData {
  component: 'media_slide';
  image_paysage?: StoryblokAsset;
  image_portrait?: StoryblokAsset;
  video?: StoryblokAsset;
  poster?: StoryblokAsset;
  /** Overlay/UI rendered light (on a dark visual) when true. */
  titre_clair?: boolean;
}

export interface HomeSlideBlok extends SbBlokData {
  component: 'home_slide';
  image_paysage?: StoryblokAsset;
  image_portrait?: StoryblokAsset;
  video?: StoryblokAsset;
  poster?: StoryblokAsset;
  /** Relation to the featured `project` — drives the derived title + click-through. */
  projet?: SbRelation;
  titre_clair?: boolean;
}

export interface ProjectBlok extends SbBlokData {
  component: 'project';
  titre: string;
  ville?: string;
  /** Relation to a single `programme` story (nom + couleur). */
  programme?: SbRelation;
  /** Values from the "thematique" datasource. */
  thematiques?: string[];
  /** One-line programme description ("Restructuration de logements insalubres…"). */
  description_programme?: string;
  maitre_ouvrage?: string;
  equipe?: string;
  statut?: string;
  surface_sdp?: string;
  montant_ht?: string;
  divers?: string;
  texte?: RichText;
  /** Up to 3 (schema-enforced). */
  engagements?: EngagementBlok[];
  carrousel?: MediaSlideBlok[];
  /** B/W plan-masse vignette (Projets "PM" grid + related strip). */
  vignette_plan?: StoryblokAsset;
  /** Cover photo (VRAC grid + Index hover); falls back to the first carousel image. */
  photo_couverture?: StoryblokAsset;
  /** Relations to other `project` stories. */
  projets_lies?: SbRelation[];
}

export interface ProjectListBlok extends SbBlokData {
  component: 'project_list';
  titre: string;
  intro?: RichText;
}

export interface AtelierPageBlok extends SbBlokData {
  component: 'atelier_page';
  video?: StoryblokAsset;
  image?: StoryblokAsset;
  titre_minga?: string;
  texte_minga?: RichText;
  titre_construire?: string;
  texte_construire?: RichText;
  titre_clients?: string;
  clients_collectivites?: string;
  clients_oph?: string;
  clients_moa?: string;
  titre_equipe?: string;
  equipe?: TeamMemberBlok[];
}

export interface HomePageBlok extends SbBlokData {
  component: 'home_page';
  carrousel?: HomeSlideBlok[];
}

export interface GlobalSettings extends SbBlokData {
  component: 'global_settings';
  /** SVG logo — rendered from the raw filename, not the image service. */
  logo?: StoryblokAsset;
  nom_atelier?: string;
  email?: string;
  telephone?: string;
  adresse_paris?: string;
  adresse_anglet?: string;
  mentions_legales?: RichText;
  reseaux_sociaux?: SocialLinkBlok[];
}

/** Resolved programme label + story slug + normalized hex colour. */
export interface ProgrammeSummary {
  nom: string;
  slug?: string;
  couleur?: string;
}

/** Programme surfaced to the UI: label, story slug (colour-map key + deep-link), hex colour. */
export interface ProgrammeLink {
  nom: string;
  slug: string;
  couleur?: string;
}

/** Lightweight project view-model for the grid, Index table, related strip and cards. */
export interface ProjectSummary {
  slug: string;
  titre: string;
  ville?: string;
  description_programme?: string;
  maitre_ouvrage?: string;
  statut?: string;
  programme?: ProgrammeSummary;
  thematiques: string[];
  /** Plan-masse vignette (PM grid + related strip). */
  vignette?: StoryblokAsset;
  /** Cover photo (VRAC grid + Index hover) — explicit field or first carousel image. */
  photo?: StoryblokAsset;
}

/** Entry from the "thematique" Storyblok datasource. */
export interface ThematiqueEntry {
  name: string;
  value: string;
}
