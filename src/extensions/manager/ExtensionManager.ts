import type {
  AnimeExtension,
  ExtensionInfo,
  SearchResult,
} from '../../types/extension';

import type { AnimeDetails } from '../../types/anime';

/**
 * Gestionnaire central des extensions
 */
export class ExtensionManager {
  private extensions = new Map<string, AnimeExtension>();

  /**
   * Enregistre une extension
   */
  registerExtension(extension: AnimeExtension): void {
    this.extensions.set(extension.info.id, extension);
  }

  /**
   * Récupère une extension par son ID
   */
  getExtension(id: string): AnimeExtension | undefined {
    return this.extensions.get(id);
  }

  /**
   * Récupère toutes les extensions
   */
  getAllExtensions(): ExtensionInfo[] {
    return Array.from(this.extensions.values()).map((ext) => ext.info);
  }

  /**
   * Récupère les extensions actives
   */
  getEnabledExtensions(): ExtensionInfo[] {
    return this.getAllExtensions().filter((ext) => ext.isEnabled);
  }

  /**
   * Active/désactive une extension
   */
  toggleExtension(id: string): void {
    const extension = this.extensions.get(id);
    if (extension) {
      extension.info.isEnabled = !extension.info.isEnabled;
    }
  }

  /**
   * Méthodes de convenance pour accéder aux fonctionnalités des extensions
   */
  async getPopularAnime(extensionId: string): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getPopularAnime();
  }

  async getLatestUpdates(extensionId: string): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getLatestUpdates();
  }

  async searchAnime(extensionId: string, query: string): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.searchAnime(query);
  }

  async getAnimeDetails(
    extensionId: string,
    animeId: string
  ): Promise<AnimeDetails> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getAnimeDetails(animeId);
  }
}

// Instance globale du gestionnaire
export const extensionManager = new ExtensionManager();
