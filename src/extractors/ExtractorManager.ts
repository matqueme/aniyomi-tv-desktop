import { SendvidExtractor, type VideoSource } from './sendvid/SendvidExtractor';

// Interface pour les extracteurs
interface VideoExtractor {
  extractVideoSources(url: string, prefix?: string): Promise<VideoSource[]>;
  isSupported(url: string): boolean;
  extractorName?: string;
  extractorBaseUrl?: string;
}

/**
 * Gestionnaire central pour tous les extracteurs vidéo
 */
export class ExtractorManager {
  private extractors: Map<string, VideoExtractor>;

  constructor() {
    this.extractors = new Map();
    this.initializeExtractors();
  }

  /**
   * Initialise tous les extracteurs disponibles
   */
  private initializeExtractors(): void {
    // Ajouter l'extracteur Sendvid
    const sendvidExtractor = new SendvidExtractor();
    this.extractors.set('sendvid', sendvidExtractor);

    console.log(
      '[ExtractorManager] Extracteurs initialisés:',
      Array.from(this.extractors.keys())
    );
  }

  /**
   * Trouve l'extracteur approprié pour une URL donnée
   */
  findExtractor(url: string): VideoExtractor | null {
    for (const [name, extractor] of this.extractors) {
      if (extractor.isSupported(url)) {
        console.log(
          `[ExtractorManager] Extracteur trouvé: ${name} pour ${url}`
        );
        return extractor;
      }
    }
    console.warn(`[ExtractorManager] Aucun extracteur trouvé pour: ${url}`);
    return null;
  }

  /**
   * Extrait les sources vidéo depuis une URL
   */
  async extractFromUrl(
    url: string,
    prefix: string = ''
  ): Promise<VideoSource[]> {
    const extractor = this.findExtractor(url);

    if (!extractor) {
      throw new Error(`Aucun extracteur supporté pour l'URL: ${url}`);
    }

    try {
      const sources = await extractor.extractVideoSources(url, prefix);
      console.log(
        `[ExtractorManager] ${sources.length} source(s) extraite(s) depuis ${url}`
      );
      return sources;
    } catch (error) {
      console.error("[ExtractorManager] Erreur lors de l'extraction:", error);
      throw error;
    }
  }

  /**
   * Liste tous les extracteurs disponibles
   */
  getAvailableExtractors(): string[] {
    return Array.from(this.extractors.keys());
  }

  /**
   * Vérifie si une URL est supportée par au moins un extracteur
   */
  isUrlSupported(url: string): boolean {
    return this.findExtractor(url) !== null;
  }
}

// Instance singleton
export const extractorManager = new ExtractorManager();
