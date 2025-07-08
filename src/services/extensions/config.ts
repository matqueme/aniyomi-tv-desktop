/**
 * Configuration centralisée pour les extensions
 */

export const EXTENSION_CONFIG = {
  // Configuration globale
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  CONCURRENT_REQUESTS: 5,

  // Configuration AnimeSama
  ANIMESAMA: {
    BASE_URL: 'https://anime-sama.fr',
    CORS_PROXIES: [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/',
    ],
    SELECTORS: {
      POPULAR_ANIMES: '#containerPepites > div a',
      LATEST_UPDATES: '#containerAjoutsAnimes > div',
      SEARCH_RESULTS: '#list_catalog > div a',
      PAGINATION: '#list_pagination a',
      ANIME_TITLE: '#titreOeuvre',
      ANIME_COVER: '#coverOeuvre',
      SYNOPSIS_HEADER: 'h2:contains("synopsis")',
      GENRE_HEADER: 'h2:contains("genre")',
    },
    VOICES: ['vostfr', 'vf'] as const,
    QUALITY_PRIORITIES: ['1080', '720', '480', '360'] as const,
    VOICE_PREFERENCE: 'vostfr',
    ITEMS_PER_PAGE: 5,
    PLAYER_TYPES: {
      SIBNET: 'sibnet.ru',
      VK: 'vk.com',
      SENDVID: 'sendvid.com',
      VIDMOLY: 'vidmoly.to',
    },
  },

  // Configuration pour futures extensions
  EXTENSIONS: {
    ANIMESAMA: {
      ID: 'animesama',
      NAME: 'AnimeSama',
      VERSION: '2.0.0',
      ENABLED: true,
      ICON: '/icons/animesama.png',
      LANGUAGES: ['fr'],
      FEATURES: [
        'search',
        'popular',
        'latest',
        'details',
        'episodes',
        'videos',
      ],
    },
    // Futures extensions peuvent être ajoutées ici
    // CRUNCHYROLL: { ... },
    // FUNIMATION: { ... },
  },

  // Configuration de cache
  CACHE: {
    TTL: 3600000, // 1 heure en millisecondes
    MAX_ENTRIES: 1000,
    ENABLED: true,
  },

  // Configuration des logs
  LOGGING: {
    LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLED: true,
    MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
  },
} as const;

/**
 * Types pour la configuration
 */
export type ExtensionConfig = typeof EXTENSION_CONFIG;
export type AnimeSamaConfig = typeof EXTENSION_CONFIG.ANIMESAMA;
export type ExtensionInfo = typeof EXTENSION_CONFIG.EXTENSIONS.ANIMESAMA;

/**
 * Helper pour obtenir la configuration d'une extension
 */
export function getExtensionConfig(
  extensionId: string
): ExtensionInfo | undefined {
  const key =
    extensionId.toUpperCase() as keyof typeof EXTENSION_CONFIG.EXTENSIONS;
  return EXTENSION_CONFIG.EXTENSIONS[key];
}

/**
 * Helper pour vérifier si une extension est activée
 */
export function isExtensionEnabled(extensionId: string): boolean {
  const config = getExtensionConfig(extensionId);
  return config?.ENABLED ?? false;
}

/**
 * Helper pour obtenir la liste des extensions activées
 */
export function getEnabledExtensions(): ExtensionInfo[] {
  return Object.values(EXTENSION_CONFIG.EXTENSIONS).filter(
    (ext) => ext.ENABLED
  );
}

/**
 * Configuration des User-Agents pour éviter la détection de bot
 */
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
] as const;

/**
 * Helper pour obtenir un User-Agent aléatoire
 */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
