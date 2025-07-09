import type {
  AnimeSamaAnime,
  AnimeSamaEpisode,
  AnimeSamaVideo,
  AnimeSamaSearchParams,
  AnimeSamaPage,
} from '@/types/animesama';
import { extensionCache } from './cache';
import { parseHTML } from '@/utils/htmlUtils';

/**
 * Configuration du service AnimeSama
 */
const ANIMESAMA_CONFIG = {
  BASE_URL: 'https://anime-sama.fr',
  CORS_PROXY: 'https://api.allorigins.win/raw?url=',
  SELECTORS: {
    POPULAR_ANIMES: '#containerPepites > div a',
    LATEST_UPDATES: '#containerAjoutsAnimes > div',
    SEARCH_RESULTS: '#list_catalog > div a',
    PAGINATION: '#list_pagination a',
    ANIME_TITLE: '#titreOeuvre',
    ANIME_COVER: '#coverOeuvre',
  },
  VOICES: ['vostfr', 'vf'] as const,
  VOICE_PREFERENCE: 'vostfr',
  QUALITY_PRIORITIES: ['1080', '720', '480', '360'] as const,
  ITEMS_PER_PAGE: 6,
  PLAYER_TYPES: {
    SIBNET: 'sibnet.ru',
    VK: 'vk.com',
    SENDVID: 'sendvid.com',
    VIDMOLY: 'vidmoly.to',
  },
  CACHE_TTL: {
    ANIME_INFO: 3600000, // 1 heure
    SEARCH: 1800000, // 30 minutes
    EPISODES: 7200000, // 2 heures
    POPULAR: 1800000, // 30 minutes
    LATEST: 600000, // 10 minutes
    VIDEOS: 300000, // 5 minutes
  },
} as const;

/**
 * Service pour scraper AnimeSama.fr
 */
export class AnimeSamaService {
  private readonly baseUrl = ANIMESAMA_CONFIG.BASE_URL;
  private readonly corsProxy = ANIMESAMA_CONFIG.CORS_PROXY;

  /**
   * Helper pour faire des requêtes avec gestion CORS et retry
   * @param url L'URL à récupérer
   * @return Le contenu de la page HTML
   */
  private async fetchWithCors(url: string): Promise<string> {
    console.log(`Tentative de récupération: ${url}`);

    // try {
    //   // Essayer d'abord sans proxy (peut marcher en production)
    //   const response = await fetch(url, {
    //     headers: {
    //       'User-Agent':
    //         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    //       Accept:
    //         'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //       'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    //     },
    //   });

    //   if (response.ok) {
    //     const content = await response.text();
    //     console.log(
    //       `Récupération directe réussie (${content.length} caractères)`
    //     );
    //     if (content && content.trim().length > 0) {
    //       return content;
    //     }
    //     console.warn('Contenu vide reçu en direct, tentative avec proxy...');
    //   } else {
    //     console.log(
    //       `Requête directe échouée: ${response.status} ${response.statusText}`
    //     );
    //   }
    // } catch (error) {
    //   console.log(
    //     'Erreur requête directe, tentative avec proxy CORS...',
    //     error
    //   );
    // }

    try {
      const proxiedUrl = this.corsProxy + encodeURIComponent(url);
      const response = await fetch(proxiedUrl, {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();

      if (!content || content.trim().length === 0) {
        throw new Error('Contenu vide reçu via proxy CORS');
      }

      return content;
    } catch (proxyError) {
      console.error('Erreur avec proxy CORS:', proxyError);
      throw new Error(
        `Échec de récupération pour ${url}: ${proxyError instanceof Error ? proxyError.message : String(proxyError)}`
      );
    }
  }

  /**
   * Utilitaire pour attendre
   * @param ms Durée en millisecondes
   * @return Une promesse qui se résout après le délai
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Divise un tableau en chunks de taille donnée
   * @param array Le tableau à diviser
   * @param size La taille de chaque chunk
   * @return Un tableau de chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Nettoie et valide une URL
   * @param href L'URL à valider
   * @param baseUrl URL de base pour les chemins relatifs
   * @return L'URL nettoyée ou null si invalide
   */
  private validateAndCleanUrl(href: string, baseUrl?: string): string | null {
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) return (baseUrl || this.baseUrl) + href;
    return null;
  }

  /**
   * Récupère les animes populaires depuis la page d'accueil
   */
  async getPopularAnimes(page: number = 1): Promise<{ data: AnimeCardInfo[] }> {
    try {
      // Vérifier le cache
      const cached = extensionCache.getPopularAnimes(page);
      if (cached) {
        return cached;
      }

      const htmlContent = await this.fetchWithCors(this.baseUrl);
      const doc = parseHTML(htmlContent);

      const pepitesLinks = doc.querySelectorAll(
        ANIMESAMA_CONFIG.SELECTORS.POPULAR_ANIMES
      );
      const chunks = this.chunkArray(
        Array.from(pepitesLinks),
        ANIMESAMA_CONFIG.ITEMS_PER_PAGE
      );
      const currentChunk = chunks[page - 1];

      if (!currentChunk) {
        return { data: [] };
      }

      const animes: AnimeCardInfo[] = [];
      const promises = currentChunk.map(async (link) => {
        const href = link.getAttribute('href');
        if (href) {
          const cleanUrl = this.validateAndCleanUrl(href);
          if (cleanUrl) {
            const animeInfo = await this.fetchAnimeInfo(cleanUrl);
            if (animeInfo) {
              console.log(animeInfo);
              return {
                id: animeInfo.url,
                title: animeInfo.title,
                posterUrl: animeInfo.thumbnailUrl || '',
                extension: 'animesama',
              } as AnimeCardInfo;
            }
          }
        }
        return null;
      });

      const results = await Promise.allSettled(promises);
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          animes.push(result.value);
        }
      });

