import type { Episode, AnimeDetails, AnimeCardInfo } from '@/types/anime';

/**
 * Interface pour les services d'extension
 */
interface ExtensionService {
  getEpisodes(animeName: string, season: string): Promise<Episode[]>;
  searchAnime(query: string): Promise<Partial<AnimeCardInfo>[]>;
  getAnimeDetails(animeName: string): Promise<AnimeDetails>;
}

/**
 * Service de gestion des extensions
 */
export class ExtensionManager {
  private services: Map<string, ExtensionService> = new Map();

  constructor() {
    this.services.set('animesama', {
      getEpisodes: async () => [],
      searchAnime: async () => [],
      getAnimeDetails: async () => ({
        id: '',
        title: '',
        description: '',
        posterUrl: '',
        genres: [],
        year: 0,
        rating: 0,
        studio: '',
        duration: '',
        extension: '',
        seasons: [],
        totalEpisodes: 0,
        status: 'ongoing',
      }),
    });
  }

  /**
   * Récupère les épisodes d'un anime depuis une extension
   */
  async getEpisodes(
    extension: string,
    animeName: string,
    season: string
  ): Promise<Episode[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getEpisodes(animeName, season);
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
  ): Promise<Partial<AnimeCardInfo>[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    return await service.searchAnime(query);
  }

  /**
   * Récupère les détails complets d'un anime depuis une extension9
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

      // En cas d'erreur, retourner des détails mockés
      return {
        id: '',
        title: '',
        description: '',
        posterUrl: '',
        genres: [],
        year: 0,
        rating: 0,
        studio: '',
        duration: '',
        extension: '',
        seasons: [],
        totalEpisodes: 0,
        status: 'ongoing', // Ajout de la propriété requise 'status'
      };
    }
  }

  /**
   * Retourne la liste des extensions disponibles
   */
  getAvailableExtensions(): string[] {
    return Array.from(this.services.keys());
  }
}

// Instance singleton
export const extensionManager = new ExtensionManager();
