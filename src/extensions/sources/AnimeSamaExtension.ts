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

  async getPopularAnime(page: number = 1): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockAnimes: AnimeCardInfo[] = [];
    return {
      items: mockAnimes,
      hasNextPage: page < 3,
      currentPage: page,
    };
  }

  async getLatestUpdates(page: number = 1): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Données mockées pour les dernières mises à jour
    const mockAnimes: AnimeCardInfo[] = [];

    return {
      items: mockAnimes,
      hasNextPage: page < 2,
      currentPage: page,
    };
  }

  async searchAnime(_query: string, page: number = 1): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulation d'une recherche
    const mockResults: AnimeCardInfo[] = [];

    return {
      items: mockResults,
      hasNextPage: false,
      currentPage: page,
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
