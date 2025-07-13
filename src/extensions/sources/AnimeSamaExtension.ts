import {
  AnimeExtension,
  type ExtensionInfo,
  type SearchResult,
} from '../../types/extension';

import type {
  Episode,
  AnimeDetails,
  AnimeCardInfo,
  Season,
} from '../../types/anime';

/**
 * Extension pour AnimeSama
 * Cette extension permet de scraper les données d'AnimeSama.fr
 */
export class AnimeSamaExtension extends AnimeExtension {
  readonly info: ExtensionInfo = {
    id: 'animesama',
    name: 'AnimeSama',
    version: '1.0.0',
    description: 'Extension pour scraper AnimeSama',
    baseUrl: 'https://anime-sama.fr',
    language: 'fr',
    isEnabled: true,
  };

  async getPopularAnime(): Promise<SearchResult> {
    // Utilisation d'un proxy CORS public pour le dev
    const url = `${this.info.baseUrl}/`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const animesMap = new Map<string, AnimeCardInfo>();
    const links = doc.querySelectorAll('#containerPepites > div a');
    links.forEach((el) => {
      const href = el.getAttribute('href') || '';
      // Extraction de l'id d'anime depuis l'URL (ex: /catalogue/akudama-drive/)
      const match = href.match(/\/catalogue\/([^/]+)/);
      const animeId = match ? match[1] : href;
      // Extraction du titre directement depuis le h1
      const title = el.querySelector('h1')?.textContent?.trim() || '';
      // Extraction directe de l'image
      const posterUrl = el.querySelector('img')?.getAttribute('src') || '';
      if (animeId && title && !animesMap.has(animeId)) {
        animesMap.set(animeId, {
          id: animeId,
          title,
          posterUrl: posterUrl.startsWith('http')
            ? posterUrl
            : `${this.info.baseUrl}${posterUrl}`,
          extension: this.info.id,
        });
      }
    });
    return { items: Array.from(animesMap.values()) };
  }

  async getLatestUpdates(): Promise<SearchResult> {
    // Utilisation d'un proxy CORS public pour le dev
    const url = `${this.info.baseUrl}/`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const animesMap = new Map<string, AnimeCardInfo>();
    const items = doc.querySelectorAll('#containerAjoutsAnimes > div a');
    items.forEach((a) => {
      const href = a.getAttribute('href') || '';
      // Extraction de l'id d'anime depuis l'URL (ex: /catalogue/the-water-magician/saison1/vostfr/)
      const match = href.match(/\/catalogue\/([^/]+)/);
      const animeId = match ? match[1] : href;
      // Extraction du titre directement depuis le h1
      const title = a.querySelector('h1')?.textContent?.trim() || '';
      // Extraction directe de l'image
      const posterUrl = a.querySelector('img')?.getAttribute('src') || '';
      if (animeId && title && !animesMap.has(animeId)) {
        animesMap.set(animeId, {
          id: animeId,
          title,
          posterUrl: posterUrl.startsWith('http')
            ? posterUrl
            : `${this.info.baseUrl}${posterUrl}`,
          extension: this.info.id,
        });
      }
    });
    return { items: Array.from(animesMap.values()) };
  }

  async searchAnime(): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulation d'une recherche
    const mockResults: AnimeCardInfo[] = [];

    return {
      items: mockResults,
    };
  }

  async getAnimeDetails(id: string): Promise<AnimeDetails> {
    const url = `${this.info.baseUrl}/catalogue/${id}/`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Title
    const title = doc.querySelector('#titreOeuvre')?.textContent?.trim() || id;

    // Poster URL
    let posterUrl =
      doc.querySelector('#coverOeuvre')?.getAttribute('src') || '';
    if (posterUrl && !posterUrl.startsWith('http')) {
      posterUrl = `${this.info.baseUrl}${posterUrl}`;
    }
    // Fallback to meta tag if not found
    if (!posterUrl) {
      posterUrl =
        doc
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content') || '';
    }

    // Banner URL (use og:image if available)
    const bannerUrl =
      doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      posterUrl;

    // Description - prioritize synopsis paragraph over broken meta description
    let description = '';

    // First try to get synopsis from the actual synopsis section
    const synopsisHeader = Array.from(doc.querySelectorAll('h2')).find((h2) =>
      h2.textContent?.toLowerCase().includes('synopsis')
    );
    if (synopsisHeader) {
      const nextP = synopsisHeader.nextElementSibling as HTMLParagraphElement;
      if (nextP && nextP.tagName === 'P') {
        description = nextP.textContent?.trim() || '';
      }
    }

    // Fallback to meta description only if synopsis not found
    if (!description) {
      description =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute('content') || '';
    }

    // Genres
    let genres: string[] = [];
    const genresEl = Array.from(doc.querySelectorAll('h2')).find((h2) =>
      h2.textContent?.toLowerCase().includes('genres')
    );
    if (genresEl) {
      const nextA = genresEl.nextElementSibling as HTMLAnchorElement;
      if (nextA && nextA.tagName === 'A') {
        genres = nextA.textContent?.split(',').map((g) => g.trim()) || [];
      }
    } else {
      // Fallback: find <a> with text under "Genres"
      const genresText = doc.querySelector(
        'a.text-sm.text-gray-300'
      )?.textContent;
      if (genresText) {
        genres = genresText.split(',').map((g) => g.trim());
      }
    }

    const seasons: Season[] = await getSeasons(doc);

    return {
      id,
      title,
      posterUrl,
      bannerUrl,
      description,
      genres,
      seasons,
      extension: this.info.id,
    };
  }
}

