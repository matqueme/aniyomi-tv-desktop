import {
  AnimeExtension,
  type ExtensionInfo,
  type SearchResult,
  type AnimeSourceDetails,
  type AnimeEpisode,
  type VideoSource,
  type AnimeSource,
} from '../types/extension';

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

  private createMockAnime(
    id: string,
    title: string,
    index: number
  ): AnimeSource {
    return {
      id,
      title,
      url: `${this.info.baseUrl}/anime/${id}`,
      posterUrl: `https://picsum.photos/300/400?random=${index}`,
      year: 2020 + (index % 5),
      status: index % 3 === 0 ? 'ongoing' : 'completed',
      episodeCount: 12 + (index % 13),
    };
  }

  async getPopularAnime(page: number = 1): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Données mockées pour les animes populaires
    const mockAnimes: AnimeSource[] = [
      this.createMockAnime('popular-1', 'Attack on Titan', 1),
      this.createMockAnime('popular-2', 'Demon Slayer', 2),
      this.createMockAnime('popular-3', 'One Piece', 3),
      this.createMockAnime('popular-4', 'Naruto', 4),
      this.createMockAnime('popular-5', 'Dragon Ball Z', 5),
      this.createMockAnime('popular-6', 'My Hero Academia', 6),
      this.createMockAnime('popular-7', 'Jujutsu Kaisen', 7),
      this.createMockAnime('popular-8', 'Death Note', 8),
    ];

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
    const mockAnimes: AnimeSource[] = [
      this.createMockAnime('latest-1', 'Chainsaw Man', 11),
      this.createMockAnime('latest-2', 'Spy x Family', 12),
      this.createMockAnime('latest-3', 'Mob Psycho 100', 13),
      this.createMockAnime('latest-4', 'Tokyo Revengers', 14),
      this.createMockAnime('latest-5', 'Bleach', 15),
      this.createMockAnime('latest-6', 'Hunter x Hunter', 16),
    ];

    return {
      items: mockAnimes,
      hasNextPage: page < 2,
      currentPage: page,
    };
  }

  async searchAnime(query: string, page: number = 1): Promise<SearchResult> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulation d'une recherche
    const mockResults: AnimeSource[] = [
      this.createMockAnime('search-1', `${query} - Résultat 1`, 21),
      this.createMockAnime('search-2', `${query} - Résultat 2`, 22),
      this.createMockAnime('search-3', `${query} - Résultat 3`, 23),
    ];

    return {
      items: mockResults,
      hasNextPage: false,
      currentPage: page,
    };
  }

  async getAnimeDetails(id: string): Promise<AnimeSourceDetails> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Données mockées pour les détails
    return {
      id,
      title: `Anime ${id}`,
      url: `${this.info.baseUrl}/anime/${id}`,
      posterUrl: `https://picsum.photos/300/400?random=${id}`,
      bannerUrl: `https://picsum.photos/1200/300?random=${id}`,
      description: `Description détaillée de l'anime ${id}. Ceci est une description d'exemple générée automatiquement.`,
      year: 2023,
      status: 'ongoing',
      genres: ['Action', 'Aventure', 'Shonen'],
      rating: 8.5,
      studio: 'Studio Example',
      episodes: [],
    };
  }

  async getEpisodes(animeId: string): Promise<AnimeEpisode[]> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Génération d'épisodes mockés
    const episodes: AnimeEpisode[] = [];
    for (let i = 1; i <= 12; i++) {
      episodes.push({
        id: `${animeId}-ep-${i}`,
        number: i,
        title: `Épisode ${i}`,
        url: `${this.info.baseUrl}/anime/${animeId}/episode/${i}`,
        thumbnailUrl: `https://picsum.photos/300/170?random=${animeId}-${i}`,
        duration: '24min',
        releaseDate: new Date(2023, 0, i),
      });
    }

    return episodes;
  }

  async getVideoSources(episodeId: string): Promise<VideoSource[]> {
    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Sources vidéo mockées
    return [
      {
        url: `https://example.com/video/${episodeId}/720p.m3u8`,
        quality: '720p',
        isM3U8: true,
      },
      {
        url: `https://example.com/video/${episodeId}/1080p.m3u8`,
        quality: '1080p',
        isM3U8: true,
      },
    ];
  }
}
