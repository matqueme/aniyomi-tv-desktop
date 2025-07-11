import {
  AnimeExtension,
  type ExtensionInfo,
  type SearchResult,
  type VideoSource,
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
      const title = el.querySelector('h1')?.textContent || '';
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
      const title = a.querySelector('h1')?.textContent || '';
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

    // Description
    let description =
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      '';
    if (!description) {
      // Fallback to synopsis paragraph
      description =
        doc.querySelector('h2:contains("Synopsis") + p')?.textContent?.trim() ||
        '';
      if (!description) {
        // Try to find the first <p> after "Synopsis"
        const synopsisHeader = Array.from(doc.querySelectorAll('h2')).find(
          (h2) => h2.textContent?.toLowerCase().includes('synopsis')
        );
        if (synopsisHeader) {
          const nextP =
            synopsisHeader.nextElementSibling as HTMLParagraphElement;
          if (nextP && nextP.tagName === 'P') {
            description = nextP.textContent?.trim() || '';
          }
        }
      }
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

  async getEpisodes(animeId: string): Promise<Episode[]> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Génération d'épisodes mockés
    const episodes: Episode[] = [];
    for (let i = 1; i <= 12; i++) {
      episodes.push({
        id: `${animeId}-ep-${i}`,
        number: i,
        title: `Épisode ${i}`,
        thumbnailUrl: `https://picsum.photos/300/170?random=${animeId}-${i}`,
        duration: '24min',
        animeId: '',
        videoUrl: '',
      });
    }

    return episodes;
  }

  async getVideoSources(): Promise<VideoSource[]> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Sources vidéo mockées
    return [];
  }
}

/**
 * Extrait les saisons d'un anime à partir du script JS de la page détail.
 * Inspiré de la fonction Kotlin fetchAnimeSeasons.
 * @param doc Document HTML parsé (DOMParser)
 * @param animeId id de l'anime
 * @param baseUrl url racine de l'extension
 * @param posterUrl url de l'image principale
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
    const seasonStem = match[2];
    const voiceMatch = seasonStem.match(/\/(vostfr|vf)/i);
    const voice = voiceMatch ? voiceMatch[1].toLowerCase() : 'vostfr';
    seasons.push({
      number: seasons.length + 1,
      title: seasonName,
      episodeCount: 0,
      voices: [voice],
    });
  }
  return seasons;
}