/**
 * Extrait les saisons d'un anime à partir du script JS de la page détail.
 * Inspiré de la fonction Kotlin fetchAnimeSeasons.
 * @param doc Document HTML parsé (DOMParser)
 * @param animeId id de l'anime
 * @param baseUrl url racine de l'extension
 * @param posterUrl url de l'image principale
 * @return Promise<Season[]>
 */
async function getSeasons(doc: Document): Promise<Season[]> {
  // Récupère le script JS qui contient les panneaux de saisons
  const scripts = Array.from(
    doc.querySelectorAll('h2 + p + div > script, h2 + div > script')
  )
    .map((s) => s.textContent || '')
    .join('\n');
  const cleanedScripts = scripts
    .replace(/\/\*[\s\S]*?\*\//g, '') // retire les blocs /* ... */
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

  // Regex pour panneauAnime("Saison 1", "saison1/vostfr")
  const seasonRegex = /panneauAnime\(["']([^"']+)["'],\s*["']([^"']+)["']\)/g;
  const seasons: Season[] = [];
  let match;
  while ((match = seasonRegex.exec(cleanedScripts)) !== null) {
    const seasonName = match[1];
    const voice = await extractLanguages(doc);
    const episodes = await getEpisodes(
      doc,
      match[2],
      doc.baseURI,
      doc.querySelector('#coverOeuvre')?.getAttribute('src') || ''
    );

    seasons.push({
      number: seasons.length + 1,
      title: seasonName,
      episodeCount: 0,
      voices: voice,
      episodes: episodes,
    });
  }

  return seasons;
}

async function getEpisodes(
  doc: Document,
  animeId: string,
  baseUrl: string,
  posterUrl: string
): Promise<Episode[]> {
  const episodes: Episode[] = [];
  const episodeElements = doc.querySelectorAll('#containerEpisodes > div > a');
  episodeElements.forEach((el) => {
    const href = el.getAttribute('href') || '';
    const match = href.match(/\/catalogue\/([^/]+)\/saison(\d+)\/episode(\d+)/);
    if (match) {
      const [, animeSlug, seasonNumber, episodeNumber] = match;
      const episodeId = `${animeSlug}-saison${seasonNumber}-episode${episodeNumber}`;
      const title = el.querySelector('h1')?.textContent?.trim() || '';
      const thumbnailUrl =
        el.querySelector('img')?.getAttribute('src') || posterUrl;
      episodes.push({
        id: episodeId,
        animeId,
        number: parseInt(episodeNumber, 10),
        title,
        thumbnailUrl: thumbnailUrl.startsWith('http')
          ? thumbnailUrl
          : `${baseUrl}${thumbnailUrl}`,
        videoUrl: '', // À remplir plus tard
        voices: [],
      });
    }
  });
  return episodes;
}

/**
 * Extrait les langues disponibles pour un anime à partir du DOM.
 * Cherche dans les headers "Langue" ou "Voix", puis dans le script JS si rien trouvé.
 * @param doc Document HTML parsé (DOMParser)
 * @return Promise<string[]>
 */
async function extractLanguages(doc: Document): Promise<string[]> {
  // Cherche le header "Langue" ou "Voix"
  const langHeader = Array.from(doc.querySelectorAll('h2')).find(
    (h2) =>
      h2.textContent?.toLowerCase().includes('langue') ||
      h2.textContent?.toLowerCase().includes('voix')
  );
  let languages: string[] = [];
  if (langHeader) {
    let nextEl = langHeader.nextElementSibling;
    while (nextEl && (nextEl.tagName === 'A' || nextEl.tagName === 'SPAN')) {
      const text = nextEl.textContent?.trim();
      if (text) languages.push(text);
      nextEl = nextEl.nextElementSibling;
    }
    if (languages.length === 0 && nextEl && nextEl.textContent) {
      languages = nextEl.textContent.split(',').map((l) => l.trim());
    }
  }
  // Fallback: cherche dans le JS si rien trouvé
  if (languages.length === 0) {
    const scripts = Array.from(doc.querySelectorAll('script'))
      .map((s) => s.textContent || '')
      .join('\n');
    const voiceRegex = /panneauAnime\(["'][^"']+["'],\s*["']([^"']+)["']\)/g;
    let match;
    const found: Set<string> = new Set();
    while ((match = voiceRegex.exec(scripts)) !== null) {
      const stem = match[1];
      if (stem.toLowerCase().includes('vostfr')) found.add('VOSTFR');
      if (stem.toLowerCase().includes('vf')) found.add('VF');
    }
    if (found.size > 0) languages = Array.from(found);
  }
  console.log(`Languages found: ${languages.join(', ')}`);
  return languages;
}
