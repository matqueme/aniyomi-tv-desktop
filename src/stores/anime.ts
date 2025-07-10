import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Episode, AnimeCardInfo } from '@/types/anime';
import { extensionManager } from '@/extensions/manager/ExtensionManager';

export const useAnimeStore = defineStore('anime', () => {
  // État
  const episodes = ref<Episode[]>([]);
  const favorites = ref<string[]>([]);

  // États pour l'extension AnimeSama
  const popularAnimes = ref<AnimeCardInfo[]>([]);
  const latestUpdates = ref<AnimeCardInfo[]>([]);

  // États de chargement
  const loading = ref(false);
  const loadingPopular = ref(false);
  const loadingLatest = ref(false);
  const error = ref<string | null>(null);

  // Nouvelle action pour charger les animes populaires depuis AnimeSama
  const fetchPopularAnimes = async () => {
    loadingPopular.value = true;
    try {
      const response = await extensionManager.getPopularAnime('animesama');
      popularAnimes.value = response.items;
    } catch (err) {
      console.error('Erreur fetchPopularAnimes:', err);
      popularAnimes.value = []; // Assurer qu'on a un tableau vide
    } finally {
      loadingPopular.value = false;
    }
  };

  // Nouvelle action pour charger les dernières mises à jour depuis AnimeSama
  const fetchLatestUpdates = async () => {
    loadingLatest.value = true;
    try {
      const response = await extensionManager.getLatestUpdates('animesama');
      latestUpdates.value = response.items;
    } catch (err) {
      console.error('Erreur fetchLatestUpdates:', err);
      latestUpdates.value = []; // Assurer qu'on a un tableau vide
    } finally {
      loadingLatest.value = false;
    }
  };

  /**
   * Action pour charger toutes les données des animes
   * @returns {Promise<void>}
   */
  const fetchAllData = async () => {
    await Promise.allSettled([fetchPopularAnimes(), fetchLatestUpdates()]);
  };

  const addToFavorites = (animeId: string) => {
    if (!favorites.value.includes(animeId)) {
      favorites.value.push(animeId);
    }
  };

  const removeFromFavorites = (animeId: string) => {
    const index = favorites.value.indexOf(animeId);
    if (index > -1) {
      favorites.value.splice(index, 1);
    }
  };

  const isFavorite = (animeId: string): boolean => {
    return favorites.value.includes(animeId);
  };

  return {
    // État
    episodes,
    favorites,
    popularAnimes,
    latestUpdates,
    loading,
    loadingPopular,
    loadingLatest,
    error,

    // Actions
    fetchPopularAnimes,
    fetchLatestUpdates,
    fetchAllData,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
});
