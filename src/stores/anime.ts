import { ref } from 'vue';
import { defineStore } from 'pinia';
import { extensionManager } from '@/extensions';
import type { Episode, AnimeCardInfo, AnimeDetails } from '@/types/anime';

/**
 * Store pour gérer les animes
 */
export const useAnimeStore = defineStore('anime', () => {
  // État
  const popularAnimes = ref<AnimeCardInfo[]>([]);
  const latestAnimes = ref<AnimeCardInfo[]>([]);
  const searchResults = ref<AnimeCardInfo[]>([]);
  const animeDetails = ref<AnimeDetails | null>(null);
  const episodes = ref<Episode[]>([]);
  const favorites = ref<string[]>([]);

  // États de chargement
  const loadingPopular = ref(false);
  const loadingLatest = ref(false);
  const loadingSearch = ref(false);
  const loadingDetails = ref(false);
  const loadingEpisodes = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchPopularAnimes = async (extensionId: string, page: number = 1) => {
    loadingPopular.value = true;
    error.value = null;

    try {
      const result = await extensionManager.getPopularAnime(extensionId, page);
      popularAnimes.value = result.items;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des animes populaires';
      console.error('Error fetching popular animes:', err);
    } finally {
      loadingPopular.value = false;
    }
  };

  const fetchLatestAnimes = async (extensionId: string, page: number = 1) => {
    loadingLatest.value = true;
    error.value = null;

    try {
      const result = await extensionManager.getLatestUpdates(extensionId, page);
      latestAnimes.value = result.items;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des dernières mises à jour';
      console.error('Error fetching latest animes:', err);
    } finally {
      loadingLatest.value = false;
    }
  };

  const searchAnimes = async (
    extensionId: string,
    query: string,
    page: number = 1
  ) => {
    loadingSearch.value = true;
    error.value = null;

    try {
      const result = await extensionManager.searchAnime(
        extensionId,
        query,
        page
      );
      searchResults.value = result.items;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erreur lors de la recherche';
      console.error('Error searching animes:', err);
    } finally {
      loadingSearch.value = false;
    }
  };

  const fetchAnimeDetails = async (extensionId: string, animeId: string) => {
    loadingDetails.value = true;
    error.value = null;

    try {
      const details = await extensionManager.getAnimeDetails(
        extensionId,
        animeId
      );
      animeDetails.value = details;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des détails';
      console.error('Error fetching anime details:', err);
    } finally {
      loadingDetails.value = false;
    }
  };

  const fetchEpisodes = async (extensionId: string, animeId: string) => {
    loadingEpisodes.value = true;
    error.value = null;

    try {
      const episodeList = await extensionManager.getEpisodes(
        extensionId,
        animeId
      );
      episodes.value = episodeList;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des épisodes';
      console.error('Error fetching episodes:', err);
    } finally {
      loadingEpisodes.value = false;
    }
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

  const clearSearch = () => {
    searchResults.value = [];
  };

  const clearDetails = () => {
    animeDetails.value = null;
    episodes.value = [];
  };

  return {
    // État
    popularAnimes,
    latestAnimes,
    searchResults,
    animeDetails,
    episodes,
    favorites,

    // États de chargement
    loadingPopular,
    loadingLatest,
    loadingSearch,
    loadingDetails,
    loadingEpisodes,
    error,

    // Actions
    fetchPopularAnimes,
    fetchLatestAnimes,
    searchAnimes,
    fetchAnimeDetails,
    fetchEpisodes,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearSearch,
    clearDetails,
  };
});
