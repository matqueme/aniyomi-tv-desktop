import type { Episode, AnimeDetails, AnimeCardInfo } from '@/types/anime';
import { animeSamaService } from './animesama';
import type { AnimeSamaAnime, AnimeSamaEpisode } from '@/types/animesama';

/**
 * Interface pour les services d'extension
 */
interface ExtensionService {
  name: string;
  version: string;
  baseUrl: string;
  isEnabled: boolean;

  // Méthodes principales
  searchAnime(query: string): Promise<AnimeCardInfo[]>;
  getAnimeDetails(url: string): Promise<AnimeDetails>;
  getEpisodes(animeUrl: string): Promise<Episode[]>;
  getPopularAnimes(
    page?: number
  ): Promise<{ data: AnimeCardInfo[]; hasNextPage: boolean }>;
  getLatestUpdates(): Promise<{ data: AnimeCardInfo[]; hasNextPage: boolean }>;
}

/**
 * Convertit un anime AnimeSama en AnimeCardInfo
 */
function convertAnimeSamaToCardInfo(anime: AnimeSamaAnime): AnimeCardInfo {
  return {
    id: anime.url,
    title: anime.title,
    posterUrl: anime.thumbnailUrl || '',
    extension: 'animesama',
    year: anime.year || new Date().getFullYear(),
  };
}

/**
 * Convertit un anime AnimeSama en AnimeDetails
 */
function convertAnimeSamaToDetails(
  anime: AnimeSamaAnime,
  url: string
): AnimeDetails {
  return {
    id: url,
    title: anime.title,
    description: anime.description || 'Aucune description disponible',
    posterUrl: anime.thumbnailUrl || '',
    year: anime.year,
    status: anime.status as 'ongoing' | 'completed' | 'upcoming' | undefined,
    genres: anime.genre ? anime.genre.split(', ') : [],
    studio: anime.studio,
    extension: 'animesama',
    seasons: [
      {
        number: 1,
        title: anime.title,
        episodeCount: anime.totalEpisodes || 0,
        status: anime.status as
          | 'ongoing'
          | 'completed'
          | 'upcoming'
          | undefined,
      },
    ],
    totalEpisodes: anime.totalEpisodes || 0,
  };
}

/**
 * Convertit un épisode AnimeSama en Episode
 */
function convertAnimeSamaEpisode(
  episode: AnimeSamaEpisode,
  animeUrl: string
): Episode {
  return {
    id: `${animeUrl}_${episode.episodeNumber}`,
    animeId: animeUrl,
    number: episode.episodeNumber,
    title: episode.name,
    description: `Langues disponibles: ${episode.scanlator || 'Non spécifié'}`,
    videoUrl: '', // Sera rempli lors de la lecture
    duration: '24:00',
    airDate: new Date(),
  };
}

/**
 * Service de gestion des extensions d'anime
 */
export class ExtensionManager {
  private services: Map<string, ExtensionService> = new Map();

  constructor() {
    this.registerAnimeSamaService();
  }

