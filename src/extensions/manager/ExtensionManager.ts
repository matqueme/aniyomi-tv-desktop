import type {
  AnimeExtension,
  ExtensionInfo,
  SearchResult,
  VideoSource,
} from '../types/extension';

import type { Episode, AnimeDetails } from '../../types/anime';

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
    console.log(`Extension registered: ${extension.info.name}`);
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
  async getPopularAnime(
    extensionId: string,
    page: number = 1
  ): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getPopularAnime(page);
  }

  async getLatestUpdates(
    extensionId: string,
    page: number = 1
  ): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getLatestUpdates(page);
  }

  async searchAnime(
    extensionId: string,
    query: string,
    page: number = 1
  ): Promise<SearchResult> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.searchAnime(query, page);
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

  async getEpisodes(extensionId: string, animeId: string): Promise<Episode[]> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getEpisodes(animeId);
  }

  async getVideoSources(
    extensionId: string,
    episodeId: string
  ): Promise<VideoSource[]> {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    if (!extension.info.isEnabled) {
      throw new Error(`Extension ${extensionId} is disabled`);
    }
    return extension.getVideoSources(episodeId);
  }
}

// Instance globale du gestionnaire
export const extensionManager = new ExtensionManager();
