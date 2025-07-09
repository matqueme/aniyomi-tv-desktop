import type { Episode, AnimeDetails, AnimeCardInfo } from '@/types/anime';
import './animesama';

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
 * Service de gestion des extensions d'anime
 */
export class ExtensionManager {
  private services: Map<string, ExtensionService> = new Map();

  constructor() {
    // Le manager est maintenant vide et les extensions sont enregistrées séparément
  }

  /**
   * Enregistre une extension
   */
  registerExtension(key: string, service: ExtensionService): void {
    this.services.set(key, service);
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
