/**
 * Gestionnaire de cache simple pour les extensions
 */
class ExtensionCache {
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  /**
   * Génère une clé de cache
   */
  generateKey(
    extensionId: string,
    method: string,
    params: Record<string, unknown>
  ): string {
    const paramsString = JSON.stringify(params);
    return `${extensionId}:${method}:${paramsString}`;
  }

  /**
   * Récupère une valeur du cache ou l'exécute si elle n'existe pas
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: now, ttl });
    return data;
  }

  /**
   * Nettoie le cache expiré
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Instance singleton
export const extensionCache = new ExtensionCache();

// Nettoyage automatique toutes les 10 minutes
setInterval(
  () => {
    extensionCache.cleanup();
  },
  10 * 60 * 1000
);
