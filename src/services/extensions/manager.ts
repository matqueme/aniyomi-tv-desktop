import type { Episode, AnimeDetails, AnimeCardInfo } from '@/types/anime';
import type { ExtensionService, ExtensionMetadata } from '@/stores/extensions';

/**
 * Service de gestion des extensions d'anime
 * Utilise le store Pinia pour la gestion d'état
 */
export class ExtensionManager {
  private _store: ReturnType<
    typeof import('@/stores/extensions').useExtensionsStore
  > | null = null;

  constructor() {
    // Le store sera initialisé lors de la première utilisation
  }

  /**
   * Obtient l'instance du store (lazy initialization)
   */
  private async getStore() {
    if (!this._store) {
      const { useExtensionsStore } = await import('@/stores/extensions');
      this._store = useExtensionsStore();
    }
    return this._store;
  }

  /**
   * Enregistre une extension
   */
  async registerExtension(
    key: string,
    service: ExtensionService
  ): Promise<void> {
    const store = await this.getStore();
    store.registerExtension(key, service);
  }

  /**
   * Récupère les épisodes d'un anime depuis une extension
   */
  async getEpisodes(extension: string, animeUrl: string): Promise<Episode[]> {
    const store = await this.getStore();
    const service = store.getExtension(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    if (!service.isEnabled) {
      throw new Error(`Extension '${extension}' est désactivée`);
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
    const store = await this.getStore();
    const service = store.getExtension(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    if (!service.isEnabled) {
      console.warn(`Extension '${extension}' est désactivée`);
      return [];
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
    const store = await this.getStore();
    const service = store.getExtension(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    if (!service.isEnabled) {
      throw new Error(`Extension '${extension}' est désactivée`);
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
    extension: string
  ): Promise<{ data: AnimeCardInfo[] }> {
    const store = await this.getStore();
    const service = store.getExtension(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    if (!service.isEnabled) {
      console.warn(`Extension '${extension}' est désactivée`);
      return { data: [] };
    }

    try {
      return await service.getPopularAnimes();
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des animes populaires:',
        error
      );
      return { data: [] };
    }
  }

  /**
   * Récupère les dernières mises à jour d'une extension
   */
  async getLatestUpdates(
    extension: string
  ): Promise<{ data: AnimeCardInfo[] }> {
    const store = await this.getStore();
    const service = store.getExtension(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    if (!service.isEnabled) {
      console.warn(`Extension '${extension}' est désactivée`);
      return { data: [] };
    }

    try {
      return await service.getLatestUpdates();
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières MAJ:', error);
      return { data: [] };
    }
  }

  /**
   * Recherche dans toutes les extensions activées
   */
  async searchInAllExtensions(query: string): Promise<{
    [extensionKey: string]: AnimeCardInfo[];
  }> {
    const store = await this.getStore();
    const results: { [extensionKey: string]: AnimeCardInfo[] } = {};
    const enabledExtensions = store.enabledExtensions;

    const searchPromises = enabledExtensions.map(
      async (ext: ExtensionMetadata) => {
        try {
          const animes = await this.searchAnime(ext.key, query);
          results[ext.key] = animes;
        } catch (error) {
          console.error(`Erreur lors de la recherche dans ${ext.name}:`, error);
          results[ext.key] = [];
        }
      }
    );

    await Promise.allSettled(searchPromises);
    return results;
  }

  /**
   * Retourne la liste des extensions disponibles
   */
  async getAvailableExtensions() {
    const store = await this.getStore();
    return store.availableExtensions;
  }

  /**
   * Active ou désactive une extension
   */
  async toggleExtension(
    extensionKey: string,
    enabled: boolean
  ): Promise<boolean> {
    const store = await this.getStore();
    return store.toggleExtension(extensionKey, enabled);
  }

  /**
   * Vérifie si une extension est disponible et activée
   */
  async isExtensionEnabled(extensionKey: string): Promise<boolean> {
    const store = await this.getStore();
    return store.isExtensionEnabled(extensionKey);
  }

  /**
   * Initialise toutes les extensions
   */
  async initializeExtensions(): Promise<void> {
    const store = await this.getStore();
    await store.initializeExtensions();
  }

  /**
   * Méthodes pour accéder facilement aux données du store
   */
  async getIsLoading(): Promise<boolean> {
    const store = await this.getStore();
    return store.isLoading;
  }

  async getError(): Promise<string | null> {
    const store = await this.getStore();
    return store.error;
  }

  async getIsInitialized(): Promise<boolean> {
    const store = await this.getStore();
    return store.initialized;
  }

  async getExtensionCount(): Promise<number> {
    const store = await this.getStore();
    return store.extensionCount;
  }
}

// Instance singleton
export const extensionManager = new ExtensionManager();
