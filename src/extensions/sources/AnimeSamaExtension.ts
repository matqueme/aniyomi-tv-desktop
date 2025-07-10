import {
  AnimeExtension,
  type ExtensionInfo,
  type SearchResult,
  type VideoSource,
} from '../../types/extension';

import type { Episode, AnimeDetails, AnimeCardInfo } from '../../types/anime';

/**
 * Extension pour AnimeSama
 * Exemple d'implémentation d'une extension
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
    const animes: AnimeCardInfo[] = [];
    const links = doc.querySelectorAll('#containerPepites > div a');
    links.forEach((el) => {
      const href = el.getAttribute('href') || '';
      const title =
        el.querySelector('.titreAnime')?.textContent?.trim() ||
        el.textContent?.trim() ||
        '';
      const posterUrl = el.querySelector('img')?.getAttribute('src') || '';
      if (href && title) {
        animes.push({
          id: href,
          title,
          posterUrl: posterUrl.startsWith('http')
            ? posterUrl
            : `${this.info.baseUrl}${posterUrl}`,
          extension: this.info.id,
        });
      }
    });
    return { items: animes };
  }

  async getLatestUpdates(): Promise<SearchResult> {
    // Utilisation d'un proxy CORS public pour le dev
    const url = `${this.info.baseUrl}/`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const animes: AnimeCardInfo[] = [];
    const items = doc.querySelectorAll('#containerAjoutsAnimes > div');
    items.forEach((el) => {
      const a = el.querySelector('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const title =
        a.querySelector('.titreAnime')?.textContent?.trim() ||
        a.textContent?.trim() ||
        '';
      const posterUrl = a.querySelector('img')?.getAttribute('src') || '';
      if (href && title) {
        animes.push({
          id: href,
          title,
          posterUrl: posterUrl.startsWith('http')
            ? posterUrl
            : `${this.info.baseUrl}${posterUrl}`,
          extension: this.info.id,
        });
      }
    });
    return { items: animes };
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
