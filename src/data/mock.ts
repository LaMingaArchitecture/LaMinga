import type {
  AtelierPageBlok,
  GlobalSettings,
  HomePageBlok,
  ProjectBlok,
  ProjectListBlok,
  RichText,
  TypologieEntry,
} from '../types/storyblok';

// Mock content lets `pnpm build` pass before the live Storyblok space is
// populated. Once stories exist, the live data takes precedence (see content.ts).

function richtext(text: string): RichText {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  } as RichText;
}

export const typologiesMock: TypologieEntry[] = [
  { name: 'Logement', value: 'logement' },
  { name: 'Équipement public', value: 'equipement-public' },
  { name: 'Tertiaire', value: 'tertiaire' },
  { name: 'Réhabilitation', value: 'rehabilitation' },
];

export const projectsMock: Array<{ slug: string; content: ProjectBlok }> = [
  {
    slug: 'villa-belvedere',
    content: {
      _uid: 'mock-1',
      component: 'project',
      titre: 'Villa Belvédère',
      typologie: 'logement',
      annee: '2024',
      localisation: 'Annecy',
      maitre_ouvrage: 'Privé',
      equipe: 'LaMinga',
      credits: 'Photos : Studio X',
      affichage: 'scroll',
      visuels: [
        {
          filename: 'https://a.storyblok.com/f/000000/1200x800/abcdef0001/villa.jpg',
          alt: 'Villa Belvédère',
        },
      ],
      projet_similaire: 'mock-2',
    },
  },
  {
    slug: 'mediatheque-lumiere',
    content: {
      _uid: 'mock-2',
      component: 'project',
      titre: 'Médiathèque Lumière',
      typologie: 'equipement-public',
      annee: '2023',
      localisation: 'Lyon',
      maitre_ouvrage: 'Ville de Lyon',
      equipe: 'LaMinga + partenaires',
      credits: 'Photos : Studio Y',
      affichage: 'carousel',
      visuels: [
        {
          filename: 'https://a.storyblok.com/f/000000/1200x800/abcdef0002/mediatheque.jpg',
          alt: 'Médiathèque Lumière',
        },
      ],
    },
  },
  {
    slug: 'rehabilitation-docks',
    content: {
      _uid: 'mock-3',
      component: 'project',
      titre: 'Réhabilitation des Docks',
      typologie: 'rehabilitation',
      annee: '2022',
      localisation: 'Bordeaux',
      maitre_ouvrage: 'SEM Bordeaux',
      affichage: 'scroll',
      visuels: [
        {
          filename: 'https://a.storyblok.com/f/000000/1200x800/abcdef0003/docks.jpg',
          alt: 'Réhabilitation des Docks',
        },
      ],
    },
  },
];

export const homeMock: HomePageBlok = {
  _uid: 'mock-home',
  component: 'homePage',
  titre: 'LaMinga — Atelier d’architecture',
  intro: richtext('Nous concevons des lieux qui racontent une histoire.'),
};

export const projectListMock: ProjectListBlok = {
  _uid: 'mock-projectlist',
  component: 'projectList',
  titre: 'Projets',
  intro: richtext('Une sélection de nos réalisations, classées par typologie.'),
};

export const atelierMock: AtelierPageBlok = {
  _uid: 'mock-atelier',
  component: 'atelierPage',
  intro: richtext('LaMinga est un atelier d’architecture.'),
  competences: richtext('Conception, maîtrise d’œuvre, scénographie.'),
  clients: richtext('Collectivités, particuliers, institutions.'),
  equipe: [
    { _uid: 'tm-1', component: 'teamMember', nom: 'A. Architecte', role: 'Cofondatrice' },
    { _uid: 'tm-2', component: 'teamMember', nom: 'B. Architecte', role: 'Cofondateur' },
  ],
};

export const settingsMock: GlobalSettings = {
  _uid: 'mock-settings',
  component: 'globalSettings',
  reseaux_sociaux: [
    {
      _uid: 'sl-1',
      component: 'socialLink',
      plateforme: 'Instagram',
      url: 'https://instagram.com/laminga',
    },
    {
      _uid: 'sl-2',
      component: 'socialLink',
      plateforme: 'LinkedIn',
      url: 'https://linkedin.com/company/laminga',
    },
  ],
  footer_adresse: 'LaMinga — 1 rue de l’Architecture, 75000 Paris',
  footer_mentions: richtext('© LaMinga. Tous droits réservés.'),
  email: 'contact@laminga.fr',
};
