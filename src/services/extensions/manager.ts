import type { Episode, Anime } from '@/types/anime';

/**
 * Interface pour les services d'extension
 */
interface ExtensionService {
  getEpisodes(animeName: string, season: string): Promise<Episode[]>;
  searchAnime(query: string): Promise<Partial<Anime>[]>;
}

/**
 * Service de gestion des extensions
 */
export class ExtensionManager {
  private services: Map<string, ExtensionService> = new Map();

  constructor() {
    // Enregistrer les services d'extension disponibles
    // Note: AnimeSamaService devra implémenter l'interface ExtensionService
    // Pour l'instant, on utilise un wrapper
    this.services.set('animesama', {
      getEpisodes: async (animeName: string, season: string) =>
        this.getMockEpisodes(animeName, season),
      searchAnime: async () => [],
    });
  }

  /**
   * Récupère les épisodes d'un anime depuis une extension
   */
  async getEpisodes(
    extension: string,
    animeName: string,
    season: string
  ): Promise<Episode[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    try {
      return await service.getEpisodes(animeName, season);
    } catch (error) {
      console.error(`Erreur lors de la récupération des épisodes:`, error);

      // En cas d'erreur, retourner des épisodes mockés
      return this.getMockEpisodes(animeName, season);
    }
  }

  /**
   * Recherche des animes dans une extension
   */
  async searchAnime(
    extension: string,
    query: string
  ): Promise<Partial<Anime>[]> {
    const service = this.services.get(extension);
    if (!service) {
      throw new Error(`Extension '${extension}' non trouvée`);
    }

    return await service.searchAnime(query);
  }

  /**
   * Retourne la liste des extensions disponibles
   */
  getAvailableExtensions(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Génère des épisodes mockés pour les tests
   */
  private getMockEpisodes(animeName: string, season: string): Episode[] {
    const episodeCount = parseInt(season) === 1 ? 25 : 20;

    return Array.from({ length: episodeCount }, (_, i) => ({
      id: `${animeName}-s${season}-e${i + 1}`,
      animeId: animeName,
      number: i + 1,
      title: `Episode ${i + 1}`,
      description: `Description de l'épisode ${i + 1} de ${decodeURIComponent(animeName).replace(/[-_]/g, ' ')}`,
      thumbnailUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop&crop=center&auto=format&q=80&seed=${i}`,
      videoUrl: '#', // À remplacer par l'URL réelle
      duration: '24:00',
      airDate: new Date(2024, 0, i + 1),
    }));
  }
}

// Instance singleton
export const extensionManager = new ExtensionManager();