      const result = {
        data: animes,
      };

      // Mettre en cache
      extensionCache.cachePopularAnimes(
        page,
        result,
        ANIMESAMA_CONFIG.CACHE_TTL.POPULAR
      );

      return result;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des animes populaires:',
        error
      );
      return { data: [] };
    }
  }

  /**
   * Récupère les dernières mises à jour
   */
  async getLatestUpdates(): Promise<{
    data: AnimeCardInfo[];
  }> {
    try {
      // Vérifier le cache
      const cached = extensionCache.getLatestUpdates();
      if (cached) {
        return cached;
      }

      const htmlContent = await this.fetchWithCors(this.baseUrl);
      const doc = parseHTML(htmlContent);

      const updateElements = doc.querySelectorAll(
        ANIMESAMA_CONFIG.SELECTORS.LATEST_UPDATES
      );
      const animes: AnimeCardInfo[] = [];
      const seenUrls = new Set<string>();

      const promises = Array.from(updateElements).map(async (element) => {
        const link = element.querySelector('a');
        if (!link) return null;

        const href = link.getAttribute('href');
        if (href) {
          const cleanUrl = this.validateAndCleanUrl(href);
          if (!cleanUrl) return null;

          // Nettoyer l'URL comme dans le code Kotlin
          try {
            const url = new URL(cleanUrl);
            const pathSegments = url.pathname
              .split('/')
              .filter((segment) => segment);

            if (pathSegments.length >= 2) {
              pathSegments.pop(); // Retirer les 2 derniers segments
              pathSegments.pop();
              const cleanedUrl = `${url.origin}/${pathSegments.join('/')}/`;

              if (!seenUrls.has(cleanedUrl)) {
                seenUrls.add(cleanedUrl);
                const animeInfo = await this.fetchAnimeInfo(cleanedUrl);
                if (animeInfo) {
                  return {
                    id: animeInfo.url,
                    title: animeInfo.title,
                    posterUrl: animeInfo.thumbnailUrl || '',
                    extension: 'animesama',
                  } as AnimeCardInfo;
                }
              }
            }
          } catch (error) {
            console.warn("Erreur lors du nettoyage de l'URL:", cleanUrl, error);
          }
        }

        return null;
      });

      const results = await Promise.allSettled(promises);
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          animes.push(result.value);
        }
      });

      const result = {
        data: animes,
      };

      // Mettre en cache
      extensionCache.cacheLatestUpdates(
        result,
        ANIMESAMA_CONFIG.CACHE_TTL.LATEST
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières MAJ:', error);
      return { data: [] };
    }
  }

  /**
   * Recherche d'animes avec filtres améliorés
   */
  async searchAnimes(
    params: AnimeSamaSearchParams
  ): Promise<AnimeSamaPage<AnimeSamaAnime>> {
    try {
      const {
        query = '',
        types = [],
        languages = [],
        genres = [],
        page = 1,
      } = params;

      // Vérifier le cache
      const cached = extensionCache.getSearchResults(query, page);
      if (cached) {
        return cached;
      }

      // Construire l'URL de recherche
      const searchUrl = new URL(`${this.baseUrl}/catalogue/`);

      // Ajouter les paramètres de recherche
      types.forEach((type) => searchUrl.searchParams.append('type[]', type));
      languages.forEach((lang) =>
        searchUrl.searchParams.append('langue[]', lang)
      );
      genres.forEach((genre) =>
        searchUrl.searchParams.append('genre[]', genre)
      );

      if (query.trim()) {
        searchUrl.searchParams.append('search', query.trim());
      }

      searchUrl.searchParams.append('page', page.toString());

      const htmlContent = await this.fetchWithCors(searchUrl.toString());
      const doc = parseHTML(htmlContent);

      // Récupérer les liens des animes
      const animeLinks = doc.querySelectorAll(
        ANIMESAMA_CONFIG.SELECTORS.SEARCH_RESULTS
      );

      // Traitement parallèle des animes
      const promises = Array.from(animeLinks).map(async (link) => {
        const href = link.getAttribute('href');
        if (href) {
          const cleanUrl = this.validateAndCleanUrl(href);
          if (cleanUrl) {
            return await this.fetchAnimeInfo(cleanUrl);
          }
        }
        return null;
      });

      const results = await Promise.allSettled(promises);
      const animes: AnimeSamaAnime[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          animes.push(result.value);
        }
      });

      const result = {
        data: animes,
      };

      // Mettre en cache
      extensionCache.cacheSearchResults(
        query,
        page,
        result,
        ANIMESAMA_CONFIG.CACHE_TTL.SEARCH
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return { data: [] };
    }
  }
  /**
   * Récupère les détails complets d'un anime
   */
  async getAnimeDetails(animeNameSlug: string): Promise<AnimeSamaAnime | null> {
    try {
      // Normaliser l'URL pour AnimeSama
      const url = `${this.baseUrl}/catalogue/${animeNameSlug}`;

      // Vérifier le cache pour les détails complets
      const cached = extensionCache.getAnimeInfo(url);
      if (cached && cached.initialized) {
        return cached;
      }

      const htmlContent = await this.fetchWithCors(url);
      const doc = parseHTML(htmlContent);

      const titleElement = doc.getElementById('titreOeuvre');
      const coverElement = doc.getElementById('coverOeuvre');

      const animeName = titleElement?.textContent?.trim() || '';
      const thumbnailUrl = coverElement?.getAttribute('src') || '';

      if (!animeName) {
        console.warn("Nom d'anime manquant pour l'URL:", animeName);
        return null;
      }

      // Extraire le synopsis et les genres de façon plus robuste
      const { description, genre } = this.extractAnimeMetadata(doc);

      // Déterminer le statut de l'anime
      const normalizedUrl = url;

      const animeDetails: AnimeSamaAnime = {
        title: animeName,
        url: normalizedUrl,
        thumbnailUrl: thumbnailUrl
          ? this.validateAndCleanUrl(thumbnailUrl) || ''
          : '',
        description: description || 'Aucune description disponible',
        genre: genre || '',
        initialized: true,
      };

      // Mettre en cache avec les détails complets
      extensionCache.cacheAnimeInfo(
        normalizedUrl,
        animeDetails,
        ANIMESAMA_CONFIG.CACHE_TTL.ANIME_INFO
      );

      return animeDetails;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails anime:', error);
      return null;
    }
  }

  /**
   * Récupère les saisons/films d'un anime
   */
  async getAnimeSeasons(url: string): Promise<AnimeSamaAnime[]> {
    return this.fetchAnimeSeasons(url);
  }

  /**
   * Récupère la liste des épisodes pour un anime
   */
  async getEpisodeList(animeName: string): Promise<AnimeSamaEpisode[]> {
    try {
      const url = this.baseUrl + '/catalogue/' + animeName;

      // Vérifier le cache
      const cached = extensionCache.getEpisodes(url);
      if (cached) {
        return cached;
      }

      // Valider et nettoyer l'URL
      if (!url || url.trim().length === 0) {
        throw new Error("URL d'anime vide ou invalide");
      }

      // D'abord, récupérer les saisons pour obtenir les bonnes URLs
      let seasons: AnimeSamaAnime[];

      if (url.includes('#')) {
        // Si c'est un film avec index, récupérer les saisons depuis l'URL de base
        const baseUrl = url.split('#')[0];
        seasons = await this.fetchAnimeSeasons(baseUrl);
      } else {
        // Pour une série normale, récupérer les saisons
        seasons = await this.fetchAnimeSeasons(url);
      }

      if (seasons.length === 0) {
        console.warn('Aucune saison trouvée pour cet anime');
        return [];
      }

      // Utiliser la première saison pour récupérer les épisodes
      const firstSeason = seasons[0];
      const seasonUrl = firstSeason.url;

      // Maintenant récupérer les épisodes selon la logique Kotlin
      let baseAnimeUrl: string;
      let movieIndex: number | null = null;

      if (seasonUrl.includes('#')) {
        const movieMatch = seasonUrl.split('#');
        const cleanUrl = movieMatch[0];
        movieIndex = parseInt(movieMatch[1]);

        if (isNaN(movieIndex)) {
          console.warn(
            'Index de film invalide, traitement comme série normale'
          );
          movieIndex = null;
        }

        // Pour les films, l'URL de base est sans le dernier segment
        baseAnimeUrl = cleanUrl.substring(0, cleanUrl.lastIndexOf('/'));
      } else {
        // Pour les séries, l'URL de base est l'URL de la saison sans la voix
        baseAnimeUrl = seasonUrl.replace(/\/(vostfr|vf)$/, '');
      }

      // S'assurer que l'URL commence par le domaine
      if (!baseAnimeUrl.startsWith('http')) {
        baseAnimeUrl = `${this.baseUrl}${baseAnimeUrl}`;
      }

      // Récupérer les players pour chaque voix en parallèle
      const playerPromises = ANIMESAMA_CONFIG.VOICES.map(async (voice) => {
        try {
          // Construire l'URL correctement selon la structure d'AnimeSama
          let voiceUrl: string;
          if (
            baseAnimeUrl.includes('/vostfr') ||
            baseAnimeUrl.includes('/vf')
          ) {
            // Si l'URL contient déjà une voix, la remplacer
            voiceUrl = baseAnimeUrl.replace(/\/(vostfr|vf)$/, `/${voice}`);
          } else {
            // Sinon, ajouter la voix
            voiceUrl = `${baseAnimeUrl}/${voice}`;
          }
          console.log(`Récupération des players pour ${voice}: ${voiceUrl}`);
          return await this.fetchPlayers(voiceUrl);
        } catch (error) {
          console.warn(
            `Erreur lors de la récupération des players pour ${voice}:`,
            error
          );
          return [];
        }
      });

      const allPlayers = await Promise.allSettled(playerPromises);
      const playersData = allPlayers.map((result) =>
        result.status === 'fulfilled' ? result.value : []
      );

      const episodes = this.playersToEpisodes(playersData);

      let result: AnimeSamaEpisode[];

      // Si c'est un film, retourner seulement l'épisode spécifique
      if (movieIndex !== null) {
        if (episodes[movieIndex]) {
          result = [episodes[movieIndex]];
        } else {
          console.warn(
            `Film à l'index ${movieIndex} non trouvé, ${episodes.length} épisodes disponibles`
          );
          result = episodes.length > 0 ? [episodes[0]] : [];
        }
      } else {
        // Retourner tous les épisodes dans l'ordre inverse (comme dans Kotlin)
        result = episodes.reverse();
      }

      // Mettre en cache
      extensionCache.cacheEpisodes(
        url,
        result,
        ANIMESAMA_CONFIG.CACHE_TTL.EPISODES
      );

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes:', error);
      return [];
    }
  }

  /**
   * Récupère les liens vidéo pour un épisode avec gestion des erreurs
   */
  async getVideoList(episode: AnimeSamaEpisode): Promise<AnimeSamaVideo[]> {
    try {
      const playerUrls = episode.playerUrls;
      const videos: AnimeSamaVideo[] = [];

      // Traitement parallèle des URLs de chaque voix
      const voicePromises = playerUrls.map(async (urlsForVoice, voiceIndex) => {
        const voicePrefix = `(${ANIMESAMA_CONFIG.VOICES[voiceIndex]?.toUpperCase() || 'UNKNOWN'}) `;
        const voiceVideos: AnimeSamaVideo[] = [];

        // Traitement parallèle des URLs pour cette voix
        const urlPromises = urlsForVoice.map(async (playerUrl) => {
          try {
            return await this.extractVideosByPlayerType(playerUrl, voicePrefix);
          } catch (error) {
            console.warn(
              `Erreur lors de l'extraction vidéo pour ${playerUrl}:`,
              error
            );
            return [];
          }
        });

        const urlResults = await Promise.allSettled(urlPromises);
        urlResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            voiceVideos.push(...result.value);
          }
        });

        return voiceVideos;
      });

      const voiceResults = await Promise.allSettled(voicePromises);
      voiceResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          videos.push(...result.value);
        }
      });

      return this.sortVideos(videos);
    } catch (error) {
      console.error('Erreur lors de la récupération des liens vidéo:', error);
      return [];
    }
  }

  /**
   * Extrait les vidéos selon le type de player
   */
  private async extractVideosByPlayerType(
    playerUrl: string,
    voicePrefix: string
  ): Promise<AnimeSamaVideo[]> {
    const url = playerUrl.toLowerCase();

    if (url.includes('sibnet.ru')) {
      return await this.extractSibnetVideos(playerUrl, voicePrefix);
    } else if (url.includes('vk.')) {
      return await this.extractVkVideos(playerUrl, voicePrefix);
    } else if (url.includes('sendvid.com')) {
      return await this.extractSendvidVideos(playerUrl, voicePrefix);
    } else if (url.includes('vidmoly.to')) {
      return await this.extractVidMolyVideos(playerUrl, voicePrefix);
    } else {
      // Player non reconnu - retourner une vidéo générique
      return [
        {
          quality: `${voicePrefix}Unknown Quality`,
          url: playerUrl,
        },
      ];
    }
  }

  /**
   * Récupère les informations de base d'un anime avec cache et validation
   */
  private async fetchAnimeInfo(
    animeUrl: string
  ): Promise<AnimeSamaAnime | null> {
    try {
      // Vérifier le cache
      const cached = extensionCache.getAnimeInfo(animeUrl);
      if (cached) {
        return cached;
      }

      const htmlContent = await this.fetchWithCors(animeUrl);
      const doc = parseHTML(htmlContent);

      // Extraire les informations de base
      const titleElement = doc.querySelector(
        ANIMESAMA_CONFIG.SELECTORS.ANIME_TITLE
      );
      const coverElement = doc.querySelector(
        ANIMESAMA_CONFIG.SELECTORS.ANIME_COVER
      );

      const animeName = titleElement?.textContent?.trim() || '';
      const thumbnailUrl = coverElement?.getAttribute('src') || '';

      if (!animeName) {
        console.warn("Nom d'anime manquant pour l'URL:", animeUrl);
        return null;
      }

      // Extraire le synopsis et les genres
      const { description, genre } = this.extractAnimeMetadata(doc);

      const result = {
        title: animeName,
        url: animeUrl,
        thumbnailUrl: thumbnailUrl
          ? this.validateAndCleanUrl(thumbnailUrl) || ''
          : '',
        description,
        genre,
        initialized: false,
      };

      // Mettre en cache
      extensionCache.cacheAnimeInfo(
        animeUrl,
        result,
        ANIMESAMA_CONFIG.CACHE_TTL.ANIME_INFO
      );

      return result;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des infos anime:',
        animeUrl,
        error
      );
      return null;
    }
  }

  /**
   * Extrait les métadonnées d'un anime (description, genres)
   * @param doc Le document HTML de la page de l'anime
   * @return Un objet contenant la description et les genres
   * @private
   */
  private extractAnimeMetadata(doc: Document): {
    description: string;
    genre: string;
  } {
    let description = '';
    let genre = '';

    const h2Elements = doc.querySelectorAll('h2');

    for (const h2 of h2Elements) {
      const h2Text = h2.textContent?.toLowerCase() || '';

      // Rechercher le synopsis
      if (h2Text.includes('synopsis') && !description) {
        const nextP = h2.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          description = nextP.textContent?.trim() || '';
        }
      }

      // Rechercher les genres
      if (h2Text.includes('genre') && !genre) {
        const genreLinks: string[] = [];
        let sibling = h2.nextElementSibling;

        // Collecter tous les liens de genre qui suivent
        while (sibling && sibling.tagName === 'A') {
          const genreText = sibling.textContent?.trim();
          if (genreText) {
            genreLinks.push(genreText);
          }
          sibling = sibling.nextElementSibling;
        }

        if (genreLinks.length > 0) {
          genre = this.formatGenres(genreLinks);
        } else {
          // Fallback: prendre le premier élément suivant s'il s'agit d'un lien
          const firstGenreLink = h2.nextElementSibling;
          if (firstGenreLink && firstGenreLink.tagName === 'A') {
            const singleGenre = firstGenreLink.textContent?.trim() || '';
            genre = this.formatGenres([singleGenre]);
          }
        }
      }
    }

    return { description, genre };
  }

  /**
   * Récupère les saisons d'un anime depuis sa page
   */
  private async fetchAnimeSeasons(animeUrl: string): Promise<AnimeSamaAnime[]> {
    try {
      const htmlContent = await this.fetchWithCors(animeUrl);
      const doc = parseHTML(htmlContent);

      const animeName = doc.getElementById('titreOeuvre')?.textContent || '';
      const thumbnailUrl =
        doc.getElementById('coverOeuvre')?.getAttribute('src') || '';

      // Rechercher le synopsis en parcourant les éléments h2
      let description = '';
      const h2Elements = doc.querySelectorAll('h2');
      for (const h2 of h2Elements) {
        if (h2.textContent?.toLowerCase().includes('synopsis')) {
          const nextP = h2.nextElementSibling;
          if (nextP && nextP.tagName === 'P') {
            description = nextP.textContent || '';
            break;
          }
        }
      }

      // Rechercher les genres en parcourant les éléments h2
      let genre = '';
      for (const h2 of h2Elements) {
        if (h2.textContent?.toLowerCase().includes('genres')) {
          const nextElement = h2.nextElementSibling;
          if (nextElement && nextElement.tagName === 'A') {
            const singleGenre = nextElement.textContent || '';
            genre = this.formatGenres([singleGenre]);
          } else {
            // Chercher tous les éléments a qui suivent ce h2
            let sibling = h2.nextElementSibling;
            const genreLinks: string[] = [];
            while (sibling && sibling.tagName === 'A') {
              if (sibling.textContent) {
                genreLinks.push(sibling.textContent);
              }
              sibling = sibling.nextElementSibling;
            }
            genre = this.formatGenres(genreLinks);
          }
          break;
        }
      }

      // Extraire les scripts contenant les informations des saisons
      const scripts = Array.from(
        doc.querySelectorAll('h2 + p + div > script, h2 + div > script')
      )
        .map((script) => script.innerHTML)
        .join('\n');

      // Regex pour supprimer les commentaires et extraire les saisons
      const uncommented = scripts.replace(/\/\*.*?\*\//gs, '');
      const seasonRegex = /^\s*panneauAnime\("([^"]*)",\s*"([^"]*)"\)/gm;

      const animes: AnimeSamaAnime[] = [];
      let match;
      let animeIndex = 0;

      while ((match = seasonRegex.exec(uncommented)) !== null) {
        const [, seasonName, seasonStem] = match;

        if (seasonStem.includes('film')) {
          // Gérer les films
          const moviesUrl = `${animeUrl}/${seasonStem}`;
          try {
            const moviesContent = await this.fetchWithCors(moviesUrl);
            const movieNameRegex = /^\s*newSPF\("([^"]*)"\);/gm;
            const movieMatches = Array.from(
              moviesContent.matchAll(movieNameRegex)
            );

            // Simuler le nombre de films (dans la vraie impl, on récupère depuis fetchPlayers)
            const movieCount = Math.max(1, movieMatches.length);

            for (let i = 0; i < movieCount; i++) {
              let title: string;
              if (animeIndex === 0 && movieCount === 1) {
                title = animeName;
              } else if (movieMatches.length > i) {
                title = `${animeName} ${movieMatches[i][1]}`;
              } else if (movieCount === 1) {
                title = `${animeName} Film`;
              } else {
                title = `${animeName} Film ${i + 1}`;
              }

              animes.push({
                title,
                url: `${moviesUrl}#${i}`,
                thumbnailUrl,
                description,
                genre,
                status: 'completed',
                initialized: true,
              });
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des films:', error);
          }
        } else {
          // Gérer les saisons normales
          animes.push({
            title: `${animeName} ${seasonName}`,
            url: `${animeUrl}/${seasonStem}`,
            thumbnailUrl,
            description,
            genre,
            initialized: true,
          });
        }
        animeIndex++;
      }

      return animes;
    } catch (error) {
      console.error('Erreur lors de la récupération des saisons:', error);
      return [];
    }
  }

  /**
   * Récupère les players depuis le fichier episodes.js avec cache
   * @param url L'URL de l'anime
   * @return Une liste de tableaux d'épisodes, chaque tableau contenant les URLs des sources
   */
  private async fetchPlayers(url: string): Promise<string[][]> {
    try {
      const docUrl = `${url}/episodes.js`;

      let content: string;
      try {
        content = await this.fetchWithCors(docUrl);
      } catch (error) {
        console.warn(`Impossible de récupérer episodes.js pour ${url}:`, error);
        return [];
      }

      if (!content || content.trim().length === 0) {
        console.warn('Contenu episodes.js vide pour:', url);
        return [];
      }

      // Vérifier que le contenu ressemble à du JavaScript
      if (
        !content.includes('eps') &&
        !content.includes('var') &&
        !content.includes('function')
      ) {
        console.warn(
          'Le contenu ne ressemble pas à du JavaScript valide:',
          content.substring(0, 100)
        );
        return [];
      }

      // Parser le contenu JavaScript pour extraire les tableaux d'épisodes
      const episodeArrays = this.parseEpisodesJS(content);

      if (episodeArrays.length === 0) {
        console.warn("Aucun tableau d'épisodes trouvé dans episodes.js");
        return [];
      }

      return episodeArrays;
    } catch (error) {
      console.error('Erreur lors de la récupération des players:', error);
      return [];
    }
  }

  /**
   * Parse le contenu JavaScript du fichier episodes.js pour extraire les URLs
   * @param content Le contenu du fichier episodes.js
   * @return Un tableau de tableaux, chaque tableau contenant les URLs des sources pour un épisode
   * @private
   */
  private parseEpisodesJS(content: string): string[][] {
    const allEpisodeArrays: string[][] = [];

    try {
      // Regex pour capturer les tableaux var eps = [...]
      const arrayRegex = /var\s+eps\w*\s*=\s*\[([\s\S]*?)\];/g;
      let match;

      while ((match = arrayRegex.exec(content)) !== null) {
        const arrayContent = match[1];

        // Extraire les URLs du tableau
        const urlRegex = /'([^']+)'/g;
        const urls: string[] = [];
        let urlMatch;

        while ((urlMatch = urlRegex.exec(arrayContent)) !== null) {
          const url = urlMatch[1].trim();
          if (url && (url.startsWith('http') || url.startsWith('//'))) {
            urls.push(url);
          }
        }

        if (urls.length > 0) {
          allEpisodeArrays.push(urls);
        }
      }

      // Si on n'a pas trouvé de tableaux avec la regex principale, essayer une approche alternative
      if (allEpisodeArrays.length === 0) {
        // Regex alternative pour capturer des tableaux avec différents formats
        const altRegex = /\[([\s\S]*?https?:\/\/[^\]]*)\]/g;
        let altMatch;

        while ((altMatch = altRegex.exec(content)) !== null) {
          const arrayContent = altMatch[1];
          const urlRegex = /'([^']+)'/g;
          const urls: string[] = [];
          let urlMatch;

          while ((urlMatch = urlRegex.exec(arrayContent)) !== null) {
            const url = urlMatch[1].trim();
            if (url && url.startsWith('http')) {
              urls.push(url);
            }
          }

          if (urls.length > 0) {
            allEpisodeArrays.push(urls);
          }
        }
      }

      // Maintenant, organiser les données pour les retourner
      // Tous les tableaux trouvés représentent différentes sources pour les mêmes épisodes
      // On doit les transposer pour que chaque index représente un épisode

      if (allEpisodeArrays.length === 0) {
        return [];
      }

      // Trouver le nombre maximum d'épisodes
      const maxEpisodes = Math.max(
        ...allEpisodeArrays.map((arr) => arr.length)
      );

      // Créer un tableau où chaque index représente un épisode
      // et contient toutes les URLs de sources pour cet épisode
      const episodesByNumber: string[][] = [];

      for (let episodeIndex = 0; episodeIndex < maxEpisodes; episodeIndex++) {
        const episodeUrls: string[] = [];

        // Collecter les URLs de tous les tableaux pour cet épisode
        for (const episodeArray of allEpisodeArrays) {
          if (episodeArray[episodeIndex]) {
            episodeUrls.push(episodeArray[episodeIndex]);
          }
        }

        if (episodeUrls.length > 0) {
          episodesByNumber.push(episodeUrls);
        }
      }

      return episodesByNumber;
    } catch (error) {
      console.error('Erreur lors du parsing du JavaScript:', error);
      return [];
    }
  }

  /**
   * Convertit les players en épisodes avec validation
   * @param playersList Liste des players pour chaque voix
   * @return Un tableau d'épisodes avec les URLs des sources
   * @private
   */
  private playersToEpisodes(playersList: string[][][]): AnimeSamaEpisode[] {
    if (!playersList || playersList.length === 0) {
      return [];
    }

    const episodes: AnimeSamaEpisode[] = [];

    // playersList[voiceIndex] contient les épisodes pour cette voix
    // où chaque épisode est un tableau d'URLs de sources différentes

    for (let voiceIndex = 0; voiceIndex < playersList.length; voiceIndex++) {
      const voiceEpisodes = playersList[voiceIndex] || [];
      const voiceName =
        ANIMESAMA_CONFIG.VOICES[voiceIndex]?.toUpperCase() || 'UNKNOWN';

      // Pour chaque épisode de cette voix
      for (
        let episodeIndex = 0;
        episodeIndex < voiceEpisodes.length;
        episodeIndex++
      ) {
        const episodeUrls = voiceEpisodes[episodeIndex] || [];
        const episodeNumber = episodeIndex + 1;

        // Filtrer les URLs valides
        const validUrls = episodeUrls.filter(
          (url) => url && url.trim() && url.startsWith('http')
        );

        if (validUrls.length === 0) {
          continue; // Passer cet épisode s'il n'y a pas d'URLs valides
        }

        // Vérifier si cet épisode existe déjà (d'une autre voix)
        const existingEpisode = episodes.find(
          (ep) => ep.episodeNumber === episodeNumber
        );

        if (existingEpisode) {
          // Ajouter les URLs à la voix correspondante
          if (!existingEpisode.playerUrls[voiceIndex]) {
            existingEpisode.playerUrls[voiceIndex] = [];
          }
          existingEpisode.playerUrls[voiceIndex].push(...validUrls);

          // Mettre à jour le scanlator
          const currentScanlator = existingEpisode.scanlator || '';
          const voices = currentScanlator.split(', ').filter((v) => v.trim());
          if (!voices.includes(voiceName)) {
            voices.push(voiceName);
            existingEpisode.scanlator = voices.join(', ');
          }
        } else {
          // Créer un nouvel épisode
          const playerUrls: string[][] = [];

          // Initialiser les tableaux pour toutes les voix
          for (let i = 0; i < ANIMESAMA_CONFIG.VOICES.length; i++) {
            playerUrls[i] = [];
          }

          // Ajouter les URLs pour la voix actuelle
          playerUrls[voiceIndex] = [...validUrls];

          episodes.push({
            name: `Episode ${episodeNumber}`,
            episodeNumber: episodeNumber,
            playerUrls: playerUrls,
            scanlator: voiceName,
          });
        }
      }
    }

    // Trier les épisodes par numéro
    episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    return episodes;
  }

  /**
   * Trie les vidéos par préférence avec logique améliorée
   * @param videos Liste des vidéos à trier
   * @return La liste triée des vidéos
   */
  private sortVideos(videos: AnimeSamaVideo[]): AnimeSamaVideo[] {
    const voicePreference = ANIMESAMA_CONFIG.VOICE_PREFERENCE.toLowerCase();
    const qualityPriority = ANIMESAMA_CONFIG.QUALITY_PRIORITIES;

    return videos.sort((a, b) => {
      const aLower = a.quality.toLowerCase();
      const bLower = b.quality.toLowerCase();

      // 1. Prioriser la voix préférée
      const aHasPreferredVoice = aLower.includes(voicePreference);
      const bHasPreferredVoice = bLower.includes(voicePreference);

      if (aHasPreferredVoice !== bHasPreferredVoice) {
        return bHasPreferredVoice ? 1 : -1;
      }

      // 2. Trier par qualité (ordre de préférence)
      let aQualityIndex: number = qualityPriority.length;
      let bQualityIndex: number = qualityPriority.length;

      for (let i = 0; i < qualityPriority.length; i++) {
        if (a.quality.includes(qualityPriority[i])) {
          aQualityIndex = i;
          break;
        }
      }

      for (let i = 0; i < qualityPriority.length; i++) {
        if (b.quality.includes(qualityPriority[i])) {
          bQualityIndex = i;
          break;
        }
      }

      if (aQualityIndex !== bQualityIndex) {
        return aQualityIndex - bQualityIndex;
      }

      // 3. Ordre alphabétique en dernier recours
      return a.quality.localeCompare(b.quality);
    });
  }

  /**
   * Extracteurs de vidéos pour différents players avec simulation réaliste
   */
  private async extractSibnetVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    return [
      { quality: `${prefix}720p HD`, url: `${url}/720p.mp4` },
      { quality: `${prefix}480p`, url: `${url}/480p.mp4` },
      { quality: `${prefix}360p`, url: `${url}/360p.mp4` },
    ];
  }

  private async extractVkVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation de l'extraction VK - Dans la vraie impl, utiliser l'API VK
    await this.delay(150);

    return [
      { quality: `${prefix}1080p FHD`, url: `${url}/1080p.mp4` },
      { quality: `${prefix}720p HD`, url: `${url}/720p.mp4` },
      { quality: `${prefix}480p`, url: `${url}/480p.mp4` },
    ];
  }

  private async extractSendvidVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation de l'extraction Sendvid - Plus simple, généralement une seule qualité
    await this.delay(80);

    return [{ quality: `${prefix}720p`, url: `${url}/stream.mp4` }];
  }

  private async extractVidMolyVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation de l'extraction VidMoly - Plusieurs qualités disponibles
    await this.delay(120);

    return [
      { quality: `${prefix}1080p FHD`, url: `${url}/1080p.mp4` },
      { quality: `${prefix}720p HD`, url: `${url}/720p.mp4` },
      { quality: `${prefix}480p`, url: `${url}/480p.mp4` },
      { quality: `${prefix}360p`, url: `${url}/360p.mp4` },
    ];
  }

  /**
   * Formate une liste de genres en gérant les virgules et tirets comme séparateurs
   */
  private formatGenres(genreLinks: string[]): string {
    if (genreLinks.length === 0) {
      return '';
    }

    // Joindre tous les genres et normaliser les séparateurs
    const joinedGenres = genreLinks.join(', ');

    // Remplacer les tirets par des virgules pour uniformiser
    const normalizedGenres = joinedGenres
      .replace(/\s*-\s*/g, ', ') // Remplacer " - " par ", "
      .replace(/\s*,\s*/g, ', ') // Normaliser les espaces autour des virgules
      .replace(/,+/g, ',') // Supprimer les virgules multiples
      .replace(/^,\s*|,\s*$/g, ''); // Supprimer les virgules en début/fin

    return normalizedGenres;
  }
}

