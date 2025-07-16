import axios from 'axios';

export interface VideoSource {
  url: string;
  quality: string;
  headers?: Record<string, string>;
}

/**
 * Extracteur pour Sendvid
 * Basé sur l'implémentation Kotlin de aniyomi-extensions-fr
 */
export class SendvidExtractor {
  private name = 'Sendvid';
  private baseUrl = 'https://sendvid.com';

  /**
   * Effectue une requête HTTP avec support CORS
   */
  private async fetchWithCors(url: string): Promise<string> {
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

    try {
      const response = await axios.get(corsProxyUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        timeout: 10000, // 10 secondes de timeout
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `HTTP ${error.response?.status || 'unknown'}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Extrait les sources vidéo depuis une URL Sendvid
   * @param url URL de la page Sendvid (ex: https://sendvid.com/embed/dpqvmaau)
   * @param prefix Préfixe pour le nom de la vidéo
   * @returns Promise<VideoSource[]>
   */
  async extractVideoSources(
    url: string,
    prefix: string = ''
  ): Promise<VideoSource[]> {
    try {
      console.log(`[SendvidExtractor] Extraction depuis: ${url}`);

      // Récupérer le HTML de la page
      const html = await this.fetchWithCors(url);

      // Parser le HTML
      const parser = new DOMParser();
      const document = parser.parseFromString(html, 'text/html');

      // Chercher l'élément source#video_source comme dans l'extracteur Kotlin
      const sourceElement = document.querySelector('source#video_source');
      const masterUrl = sourceElement?.getAttribute('src');

      if (!masterUrl) {
        console.warn('[SendvidExtractor] Aucune source vidéo trouvée');
        return [];
      }

      console.log(`[SendvidExtractor] Source trouvée: ${masterUrl}`);

      // Créer les headers appropriés
      const urlObj = new URL(url);
      const origin = `${urlObj.protocol}//${urlObj.host}`;

      const headers = {
        Origin: origin,
        Referer: `${origin}/`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      };

      // Déterminer le type de source
      if (masterUrl.includes('.m3u8')) {
        // HLS Stream - pour l'instant on retourne juste l'URL principale
        return [
          {
            url: masterUrl,
            quality: `${prefix}Sendvid:HLS`,
            headers,
          },
        ];
      } else {
        // Vidéo directe
        return [
          {
            url: masterUrl,
            quality: `${prefix}Sendvid:default`,
            headers,
          },
        ];
      }
    } catch (error) {
      console.error("[SendvidExtractor] Erreur lors de l'extraction:", error);
      return [];
    }
  }

  /**
   * Vérifie si l'URL est supportée par cet extracteur
   */
  isSupported(url: string): boolean {
    return url.includes('sendvid.com');
  }

  get extractorName(): string {
    return this.name;
  }

  get extractorBaseUrl(): string {
    return this.baseUrl;
  }
}
