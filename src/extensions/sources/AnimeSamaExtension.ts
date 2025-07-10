import {
  AnimeExtension,
  type ExtensionInfo,
  type SearchResult,
  type VideoSource,
} from '../../types/extension';

import type { Episode, AnimeDetails, AnimeCardInfo } from '../../types/anime';

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
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Données mockées pour les détails
    return {
      id,
      title: `Anime ${id}`,
      posterUrl: `https://picsum.photos/300/400?random=${id}`,
      bannerUrl: `https://picsum.photos/1200/300?random=${id}`,
      description: `Description détaillée de l'anime ${id}. Ceci est une description d'exemple générée automatiquement.`,
      year: 2023,
      status: 'ongoing',
      genres: ['Action', 'Aventure', 'Shonen'],
      rating: 8.5,
      studio: 'Studio Example',
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