export const animeSamaService = new AnimeSamaService();

// Import des types pour l'enregistrement
import type { Episode, AnimeDetails, AnimeCardInfo } from '@/types/anime';

/**
 * Convertit un anime AnimeSama en AnimeCardInfo
 */
function convertAnimeSamaToCardInfo(anime: AnimeSamaAnime): AnimeCardInfo {
  return {
    id: anime.url,
    title: anime.title,
    posterUrl: anime.thumbnailUrl || '',
    extension: 'animesama',
    year: anime.year || new Date().getFullYear(),
  };
}

/**
 * Convertit un anime AnimeSama en AnimeDetails
 */
function convertAnimeSamaToDetails(
  anime: AnimeSamaAnime,
  url: string
): AnimeDetails {
  return {
    id: url,
    title: anime.title,
    description: anime.description || 'Aucune description disponible',
    posterUrl: anime.thumbnailUrl || '',
    year: anime.year,
    status: anime.status as 'ongoing' | 'completed' | 'upcoming' | undefined,
    genres: anime.genre ? anime.genre.split(', ') : [],
    studio: anime.studio,
    extension: 'animesama',
    seasons: [
      {
        number: 1,
        title: anime.title,
        episodeCount: anime.totalEpisodes || 0,
        status: anime.status as
          | 'ongoing'
          | 'completed'
          | 'upcoming'
          | undefined,
      },
    ],
    totalEpisodes: anime.totalEpisodes || 0,
  };
}

