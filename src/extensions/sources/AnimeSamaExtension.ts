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
  Player,
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
    voices: ['VOSTFR', 'VF'],
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

    const seasons: Season[] = await this.getSeasons(doc, id);

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
  private async getSeasons(doc: Document, animeId: string): Promise<Season[]> {
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

    const seasonRegex = /panneauAnime\(["']([^"']+)["'],\s*["']([^"']+)["']\)/g;
    const seasons: Season[] = [];
    let match;
    while ((match = seasonRegex.exec(cleanedScripts)) !== null) {
      const seasonName = match[1];
      const seasonStem = match[2].split('/')[0]; // Ex: "saison1/vostfr" -> "saison1"
      const episodesResult = await this.getEpisodes(seasonStem, animeId);

      seasons.push({
        number: seasons.length + 1,
        title: seasonName,
        episodes: episodesResult.episodes,
        voices: episodesResult.availableVoices,
      });
    }

    return seasons;
  }

  private async getEpisodes(
    seasonStem: string,
    animeId: string
  ): Promise<{ episodes: Episode[]; availableVoices: string[] }> {
    const episodesByNumber: { [num: number]: Episode } = {};
    const availableVoices: string[] = [];
    const voices = (this.info.voices ?? []).map((v) => v.toLowerCase());

    for (const voice of voices) {
      const jsUrl = `${this.info.baseUrl}/catalogue/${animeId}/${seasonStem}/${voice}/episodes.js`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(jsUrl)}`;
      try {
        const res = await fetch(proxyUrl);
        if (!res.ok) continue;

        // Si on arrive ici, cette voix est disponible
        if (!availableVoices.includes(voice)) {
          availableVoices.push(voice);
        }

        const jsText = await res.text();
        // Regex pour trouver tous les tableaux epsX = [ ... ];
        const regex = /var\s+(eps\d+)\s*=\s*\[(.*?)\];/gs;
        let match;
        const allPlayers: string[][] = [];
        while ((match = regex.exec(jsText)) !== null) {
          const arrContent = match[2];
          // Extraire les URLs du tableau
          const urlRegex = /['"](https?:[^'"]+)['"]/g;
          let urlMatch;
          const urls: string[] = [];
          while ((urlMatch = urlRegex.exec(arrContent)) !== null) {
            urls.push(urlMatch[1]);
          }
          allPlayers.push(urls);
        }
        // On suppose que tous les tableaux ont le même nombre d'épisodes
        const maxEpisodes = Math.max(...allPlayers.map((arr) => arr.length), 0);
        for (let i = 0; i < maxEpisodes; i++) {
          const players: Player[] = [];
          for (const urls of allPlayers) {
            if (urls[i]) {
              players.push({ url: urls[i], voice });
            }
          }
          if (players.length > 0) {
            const epNum = i + 1;
            if (!episodesByNumber[epNum]) {
              episodesByNumber[epNum] = {
                id: `${animeId}-${seasonStem}-${epNum}`,
                animeId: animeId,
                number: epNum,
                title: `Episode ${epNum}`,
                voices: [voice],
                playersByVoice: {},
              };
            } else {
              const episode = episodesByNumber[epNum];
              // Ajouter la voix si elle n'est pas déjà présente
              if (episode.voices && !episode.voices.includes(voice)) {
                episode.voices.push(voice);
              } else if (!episode.voices) {
                episode.voices = [voice];
              }
            }
            const episode = episodesByNumber[epNum];
            if (!episode.playersByVoice) {
              episode.playersByVoice = {};
            }
            episode.playersByVoice[voice] = players;
          }
        }
      } catch {
        continue;
      }
    }

    return {
      episodes: Object.values(episodesByNumber),
      availableVoices: availableVoices,
    };
  }
}