  /**
   * Enregistre le service AnimeSama
   */
  private registerAnimeSamaService(): void {
    const animeSamaExtension: ExtensionService = {
      name: 'AnimeSama',
      version: '1.0.0',
      baseUrl: 'https://anime-sama.fr',
      isEnabled: true,

      async searchAnime(query: string): Promise<AnimeCardInfo[]> {
        try {
          const results = await animeSamaService.searchAnimes({
            query,
            page: 1,
          });
          return results.data.map(convertAnimeSamaToCardInfo);
        } catch (error) {
          console.error('Erreur lors de la recherche AnimeSama:', error);
          return [];
        }
      },

      async getAnimeDetails(url: string): Promise<AnimeDetails> {
        try {
          const animeInfo = await animeSamaService.getAnimeDetails(url);
          if (!animeInfo) {
            throw new Error('Anime non trouvé');
          }

          // Récupérer le nombre d'épisodes pour des informations plus complètes
          let episodeCount = animeInfo.totalEpisodes;
          if (!episodeCount) {
            try {
              const episodes = await animeSamaService.getEpisodeList(url);
              episodeCount = episodes.length;
            } catch (error) {
              console.warn(
                "Impossible de récupérer le nombre d'épisodes:",
                error
              );
              episodeCount = 0;
            }
          }

          const details = convertAnimeSamaToDetails(animeInfo, url);

          // Mettre à jour le nombre d'épisodes si on l'a récupéré
          if (episodeCount > 0) {
            details.totalEpisodes = episodeCount;
            if (details.seasons) details.seasons[0].episodeCount = episodeCount;
          }

          return details;
        } catch (error) {
          console.error('Erreur lors de la récupération des détails:', error);
          throw error;
        }
      },

      async getEpisodes(animeUrl: string): Promise<Episode[]> {
        try {
          const episodes = await animeSamaService.getEpisodeList(animeUrl);
          return episodes.map((ep) => convertAnimeSamaEpisode(ep, animeUrl));
        } catch (error) {
          console.error('Erreur lors de la récupération des épisodes:', error);
          return [];
        }
      },

      async getPopularAnimes(
        page: number = 1
      ): Promise<{ data: AnimeCardInfo[]; hasNextPage: boolean }> {
        try {
          const results = await animeSamaService.getPopularAnimes(page);
          return {
            data: results.data.map(convertAnimeSamaToCardInfo),
            hasNextPage: results.hasNextPage,
          };
        } catch (error) {
          console.error(
            'Erreur lors de la récupération des animes populaires:',
            error
          );
          return { data: [], hasNextPage: false };
        }
      },

      async getLatestUpdates(): Promise<{
        data: AnimeCardInfo[];
        hasNextPage: boolean;
      }> {
        try {
          const results = await animeSamaService.getLatestUpdates();
          return {
            data: results.data.map(convertAnimeSamaToCardInfo),
            hasNextPage: results.hasNextPage,
          };
        } catch (error) {
          console.error(
            'Erreur lors de la récupération des dernières MAJ:',
            error
          );
          return { data: [], hasNextPage: false };
        }
      },
    };

    this.services.set('animesama', animeSamaExtension);
  }

  /**
   * Récupère les épisodes d'un anime depuis une extension
   */
  async getEpisodes(extension: string, animeUrl: string): Promise<Episode[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getEpisodes(animeUrl);
    } catch (error) {
      console.error(`Erreur lors de la récupération des épisodes:`, error);
      return [];
    }
  }

  /**
   * Recherche des animes dans une extension
   */
  async searchAnime(
    extension: string,
    query: string
  ): Promise<AnimeCardInfo[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.searchAnime(query);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  /**
   * Récupère les détails complets d'un anime depuis une extension
   */
  async getAnimeDetails(
    extension: string,
    animeName: string
  ): Promise<AnimeDetails> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getAnimeDetails(animeName);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails de l'anime:`,
        error
      );

      // En cas d'erreur, retourner des détails par défaut
      return {
        id: animeName,
        title: 'Anime non trouvé',
        description: 'Impossible de récupérer les détails de cet anime',
        posterUrl: '',
        extension,
        seasons: [],
      };
    }
  }

  /**
   * Récupère les animes populaires d'une extension
   */
  async getPopularAnimes(
    extension: string,
    page: number = 1
  ): Promise<{ data: AnimeCardInfo[]; hasNextPage: boolean }> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getPopularAnimes(page);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des animes populaires:',
        error
      );
      return { data: [], hasNextPage: false };
    }
  }

  /**
   * Récupère les dernières mises à jour d'une extension
   */
  async getLatestUpdates(
    extension: string
  ): Promise<{ data: AnimeCardInfo[]; hasNextPage: boolean }> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getLatestUpdates();
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières MAJ:', error);
      return { data: [], hasNextPage: false };
    }
  }

  /**
   * Retourne la liste des extensions disponibles
   */
  getAvailableExtensions(): Array<{
    key: string;
    name: string;
    version: string;
    baseUrl: string;
    isEnabled: boolean;
  }> {
    return Array.from(this.services.entries()).map(([key, service]) => ({
      key,
      name: service.name,
      version: service.version,
      baseUrl: service.baseUrl,
      isEnabled: service.isEnabled,
    }));
  }

  /**
   * Active ou désactive une extension
   */
  toggleExtension(extensionKey: string, enabled: boolean): boolean {
    const service = this.services.get(extensionKey);
    if (!service) {
      return false;
    }

    service.isEnabled = enabled;
    return true;
  }

  /**
   * Vérifie si une extension est disponible et activée
   */
  isExtensionEnabled(extensionKey: string): boolean {
    const service = this.services.get(extensionKey);
    return service ? service.isEnabled : false;
  }
}

// Instance singleton
export const extensionManager = new ExtensionManager();