/**
 * Convertit un épisode AnimeSama en Episode
 */
function convertAnimeSamaEpisode(
  episode: AnimeSamaEpisode,
  animeUrl: string
): Episode {
  return {
    id: `${animeUrl}_${episode.episodeNumber}`,
    animeId: animeUrl,
    number: episode.episodeNumber,
    title: episode.name,
    description: `Langues disponibles: ${episode.scanlator || 'Non spécifié'}`,
    videoUrl: '', // Sera rempli lors de la lecture
  };
}

/**
 * Enregistre l'extension AnimeSama
 */
export async function registerAnimeSamaExtension(): Promise<void> {
  // Import dynamique pour éviter les dépendances circulaires
  const { useExtensionsStore } = await import('@/stores/extensions');
  const store = useExtensionsStore();

  store.registerExtension('animesama', {
    name: 'AnimeSama',
    version: '1.0.0',
    baseUrl: 'https://anime-sama.fr',
    isEnabled: true,

    async searchAnime(query: string): Promise<AnimeCardInfo[]> {
      try {
        const results = await animeSamaService.searchAnimes({
          query,
          page: 1,
        });
        return results.data.map(convertAnimeSamaToCardInfo);
      } catch (error) {
        console.error('Erreur lors de la recherche AnimeSama:', error);
        return [];
      }
    },

    async getAnimeDetails(url: string): Promise<AnimeDetails> {
      try {
        const animeInfo = await animeSamaService.getAnimeDetails(url);
        if (!animeInfo) {
          throw new Error('Anime non trouvé');
        }

        // Récupérer le nombre d'épisodes pour des informations plus complètes
        let episodeCount = animeInfo.totalEpisodes;
        if (!episodeCount) {
          try {
            const episodes = await animeSamaService.getEpisodeList(url);
            episodeCount = episodes.length;
          } catch (error) {
            console.warn(
              "Impossible de récupérer le nombre d'épisodes:",
              error
            );
            episodeCount = 0;
          }
        }

        const details = convertAnimeSamaToDetails(animeInfo, url);

        // Mettre à jour le nombre d'épisodes si on l'a récupéré
        if (episodeCount > 0) {
          details.totalEpisodes = episodeCount;
          if (details.seasons) details.seasons[0].episodeCount = episodeCount;
        }

        return details;
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        throw error;
      }
    },

    async getEpisodes(animeUrl: string): Promise<Episode[]> {
      try {
        const episodes = await animeSamaService.getEpisodeList(animeUrl);
        return episodes.map((ep) => convertAnimeSamaEpisode(ep, animeUrl));
      } catch (error) {
        console.error('Erreur lors de la récupération des épisodes:', error);
        return [];
      }
    },

    async getPopularAnimes(
      page: number = 1
    ): Promise<{ data: AnimeCardInfo[] }> {
      try {
        const results = await animeSamaService.getPopularAnimes(page);
        return results;
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des animes populaires:',
          error
        );
        return { data: [] };
      }
    },

    async getLatestUpdates(): Promise<{
      data: AnimeCardInfo[];
    }> {
      try {
        const results = await animeSamaService.getLatestUpdates();
        return results;
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des dernières MAJ:',
          error
        );
        return { data: [] };
      }
    },
  });
}
