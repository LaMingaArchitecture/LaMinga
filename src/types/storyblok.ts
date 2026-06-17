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

/** Display mode for a project's visuals. */
export type DisplayMode = 'carousel' | 'scroll';

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
}

export interface ProjectBlok extends SbBlokData {
  component: 'project';
  titre: string;
  /** Datasource entry value from the "typologie" datasource. */
  typologie: string;
  annee?: string;
  localisation?: string;
  maitre_ouvrage?: string;
  equipe?: string;
  credits?: string;
  visuels?: StoryblokAsset[];
  affichage?: DisplayMode;
  /** Relation to another Project — resolved story, or a uuid string when unresolved. */
  projet_similaire?: ISbStoryData | string;
}

export interface ProjectListBlok extends SbBlokData {
  component: 'project_list';
  titre: string;
  intro?: RichText;
}

export interface AtelierPageBlok extends SbBlokData {
  component: 'atelier_page';
  intro?: RichText;
  competences?: RichText;
  clients?: RichText;
  equipe?: TeamMemberBlok[];
}

export interface HomePageBlok extends SbBlokData {
  component: 'home_page';
  titre?: string;
  intro?: RichText;
  /** Featured project references (uuids or resolved stories); empty = show all. */
  projets?: Array<ISbStoryData | string>;
}

export interface GlobalSettings extends SbBlokData {
  component: 'global_settings';
  reseaux_sociaux?: SocialLinkBlok[];
  footer_adresse?: string;
  footer_mentions?: RichText;
  email?: string;
}

/** Lightweight project view-model for grids and cards. */
export interface ProjectSummary {
  slug: string;
  titre: string;
  typologie: string;
  cover?: StoryblokAsset;
}

/** Entry from the "typologie" Storyblok datasource. */
export interface TypologieEntry {
  name: string;
  value: string;
}
