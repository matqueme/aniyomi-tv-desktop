import { extensionRegistry } from '../index';
import { extensionCache } from '../cache/CacheManager';
import type { AnimeCardInfo, AnimeDetails, Episode } from '@/types/anime';
import type {
  PaginatedResult,
  SearchParams,
  BaseExtension,
} from '../base/BaseExtension';

/**
 * Gestionnaire principal des extensions
 * Point d'entrée unique pour toutes les opérations sur les extensions
 */
export class ExtensionManager {
  private static instance: ExtensionManager;

  private constructor() {}

  /**
   * Obtient l'instance singleton
   */
  public static getInstance(): ExtensionManager {
    if (!ExtensionManager.instance) {
      ExtensionManager.instance = new ExtensionManager();
    }
    return ExtensionManager.instance;
  }

  /**
   * Recherche des animes
   */
  async searchAnime(
    query: string,
    extensionId?: string,
    page: number = 1
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    const params: SearchParams = { query, page };

    if (extensionId) {
      const extension = extensionRegistry.getExtension(extensionId);
      if (!extension) {
        throw new Error(`Extension ${extensionId} non trouvée`);
      }
      return this.searchWithCache(extension, params);
    }

    // Recherche sur toutes les extensions
    const extensions = extensionRegistry.getSearchableExtensions();
    const results = await Promise.allSettled(
      extensions.map((ext) => this.searchWithCache(ext, params))
    );

    const combinedResults: AnimeCardInfo[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        combinedResults.push(...result.value.items);
      }
    }

    return {
      items: combinedResults,
      currentPage: page,
      totalPages: 1,
      hasNextPage: combinedResults.length >= 20,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Récupère les détails d'un anime
   */
  async getAnimeDetails(
    animeId: string,
    extensionId: string
  ): Promise<AnimeDetails> {
    const extension = extensionRegistry.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} non trouvée`);
    }

    const cacheKey = extensionCache.generateKey(
      extensionId,
      'getAnimeDetails',
      { animeId }
    );
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.getAnimeDetails(animeId),
      15 * 60 * 1000 // 15 minutes
    );
  }

  /**
   * Récupère les épisodes d'un anime
   */
  async getEpisodes(animeId: string, extensionId: string): Promise<Episode[]> {
    const extension = extensionRegistry.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} non trouvée`);
    }

    const cacheKey = extensionCache.generateKey(extensionId, 'getEpisodes', {
      animeId,
    });
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.getEpisodes(animeId),
      10 * 60 * 1000 // 10 minutes
    );
  }

  /**
   * Récupère l'URL vidéo d'un épisode
   */
  async getVideoUrl(episodeId: string, extensionId: string): Promise<string> {
    const extension = extensionRegistry.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} non trouvée`);
    }

    const cacheKey = extensionCache.generateKey(extensionId, 'getVideoUrl', {
      episodeId,
    });
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.getVideoUrl(episodeId),
      5 * 60 * 1000 // 5 minutes
    );
  }

  /**
   * Récupère les animes populaires
   */
  async getPopularAnime(
    extensionId?: string,
    page: number = 1
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    if (extensionId) {
      const extension = extensionRegistry.getExtension(extensionId);
      if (!extension) {
        throw new Error(`Extension ${extensionId} non trouvée`);
      }
      return this.getPopularWithCache(extension, page);
    }

    // Récupère depuis toutes les extensions
    const extensions = extensionRegistry.getPopularExtensions();
    const results = await Promise.allSettled(
      extensions.map((ext) => this.getPopularWithCache(ext, page))
    );

    const combinedResults: AnimeCardInfo[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        combinedResults.push(...result.value.items);
      }
    }

    return {
      items: combinedResults,
      currentPage: page,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  /**
   * Récupère les dernières mises à jour
   */
  async getLatestUpdates(
    extensionId?: string,
    page: number = 1
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    if (extensionId) {
      const extension = extensionRegistry.getExtension(extensionId);
      if (!extension) {
        throw new Error(`Extension ${extensionId} non trouvée`);
      }
      return this.getLatestWithCache(extension, page);
    }

    // Récupère depuis toutes les extensions
    const extensions = extensionRegistry.getLatestExtensions();
    const results = await Promise.allSettled(
      extensions.map((ext) => this.getLatestWithCache(ext, page))
    );

    const combinedResults: AnimeCardInfo[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        combinedResults.push(...result.value.items);
      }
    }

    return {
      items: combinedResults,
      currentPage: page,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  /**
   * Récupère les métadonnées des extensions
   */
  getExtensionMetadata() {
    return extensionRegistry.getExtensionMetadata();
  }

  /**
   * Méthodes privées avec cache
   */
  private async searchWithCache(
    extension: BaseExtension,
    params: SearchParams
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    const cacheKey = extensionCache.generateKey(
      extension.metadata.id,
      'searchAnime',
      params as unknown as Record<string, unknown>
    );
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.searchAnime(params),
      2 * 60 * 1000 // 2 minutes
    );
  }

  private async getPopularWithCache(
    extension: BaseExtension,
    page: number
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    const cacheKey = extensionCache.generateKey(
      extension.metadata.id,
      'getPopularAnime',
      { page }
    );
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.getPopularAnime(page),
      10 * 60 * 1000 // 10 minutes
    );
  }

  private async getLatestWithCache(
    extension: BaseExtension,
    page: number
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    const cacheKey = extensionCache.generateKey(
      extension.metadata.id,
      'getLatestUpdates',
      { page }
    );
    return extensionCache.getOrFetch(
      cacheKey,
      () => extension.getLatestUpdates(page),
      5 * 60 * 1000 // 5 minutes
    );
  }
}

// Instance singleton
export const extensionManager = ExtensionManager.getInstance();
