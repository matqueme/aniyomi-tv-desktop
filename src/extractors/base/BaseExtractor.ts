export interface VideoSource {
  url: string;
  quality: string;
  headers?: Record<string, string>;
}

/**
 * Classe de base pour tous les extracteurs vidéo
 */
export abstract class BaseExtractor {
  protected name: string;
  protected baseUrl: string;

  constructor(name: string, baseUrl: string) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  /**
   * Effectue une requête HTTP avec support CORS
   * Utilise un proxy CORS pour contourner les restrictions
   */
  protected async fetchWithCors(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    // Pour le développement, on utilise un proxy CORS
    // En production, il faudrait configurer un proxy backend approprié
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      ...options,
    };

    try {
      console.log(`[${this.name}] Requête vers: ${corsProxyUrl}`);
      const response = await fetch(corsProxyUrl, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`[${this.name}] Erreur de requête:`, error);
      throw error;
    }
  }

  /**
   * Nettoie une URL (supprime les paramètres inutiles, normalise le format)
   */
  protected cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Supprimer les paramètres de tracking communs
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Extrait l'ID depuis une URL
   */
  protected extractId(url: string, pattern: RegExp): string | null {
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  // Méthodes abstraites à implémenter dans les classes filles
  abstract extractVideoSources(
    url: string,
    prefix?: string
  ): Promise<VideoSource[]>;
  abstract isSupported(url: string): boolean;

  // Getters
  get extractorName(): string {
    return this.name;
  }

  get extractorBaseUrl(): string {
    return this.baseUrl;
  }
}
