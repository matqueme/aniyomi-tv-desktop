import type {
  AnimeSamaAnime,
  AnimeSamaEpisode,
  AnimeSamaVideo,
  AnimeSamaSearchParams,
  AnimeSamaPage,
} from '@/types/animesama';

/**
 * Service pour scraper AnimeSama.fr
 * Basé sur l'extension Kotlin officielle
 */
export class AnimeSamaService {
  private baseUrl = 'https://anime-sama.fr';
  private corsProxy = 'https://api.allorigins.win/raw?url='; // Proxy CORS pour les tests

  /**
   * Helper pour faire des requêtes avec gestion CORS
   */
  private async fetchWithCors(url: string): Promise<string> {
    try {
      // Essayer d'abord sans proxy (peut marcher en production)
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.log('Direct fetch failed, trying with CORS proxy...', error);
    }

    // Utiliser le proxy CORS si la requête directe échoue
    const proxiedUrl = this.corsProxy + encodeURIComponent(url);
    const response = await fetch(proxiedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Parse un document HTML depuis une string
   */
  private parseHTML(htmlString: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(htmlString, 'text/html');
  }

  /**
   * Divise un tableau en chunks de taille donnée
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Récupère les animes populaires depuis la page d'accueil
   */
  async getPopularAnimes(
    page: number = 1
  ): Promise<AnimeSamaPage<AnimeSamaAnime>> {
    try {
      const htmlContent = await this.fetchWithCors(this.baseUrl);
      const doc = this.parseHTML(htmlContent);

      // Sélecteur basé sur le code Kotlin: "#containerPepites > div a"
      const pepitesLinks = doc.querySelectorAll('#containerPepites > div a');
      const chunks = this.chunkArray(Array.from(pepitesLinks), 5);
      const currentChunk = chunks[page - 1];

      if (!currentChunk) {
        return { data: [], hasNextPage: false };
      }

      const animes: AnimeSamaAnime[] = [];
      for (const link of currentChunk) {
        const href = link.getAttribute('href');
        if (href) {
          const animeUrl = `${this.baseUrl}${href}`;
          const seasons = await this.fetchAnimeSeasons(animeUrl);
          animes.push(...seasons);
        }
      }

      return {
        data: animes,
        hasNextPage: page < chunks.length,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des animes populaires:',
        error
      );
      return { data: [], hasNextPage: false };
    }
  }

  /**
   * Récupère les dernières mises à jour
   */
  async getLatestUpdates(): Promise<AnimeSamaPage<AnimeSamaAnime>> {
    try {
      const htmlContent = await this.fetchWithCors(this.baseUrl);
      const doc = this.parseHTML(htmlContent);

      // Sélecteur basé sur le code Kotlin: "#containerAjoutsAnimes > div"
      const updateElements = doc.querySelectorAll(
        '#containerAjoutsAnimes > div'
      );
      const animes: AnimeSamaAnime[] = [];
      const seenUrls = new Set<string>();

      for (const element of updateElements) {
        const link = element.querySelector('a');
        if (link) {
          const href = link.getAttribute('href');
          if (href) {
            // Nettoyer l'URL comme dans le code Kotlin
            const url = new URL(href, this.baseUrl);
            const pathSegments = url.pathname
              .split('/')
              .filter((segment) => segment);
            if (pathSegments.length >= 2) {
              pathSegments.pop(); // Retirer les 2 derniers segments
              pathSegments.pop();
              const cleanUrl = `${url.origin}/${pathSegments.join('/')}/`;

              if (!seenUrls.has(cleanUrl)) {
                seenUrls.add(cleanUrl);
                const seasons = await this.fetchAnimeSeasons(cleanUrl);
                animes.push(...seasons);
              }
            }
          }
        }
      }

      return {
        data: animes,
        hasNextPage: false,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières MAJ:', error);
      return { data: [], hasNextPage: false };
    }
  }

  /**
   * Recherche d'animes
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

      // Construire l'URL de recherche comme dans le code Kotlin
      const searchUrl = new URL(`${this.baseUrl}/catalogue/`);

      types.forEach((type) => searchUrl.searchParams.append('type[]', type));
      languages.forEach((lang) =>
        searchUrl.searchParams.append('langue[]', lang)
      );
      genres.forEach((genre) =>
        searchUrl.searchParams.append('genre[]', genre)
      );

      if (query) {
        searchUrl.searchParams.append('search', query);
      }
      searchUrl.searchParams.append('page', page.toString());

      const htmlContent = await this.fetchWithCors(searchUrl.toString());
      const doc = this.parseHTML(htmlContent);

      // Sélecteur basé sur le code Kotlin: "#list_catalog > div a"
      const animeLinks = doc.querySelectorAll('#list_catalog > div a');
      const animes: AnimeSamaAnime[] = [];

      for (const link of animeLinks) {
        const href = link.getAttribute('href');
        if (href) {
          const seasons = await this.fetchAnimeSeasons(href);
          animes.push(...seasons);
        }
      }

      // Vérifier s'il y a une page suivante
      const paginationLinks = doc.querySelectorAll('#list_pagination a');
      const lastPageText =
        paginationLinks[paginationLinks.length - 1]?.textContent;
      const hasNextPage = lastPageText !== page.toString();

      return {
        data: animes,
        hasNextPage,
      };
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return { data: [], hasNextPage: false };
    }
  }

  /**
   * Récupère les détails d'un anime
   */
  async getAnimeDetails(url: string): Promise<AnimeSamaAnime | null> {
    // Simulation basée sur l'URL
    return {
      title: 'Anime Test',
      url,
      thumbnailUrl: 'https://anime-sama.fr/images/test.jpg',
      description: "Description détaillée de l'anime de test...",
      genre: 'Action, Aventure',
      status: 'completed',
      initialized: true,
    };
  }

  /**
   * Récupère la liste des épisodes pour un anime
   * Basé sur getEpisodeList du code Kotlin
   */
  async getEpisodeList(animeUrl: string): Promise<AnimeSamaEpisode[]> {
    try {
      // Extraire l'URL de base et le numéro de film si c'est un film
      const baseAnimeUrl = `${this.baseUrl}${animeUrl.substring(0, animeUrl.lastIndexOf('/'))}`;
      const movieMatch = animeUrl.split('#');
      const movieIndex = movieMatch.length > 1 ? parseInt(movieMatch[1]) : null;

      // Les voix disponibles (comme dans le code Kotlin)
      const voices = ['vostfr', 'vf'];
      const allPlayers: string[][][] = [];

      // Récupérer les players pour chaque voix
      for (const voice of voices) {
        const players = await this.fetchPlayers(`${baseAnimeUrl}/${voice}`);
        allPlayers.push(players);
      }

      const episodes = this.playersToEpisodes(allPlayers);

      // Si c'est un film, retourner seulement l'épisode spécifique
      if (movieIndex !== null && episodes[movieIndex]) {
        return [episodes[movieIndex]];
      }

      // Sinon retourner tous les épisodes dans l'ordre inverse (comme dans Kotlin)
      return episodes.reverse();
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes:', error);
      return [];
    }
  }

  /**
   * Récupère les liens vidéo pour un épisode
   * Basé sur getVideoList du code Kotlin
   */
  async getVideoList(episode: AnimeSamaEpisode): Promise<AnimeSamaVideo[]> {
    try {
      const playerUrls = episode.playerUrls;
      const videos: AnimeSamaVideo[] = [];
      const voices = ['vostfr', 'vf'];

      for (let i = 0; i < playerUrls.length; i++) {
        const urlsForVoice = playerUrls[i];
        const prefix = `(${voices[i].toUpperCase()}) `;

        for (const playerUrl of urlsForVoice) {
          // Simuler l'extraction de vidéos selon le type de player
          let extractedVideos: AnimeSamaVideo[] = [];

          if (playerUrl.includes('sibnet.ru')) {
            extractedVideos = await this.extractSibnetVideos(playerUrl, prefix);
          } else if (playerUrl.includes('vk.')) {
            extractedVideos = await this.extractVkVideos(playerUrl, prefix);
          } else if (playerUrl.includes('sendvid.com')) {
            extractedVideos = await this.extractSendvidVideos(
              playerUrl,
              prefix
            );
          } else if (playerUrl.includes('vidmoly.to')) {
            extractedVideos = await this.extractVidMolyVideos(
              playerUrl,
              prefix
            );
          }

          videos.push(...extractedVideos);
        }
      }

      return this.sortVideos(videos);
    } catch (error) {
      console.error('Erreur lors de la récupération des liens vidéo:', error);
      return [];
    }
  }

  /**
   * Récupère les saisons d'un anime depuis sa page
   * Basé sur fetchAnimeSeasons du code Kotlin
   */
  private async fetchAnimeSeasons(animeUrl: string): Promise<AnimeSamaAnime[]> {
    try {
      const htmlContent = await this.fetchWithCors(animeUrl);
      const doc = this.parseHTML(htmlContent);

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
            genre = nextElement.textContent || '';
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
            genre = genreLinks.join(', ');
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
            status: 'unknown',
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
   * Récupère les players depuis le fichier episodes.js
   * Basé sur fetchPlayers du code Kotlin
   */
  private async fetchPlayers(url: string): Promise<string[][]> {
    try {
      const docUrl = `${url}/episodes.js`;
      const content = await this.fetchWithCors(docUrl);

      // Simulation de l'exécution JavaScript (dans la vraie impl, on utiliserait QuickJS)
      // Le contenu JavaScript pourrait être analysé ici
      console.log('Fetched episodes.js content length:', content.length);

      // Pour l'instant, on retourne des données mock
      const mockPlayers: string[][] = [];
      for (let i = 0; i < 12; i++) {
        mockPlayers.push([
          `https://sibnet.ru/video${i}`,
          `https://vk.com/video${i}`,
          `https://sendvid.com/video${i}`,
        ]);
      }
      return mockPlayers;
    } catch (error) {
      console.error('Erreur lors de la récupération des players:', error);
      return [];
    }
  }

  /**
   * Convertit les players en épisodes
   * Basé sur playersToEpisodes du code Kotlin
   */
  private playersToEpisodes(playersList: string[][][]): AnimeSamaEpisode[] {
    const maxEpisodes = playersList.reduce(
      (max, players) => Math.max(max, players.length),
      0
    );
    const episodes: AnimeSamaEpisode[] = [];

    for (let episodeNumber = 0; episodeNumber < maxEpisodes; episodeNumber++) {
      const playerUrls = playersList.map(
        (players) => players[episodeNumber] || []
      );

      const availableVoices = playerUrls
        .map((urls, index) =>
          urls.length > 0 ? ['vostfr', 'vf'][index] : null
        )
        .filter((voice) => voice !== null)
        .map((voice) => voice!.toUpperCase());

      episodes.push({
        name: `Episode ${episodeNumber + 1}`,
        episodeNumber: episodeNumber + 1,
        playerUrls,
        scanlator: availableVoices.join(', '),
      });
    }

    return episodes;
  }

  /**
   * Trie les vidéos par préférence
   * Basé sur la méthode sort du code Kotlin
   */
  private sortVideos(videos: AnimeSamaVideo[]): AnimeSamaVideo[] {
    const voicePreference = 'vostfr'; // Préférence par défaut
    const qualityPreference = '1080'; // Préférence par défaut

    return videos.sort((a, b) => {
      // Prioriser la voix préférée
      const aHasPreferredVoice = a.quality
        .toLowerCase()
        .includes(voicePreference);
      const bHasPreferredVoice = b.quality
        .toLowerCase()
        .includes(voicePreference);

      if (aHasPreferredVoice !== bHasPreferredVoice) {
        return bHasPreferredVoice ? 1 : -1;
      }

      // Prioriser la qualité préférée
      const aHasPreferredQuality = a.quality.includes(qualityPreference);
      const bHasPreferredQuality = b.quality.includes(qualityPreference);

      if (aHasPreferredQuality !== bHasPreferredQuality) {
        return bHasPreferredQuality ? 1 : -1;
      }

      return 0;
    });
  }

  /**
   * Extracteurs de vidéos pour différents players
   * Ces méthodes simulent l'extraction des liens vidéo
   */
  private async extractSibnetVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation - dans la vraie impl, on utilise SibnetExtractor
    return [
      { quality: `${prefix}720p`, url: `${url}/720p.mp4` },
      { quality: `${prefix}480p`, url: `${url}/480p.mp4` },
    ];
  }

  private async extractVkVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation - dans la vraie impl, on utilise VkExtractor
    return [
      { quality: `${prefix}1080p`, url: `${url}/1080p.mp4` },
      { quality: `${prefix}720p`, url: `${url}/720p.mp4` },
    ];
  }

  private async extractSendvidVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation - dans la vraie impl, on utilise SendvidExtractor
    return [{ quality: `${prefix}720p`, url: `${url}/720p.mp4` }];
  }

  private async extractVidMolyVideos(
    url: string,
    prefix: string
  ): Promise<AnimeSamaVideo[]> {
    // Simulation - dans la vraie impl, on utilise VidMolyExtractor
    return [
      { quality: `${prefix}1080p`, url: `${url}/1080p.mp4` },
      { quality: `${prefix}720p`, url: `${url}/720p.mp4` },
      { quality: `${prefix}480p`, url: `${url}/480p.mp4` },
    ];
  }
}

export const animeSamaService = new AnimeSamaService();
