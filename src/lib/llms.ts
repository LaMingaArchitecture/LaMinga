/**
 * Build the site's `llms.txt` (llmstxt.org format) from Storyblok content at build time: a
 * fact-dense, crawlable summary of the atelier for AI answer engines. Guards every optional field
 * and omits empty sections. See src/pages/llms.txt.ts (prod) and its preview stub.
 */
import { PUBLIC_SITE_URL } from 'astro:env/client';
import { getSettings, getAllProjects, getAtelierPage } from './content';
import { richTextToPlain } from './seo';
import { collapseWhitespace, isHttpUrl } from './url';

const abs = (path: string): string => new URL(path, PUBLIC_SITE_URL).href;
// Escape Markdown link/code-structural chars in editor-authored values so a crafted title like
// `Villa](https://evil)` can't inject a link into this AI-crawler feed (defense-in-depth: the file
// is served text/plain and editors are trusted, but llms.txt is consumed by answer engines).
const escapeMd = (value: string): string => value.replace(/[\\`[\]()]/g, '\\$&');

export async function buildLlmsTxt(): Promise<string> {
  const [settings, projects, atelier] = await Promise.all([
    getSettings(),
    getAllProjects(),
    getAtelierPage(),
  ]);

  const name = collapseWhitespace(settings?.nom_atelier) ?? 'LaMinga';
  const cities = [settings?.adresse_paris && 'Paris', settings?.adresse_anglet && 'Anglet'].filter(
    Boolean,
  ) as string[];
  const place = cities.length ? ` à ${cities.join(' et ')}` : '';
  const expertise =
    richTextToPlain(atelier?.texte_minga, 220) ?? richTextToPlain(atelier?.texte_construire, 220);
  const email = collapseWhitespace(settings?.email);
  const tel = collapseWhitespace(settings?.telephone);
  const contact = [email, tel].filter(Boolean).join(' · ');

  const intro = [
    `${name}, atelier d'architecture${place}.`,
    expertise,
    contact && `Contact : ${contact}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const sections: string[] = [`# ${name} — Atelier d'architecture`, `> ${intro}`];

  // ## Projets — one fact-dense row per project (titre — ville — programme — statut).
  if (projects.length > 0) {
    const rows = projects.map(({ slug, blok }) => {
      const facts = [
        collapseWhitespace(blok.ville),
        collapseWhitespace(blok.description_programme),
        collapseWhitespace(blok.statut),
      ]
        .filter((value): value is string => Boolean(value))
        .map(escapeMd)
        .join(' — ');
      const note = facts ? `: ${facts}` : '';
      const label = escapeMd(collapseWhitespace(blok.titre) ?? blok.titre);
      return `- [${label}](${abs(`/projets/${slug}`)})${note}`;
    });
    sections.push(['## Projets', '', ...rows].join('\n'));
  }

  // ## Pages — the key entry points.
  sections.push(
    [
      '## Pages',
      '',
      `- [Accueil](${abs('/')}): présentation de l'atelier et projets phares`,
      `- [Projets](${abs('/projets')}): tous les projets, filtrables par programme et thématique`,
      `- [Atelier](${abs('/atelier')}): l'atelier, l'équipe et l'approche`,
    ].join('\n'),
  );

  // ## Contact — machine-readable coordinates.
  const addrParis = collapseWhitespace(settings?.adresse_paris);
  const addrAnglet = collapseWhitespace(settings?.adresse_anglet);
  const contactRows = [
    email && `- Email : ${email}`,
    tel && `- Téléphone : ${tel}`,
    addrParis && `- Paris : ${addrParis}`,
    addrAnglet && `- Anglet : ${addrAnglet}`,
    ...(settings?.reseaux_sociaux ?? [])
      .filter((link) => isHttpUrl(link.url))
      .map(
        (link) =>
          `- ${escapeMd(collapseWhitespace(link.plateforme) ?? 'Lien')} : ${link.url.trim()}`,
      ),
  ].filter(Boolean) as string[];
  if (contactRows.length > 0) {
    sections.push(['## Contact', '', ...contactRows].join('\n'));
  }

  return `${sections.join('\n\n')}\n`;
}

/** Preview/draft stub — no draft project data leaked into a machine-readable file. */
export const PREVIEW_LLMS = `# LaMinga — prévisualisation

> Environnement de prévisualisation (contenu brouillon). Non destiné à l'indexation.
`;
