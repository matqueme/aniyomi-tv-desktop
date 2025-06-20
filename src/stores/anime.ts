import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Anime } from '../types/anime';

export const useAnimeStore = defineStore('anime', () => {
  // État
  const animes = ref<Anime[]>([]);
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
      const { mockAnimes } = await import('../data/mockData');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation du délai réseau
      animes.value = mockAnimes;
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

  const getAnimeById = (id: string) => {
    return animes.value.find((anime: Anime) => anime.id === id);
  };

  const getAnimesByGenre = (genreId: string) => {
    return animes.value.filter((anime: Anime) =>
      anime.genres.some((genre: string) => genre === genreId)
    );
  };

  return {
    // État
    animes,
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
  };
});
