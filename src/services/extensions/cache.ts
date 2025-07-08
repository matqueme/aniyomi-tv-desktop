/**
 * Système de cache simple pour les extensions
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache en mémoire avec TTL (Time To Live)
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTTL: number;
  private hits = 0;
  private misses = 0;

  constructor(maxEntries: number = 1000, defaultTTL: number = 3600000) {
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Nettoyer les entrées expirées si le cache est plein
    if (this.cache.size >= this.maxEntries) {
      this.cleanup();
    }

    // Si encore plein après le nettoyage, supprimer la plus ancienne
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): {
    size: number;
    maxEntries: number;
    hitRate: number;
    memory: number;
    hits: number;
    misses: number;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hitRate: total > 0 ? this.hits / total : 0,
      memory: this.estimateMemoryUsage(),
      hits: this.hits,
      misses: this.misses,
    };
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // String is UTF-16
      size += JSON.stringify(entry.data).length * 2;
      size += 24; // Overhead for timestamp, ttl, etc.
    }
    return size;
  }
}

import type {
  AnimeSamaAnime,
  AnimeSamaEpisode,
  AnimeSamaVideo,
  AnimeSamaPage,
} from '@/types/animesama';

/**
 * Gestionnaire de cache pour les extensions
 */
export class ExtensionCache {
  private cache = new MemoryCache();
  private readonly CACHE_KEYS = {
    ANIME_INFO: 'anime_info',
    SEARCH_RESULTS: 'search_results',
    EPISODES: 'episodes',
    POPULAR_ANIMES: 'popular_animes',
    LATEST_UPDATES: 'latest_updates',
    VIDEO_LINKS: 'video_links',
  } as const;

  /**
   * Génère une clé de cache
   */
  private generateKey(type: string, ...params: string[]): string {
    return `${type}:${params.join(':')}`;
  }

  /**
   * Cache les informations d'un anime
   */
  cacheAnimeInfo(url: string, data: AnimeSamaAnime, ttl?: number): void {
    const key = this.generateKey(this.CACHE_KEYS.ANIME_INFO, url);
    this.cache.set(key, data, ttl);
  }

  /**
   * Récupère les informations d'un anime depuis le cache
   */
  getAnimeInfo(url: string): AnimeSamaAnime | null {
    const key = this.generateKey(this.CACHE_KEYS.ANIME_INFO, url);
    return this.cache.get<AnimeSamaAnime>(key);
  }

  /**
   * Cache les résultats de recherche
   */
  cacheSearchResults(
    query: string,
    page: number,
    data: AnimeSamaPage<AnimeSamaAnime>,
    ttl?: number
  ): void {
    const key = this.generateKey(
      this.CACHE_KEYS.SEARCH_RESULTS,
      query,
      page.toString()
    );
    this.cache.set(key, data, ttl);
  }

  /**
   * Récupère les résultats de recherche depuis le cache
   */
  getSearchResults(
    query: string,
    page: number
  ): AnimeSamaPage<AnimeSamaAnime> | null {
    const key = this.generateKey(
      this.CACHE_KEYS.SEARCH_RESULTS,
      query,
      page.toString()
    );
    return this.cache.get<AnimeSamaPage<AnimeSamaAnime>>(key);
  }

  /**
   * Cache les épisodes d'un anime
   */
  cacheEpisodes(
    animeUrl: string,
    data: AnimeSamaEpisode[],
    ttl?: number
  ): void {
    const key = this.generateKey(this.CACHE_KEYS.EPISODES, animeUrl);
    this.cache.set(key, data, ttl);
  }

  /**
   * Récupère les épisodes depuis le cache
   */
  getEpisodes(animeUrl: string): AnimeSamaEpisode[] | null {
    const key = this.generateKey(this.CACHE_KEYS.EPISODES, animeUrl);
    return this.cache.get<AnimeSamaEpisode[]>(key);
  }

  /**
   * Cache les animes populaires
   */
  cachePopularAnimes(
    page: number,
    data: AnimeSamaPage<AnimeSamaAnime>,
    ttl?: number
  ): void {
    const key = this.generateKey(
      this.CACHE_KEYS.POPULAR_ANIMES,
      page.toString()
    );
    this.cache.set(key, data, ttl);
  }

  /**
   * Récupère les animes populaires depuis le cache
   */
  getPopularAnimes(page: number): AnimeSamaPage<AnimeSamaAnime> | null {
    const key = this.generateKey(
      this.CACHE_KEYS.POPULAR_ANIMES,
      page.toString()
    );
    return this.cache.get<AnimeSamaPage<AnimeSamaAnime>>(key);
  }

  /**
   * Cache les dernières mises à jour
   */
  cacheLatestUpdates(data: AnimeSamaPage<AnimeSamaAnime>, ttl?: number): void {
    const key = this.generateKey(this.CACHE_KEYS.LATEST_UPDATES);
    this.cache.set(key, data, ttl);
  }

  /**
   * Récupère les dernières mises à jour depuis le cache
   */
  getLatestUpdates(): AnimeSamaPage<AnimeSamaAnime> | null {
    const key = this.generateKey(this.CACHE_KEYS.LATEST_UPDATES);
    return this.cache.get<AnimeSamaPage<AnimeSamaAnime>>(key);
  }

  /**
   * Cache les liens vidéo
   */
  cacheVideoLinks(
    episodeId: string,
    data: AnimeSamaVideo[],
    ttl?: number
  ): void {
    const key = this.generateKey(this.CACHE_KEYS.VIDEO_LINKS, episodeId);
    this.cache.set(key, data, ttl || 300000); // 5 minutes par défaut pour les liens vidéo
  }

  /**
   * Récupère les liens vidéo depuis le cache
   */
  getVideoLinks(episodeId: string): AnimeSamaVideo[] | null {
    const key = this.generateKey(this.CACHE_KEYS.VIDEO_LINKS, episodeId);
    return this.cache.get<AnimeSamaVideo[]>(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    this.cache.cleanup();
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): ReturnType<MemoryCache['getStats']> {
    return this.cache.getStats();
  }

  /**
   * Invalide le cache pour un anime spécifique
   */
  invalidateAnime(animeUrl: string): void {
    const patterns = [
      this.generateKey(this.CACHE_KEYS.ANIME_INFO, animeUrl),
      this.generateKey(this.CACHE_KEYS.EPISODES, animeUrl),
    ];

    patterns.forEach((pattern) => {
      this.cache.delete(pattern);
    });
  }

  /**
   * Invalide le cache de recherche
   */
  invalidateSearch(query?: string): void {
    if (query) {
      // Invalider seulement cette recherche spécifique
      for (let page = 1; page <= 10; page++) {
        const key = this.generateKey(
          this.CACHE_KEYS.SEARCH_RESULTS,
          query,
          page.toString()
        );
        this.cache.delete(key);
      }
    } else {
      // Invalider tout le cache de recherche
      this.cache.clear();
    }
  }

  /**
   * Méthodes publiques pour accéder au cache interne
   */
  getCacheEntry<T>(key: string): T | null {
    return this.cache.get<T>(key);
  }

  setCacheEntry<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl);
  }
}

// Instance singleton du cache
export const extensionCache = new ExtensionCache();

/**
 * Décorateur pour mettre en cache les résultats de méthodes
 */
export function cached(ttl?: number) {
  return function (
    target: Record<string, unknown>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      // Vérifier le cache
      const cached = extensionCache.getCacheEntry(cacheKey);
      if (cached) {
        return cached;
      }

      // Exécuter la méthode originale
      const result = await originalMethod.apply(this, args);

      // Mettre en cache le résultat
      extensionCache.setCacheEntry(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}
