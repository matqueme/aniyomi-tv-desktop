import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Anime, Episode } from '@/types/anime';

export const useAnimeStore = defineStore('anime', () => {
  // État
  const animes = ref<Anime[]>([]);
  const episodes = ref<Episode[]>([]);
  const favorites = ref<string[]>([]);
  const featuredAnime = ref<Anime | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const trendingAnimes = computed(() =>
    animes.value.sort((a: Anime, b: Anime) => b.rating - a.rating).slice(0, 10)
  );

  // Actions
  const fetchAnimes = async () => {
    loading.value = true;
    error.value = null;
    try {
      // Simulation d'un appel API avec des données de test
      const { mockAnimes, mockEpisodes } = await import('../data/mockData');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation du délai réseau
      animes.value = mockAnimes;
      episodes.value = mockEpisodes;
    } catch (err) {
      error.value = 'Erreur lors du chargement des animes';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const setFeaturedAnime = (anime: Anime) => {
    featuredAnime.value = anime;
  };

  const getAnimeById = (id: string): Anime | undefined => {
    return animes.value.find((anime: Anime) => anime.id === id);
  };

  const getAnimesByGenre = (genreId: string) => {
    return animes.value.filter((anime: Anime) =>
      anime.genres.some((genre: string) => genre === genreId)
    );
  };

  const getEpisodesByAnimeId = (animeId: string): Episode[] => {
    return episodes.value.filter(
      (episode: Episode) => episode.animeId === animeId
    );
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
    animes,
    episodes,
    favorites,
    featuredAnime,
    loading,
    error,

    // Getters
    trendingAnimes,

    // Actions
    fetchAnimes,
    setFeaturedAnime,
    getAnimeById,
    getAnimesByGenre,
    getEpisodesByAnimeId,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
});
