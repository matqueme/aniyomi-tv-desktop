import {
  BaseExtension,
  type ExtensionMetadata,
  type SearchParams,
  type PaginatedResult,
} from '../base/BaseExtension';
import type { AnimeCardInfo, AnimeDetails, Episode } from '@/types/anime';

/**
 * Extension simplifiée pour AnimeSama
 */
export class AnimeSamaExtension extends BaseExtension {
  readonly metadata: ExtensionMetadata = {
    id: 'animesama',
    name: 'AnimeSama',
    version: '1.0.0',
    author: 'matqueme',
    description: 'Extension pour scraper AnimeSama',
    baseUrl: 'https://anime-sama.fr',
    language: 'fr',
    isNsfw: false,
    supportsSearch: true,
    supportsLatest: true,
    supportsPopular: true,
  };

  private readonly selectors = {
    POPULAR_ANIMES: '#containerPepites > div a',
    LATEST_UPDATES: '#containerAjoutsAnimes > div a',
    SEARCH_RESULTS: '#list_catalog > div a',
    ANIME_TITLE: '#titreOeuvre',
    ANIME_COVER: '#coverOeuvre',
    ANIME_DESCRIPTION: 'h2:contains("Synopsis") + p',
    EPISODES_LIST: '.episodes-list a',
  };

  /**
   * Recherche d'animes
   */
  async searchAnime(
    params: SearchParams
  ): Promise<PaginatedResult<AnimeCardInfo>> {
    const { query = '', page = 1 } = params;

    try {
      const searchUrl = query
        ? `/catalogue/search?q=${encodeURIComponent(query)}&page=${page}`
        : `/catalogue?page=${page}`;

      const response = await this.fetchWithCors(searchUrl);
      const html = await response.text();
      const doc = this.parseHTML(html);

      const animeElements = this.extractElements(
        doc,
        this.selectors.SEARCH_RESULTS
      );
      const animes: AnimeCardInfo[] = [];

      for (const element of animeElements) {
        const anime = this.parseAnimeCard(element);
        if (anime) {
          animes.push(anime);
        }
      }

      return {
        items: animes,
        currentPage: page,
        totalPages: 1,
        hasNextPage: animes.length >= 20,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return {
        items: [],
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  /**
   * Récupère les détails d'un anime
   */
  async getAnimeDetails(id: string): Promise<AnimeDetails> {
    try {
      const response = await this.fetchWithCors(`/catalogue/${id}`);
      const html = await response.text();
      const doc = this.parseHTML(html);

      const title =
        this.extractText(doc, this.selectors.ANIME_TITLE) || 'Titre inconnu';
      const posterUrl =
        this.extractAttribute(doc, this.selectors.ANIME_COVER, 'src') || '';
      const description =
        this.extractText(doc, this.selectors.ANIME_DESCRIPTION) || '';

      return {
        id,
        title,
        description,
        posterUrl,
        extension: this.metadata.id,
        seasons: [],
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      return {
        id,
        title: 'Erreur',
        description: 'Impossible de récupérer les détails',
        posterUrl: '',
        extension: this.metadata.id,
        seasons: [],
      };
    }
  }

  /**
   * Récupère les épisodes d'un anime
   */
  async getEpisodes(animeId: string): Promise<Episode[]> {
    try {
      const response = await this.fetchWithCors(`/catalogue/${animeId}`);
      const html = await response.text();
      const doc = this.parseHTML(html);

      const episodeElements = this.extractElements(
        doc,
        this.selectors.EPISODES_LIST
      );
      const episodes: Episode[] = [];

      for (let i = 0; i < episodeElements.length; i++) {
        const element = episodeElements[i];
        const episodeUrl = element.getAttribute('href');
        const episodeTitle = element.textContent?.trim();

        if (episodeUrl) {
          episodes.push({
            id: this.extractEpisodeId(episodeUrl),
            animeId,
            number: i + 1,
            title: episodeTitle || `Episode ${i + 1}`,
            videoUrl: episodeUrl,
          });
        }
      }

      return episodes;
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes:', error);
      return [];
    }
  }

  /**
   * Récupère les animes populaires
   */
  async getPopularAnime(page = 1): Promise<PaginatedResult<AnimeCardInfo>> {
    try {
      const response = await this.fetchWithCors('/');
      const html = await response.text();
      const doc = this.parseHTML(html);

      const animeElements = this.extractElements(
        doc,
        this.selectors.POPULAR_ANIMES
      );
      const animes: AnimeCardInfo[] = [];

      for (const element of animeElements) {
        const anime = this.parseAnimeCard(element);
        if (anime) {
          animes.push(anime);
        }
      }

      return {
        items: animes,
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des animes populaires:',
        error
      );
      return {
        items: [],
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  /**
   * Récupère les dernières mises à jour
   */
  async getLatestUpdates(page = 1): Promise<PaginatedResult<AnimeCardInfo>> {
    try {
      const response = await this.fetchWithCors('/');
      const html = await response.text();
      const doc = this.parseHTML(html);

      const animeElements = this.extractElements(
        doc,
        this.selectors.LATEST_UPDATES
      );
      const animes: AnimeCardInfo[] = [];

      for (const element of animeElements) {
        const anime = this.parseAnimeCard(element);
        if (anime) {
          animes.push(anime);
        }
      }

      return {
        items: animes,
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des dernières mises à jour:',
        error
      );
      return {
        items: [],
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  /**
   * Récupère l'URL de lecture d'un épisode
   */
  async getVideoUrl(episodeId: string): Promise<string> {
    try {
      const response = await this.fetchWithCors(`/episode/${episodeId}`);
      const html = await response.text();
      const doc = this.parseHTML(html);

      // Extraction basique de l'URL vidéo
      const videoElement = doc.querySelector('video source');
      return videoElement?.getAttribute('src') || '';
    } catch (error) {
      console.error("Erreur lors de la récupération de l'URL vidéo:", error);
      return '';
    }
  }

  /**
   * Parse une carte d'anime depuis un élément DOM
   */
  private parseAnimeCard(element: Element): AnimeCardInfo | null {
    const title = element.textContent?.trim();
    const href = element.getAttribute('href');
    const img = element.querySelector('img');
    const posterUrl = img?.getAttribute('src') || '';

    if (!title || !href) {
      return null;
    }

    return {
      id: this.extractAnimeId(href),
      title,
      posterUrl,
      extension: this.metadata.id,
    };
  }

  /**
   * Extrait l'ID d'un anime depuis son URL
   */
  private extractAnimeId(url: string): string {
    const match = url.match(/\/catalogue\/([^/]+)/);
    return match ? match[1] : url;
  }

  /**
   * Extrait l'ID d'un épisode depuis son URL
   */
  private extractEpisodeId(url: string): string {
    const match = url.match(/\/episode\/([^/]+)/);
    return match ? match[1] : url;
  }
}
