import type { AnimeCardInfo, AnimeDetails } from './anime';

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  language: string;
  isEnabled: boolean;
  voices?: string[]; // ex: ['VOSTFR', 'VF']
}

export interface SearchResult {
  items: AnimeCardInfo[];
}

export interface VideoSource {
  url: string;
  quality: string;
  isM3U8?: boolean;
}

/**
 * Interface de base pour toutes les extensions
 */
export abstract class AnimeExtension {
  abstract readonly info: ExtensionInfo;

  /**
   * Récupère les animes populaires
   */
  abstract getPopularAnime(): Promise<SearchResult>;

  /**
   * Récupère les dernières mises à jour
   */
  abstract getLatestUpdates(): Promise<SearchResult>;

  /**
   * Recherche des animes
   */
  abstract searchAnime(query: string): Promise<SearchResult>;

  /**
   * Récupère les détails d'un anime
   */
  abstract getAnimeDetails(id: string): Promise<AnimeDetails>;
}
