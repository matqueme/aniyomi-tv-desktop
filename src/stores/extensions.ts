import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AnimeCardInfo, AnimeDetails, Episode } from '@/types/anime';

/**
 * Interface pour les services d'extension
 */
export interface ExtensionService {
  name: string;
  version: string;
  baseUrl: string;
  isEnabled: boolean;

  // Méthodes principales
  searchAnime(query: string): Promise<AnimeCardInfo[]>;
  getAnimeDetails(url: string): Promise<AnimeDetails>;
  getEpisodes(animeUrl: string): Promise<Episode[]>;
  getPopularAnimes(page?: number): Promise<{ data: AnimeCardInfo[] }>;
  getLatestUpdates(): Promise<{ data: AnimeCardInfo[] }>;
}

/**
 * Interface pour les métadonnées d'extension
 */
export interface ExtensionMetadata {
  key: string;
  name: string;
  version: string;
  baseUrl: string;
  isEnabled: boolean;
}

export const useExtensionsStore = defineStore('extensions', () => {
  // État
  const services = ref<Map<string, ExtensionService>>(new Map());
  const initialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters computed
  const availableExtensions = computed((): ExtensionMetadata[] => {
    return Array.from(services.value.entries()).map(([key, service]) => ({
      key,
      name: service.name,
      version: service.version,
      baseUrl: service.baseUrl,
      isEnabled: service.isEnabled,
    }));
  });

  const enabledExtensions = computed((): ExtensionMetadata[] => {
    return availableExtensions.value.filter((ext) => ext.isEnabled);
  });

  const extensionCount = computed((): number => {
    return services.value.size;
  });

  // Actions
  const registerExtension = (key: string, service: ExtensionService): void => {
    services.value.set(key, service);
  };

  const getExtension = (key: string): ExtensionService | undefined => {
    return services.value.get(key);
  };

  const toggleExtension = (extensionKey: string, enabled: boolean): boolean => {
    const service = services.value.get(extensionKey);
    if (!service) {
      return false;
    }

    service.isEnabled = enabled;
    return true;
  };

  const isExtensionEnabled = (extensionKey: string): boolean => {
    const service = services.value.get(extensionKey);
    return service ? service.isEnabled : false;
  };

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null): void => {
    error.value = errorMessage;
  };

  const initializeExtensions = async (): Promise<void> => {
    if (initialized.value) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import et enregistrement des extensions
      const { registerAnimeSamaExtension } = await import(
        '../services/extensions/animesama'
      );
      await registerAnimeSamaExtension();

      initialized.value = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'initialisation des extensions";
      setError(errorMessage);
      console.error("Erreur lors de l'initialisation des extensions:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // État
    services: computed(() => services.value),
    initialized: computed(() => initialized.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Getters
    availableExtensions,
    enabledExtensions,
    extensionCount,

    // Actions
    registerExtension,
    getExtension,
    toggleExtension,
    isExtensionEnabled,
    setLoading,
    setError,
    initializeExtensions,
  };
});
