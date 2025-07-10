import type { AnimeCardInfo, AnimeDetails, Episode } from '@/types/anime';

/**
 * Paramètres de recherche pour les extensions
 */
export interface SearchParams {
  query: string;
  page?: number;
  filters?: Record<string, unknown>;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Métadonnées d'une extension
 */
export interface ExtensionMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  baseUrl: string;
  language: string;
  isNsfw: boolean;
  iconUrl?: string;
  supportsSearch: boolean;
  supportsLatest: boolean;
  supportsPopular: boolean;
}

/**
 * Classe de base pour toutes les extensions
 */
export abstract class BaseExtension {
  abstract readonly metadata: ExtensionMetadata;

  /**
   * Recherche d'animes
   */
  abstract searchAnime(
    params: SearchParams
  ): Promise<PaginatedResult<AnimeCardInfo>>;

  /**
   * Récupère les détails d'un anime
   */
  abstract getAnimeDetails(id: string): Promise<AnimeDetails>;

  /**
   * Récupère les épisodes d'un anime
   */
  abstract getEpisodes(animeId: string): Promise<Episode[]>;

  /**
   * Récupère les animes populaires
   */
  abstract getPopularAnime(
    page?: number
  ): Promise<PaginatedResult<AnimeCardInfo>>;

  /**
   * Récupère les dernières mises à jour
   */
  abstract getLatestUpdates(
    page?: number
  ): Promise<PaginatedResult<AnimeCardInfo>>;

  /**
   * Récupère l'URL de lecture d'un épisode
   */
  abstract getVideoUrl(episodeId: string): Promise<string>;

  /**
   * Utilitaires pour les extensions
   */
  protected parseHTML(html: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  protected async fetchWithCors(url: string): Promise<Response> {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const fullUrl = url.startsWith('http')
      ? url
      : `${this.metadata.baseUrl}${url}`;
    return fetch(`${corsProxy}${encodeURIComponent(fullUrl)}`);
  }

  protected extractText(doc: Document, selector: string): string | null {
    const element = doc.querySelector(selector);
    return element?.textContent?.trim() || null;
  }

  protected extractAttribute(
    doc: Document,
    selector: string,
    attribute: string
  ): string | null {
    const element = doc.querySelector(selector);
    return element?.getAttribute(attribute) || null;
  }

  protected extractElements(doc: Document, selector: string): Element[] {
    return Array.from(doc.querySelectorAll(selector));
  }
}
