import type { AnimeCardInfo, AnimeDetails, Episode } from './anime';

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  language: string;
  isEnabled: boolean;
}

export interface SearchResult {
  items: AnimeCardInfo[];
  hasNextPage: boolean;
  currentPage: number;
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
  abstract getPopularAnime(page: number): Promise<SearchResult>;

  /**
   * Récupère les dernières mises à jour
   */
  abstract getLatestUpdates(page: number): Promise<SearchResult>;

  /**
   * Recherche des animes
   */
  abstract searchAnime(query: string, page: number): Promise<SearchResult>;

  /**
   * Récupère les détails d'un anime
   */
  abstract getAnimeDetails(id: string): Promise<AnimeDetails>;

  /**
   * Récupère les épisodes d'un anime
   */
  abstract getEpisodes(animeId: string): Promise<Episode[]>;

  /**
   * Récupère les sources vidéo d'un épisode
   */
  abstract getVideoSources(episodeId: string): Promise<VideoSource[]>;
}
