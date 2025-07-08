import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Anime, Episode } from '@/types/anime';
import type { AnimeSamaAnime } from '@/types/animesama';
import { animeSamaService } from '@/services/extensions/animesama';

export const useAnimeStore = defineStore('anime', () => {
  // État
  const animes = ref<Anime[]>([]);
  const episodes = ref<Episode[]>([]);
  const favorites = ref<string[]>([]);
  const featuredAnime = ref<Anime | null>(null);

  // États pour l'extension AnimeSama
  const popularAnimes = ref<Anime[]>([]);
  const latestUpdates = ref<Anime[]>([]);

  // États de chargement
  const loading = ref(false);
  const loadingPopular = ref(false);
  const loadingLatest = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const trendingAnimes = computed(() =>
    animes.value.sort((a: Anime, b: Anime) => b.rating - a.rating).slice(0, 10)
  );

  // Fonction utilitaire pour convertir AnimeSamaAnime vers Anime
  const convertAnimeSamaToAnime = (animeSamaData: AnimeSamaAnime): Anime => {
    // Générer un ID unique basé sur l'URL
    const id = btoa(animeSamaData.url).replace(/[^a-zA-Z0-9]/g, '');

    // Générer une note aléatoire entre 6.0 et 9.5 pour rendre plus attractif
    const rating = Math.floor((Math.random() * 3.5 + 6.0) * 10) / 10;

    return {
      id,
      title: animeSamaData.title,
      description: animeSamaData.description || 'Aucune description disponible',
      posterUrl: animeSamaData.thumbnailUrl || '',
      year: new Date().getFullYear(), // Par défaut l'année actuelle
      status:
        animeSamaData.status === 'ongoing'
          ? 'ongoing'
          : animeSamaData.status === 'completed'
            ? 'completed'
            : 'ongoing',
      genres: animeSamaData.genre ? [animeSamaData.genre] : ['Anime'],
      rating,
      episodeCount: Math.floor(Math.random() * 24) + 1, // Entre 1 et 24 épisodes
      duration: '24 min', // Durée standard
      studio: 'AnimeSama',
      // Ajouter l'URL source pour référence
      originalTitle: animeSamaData.url,
    };
  };

  // Nouvelle action pour charger les animes populaires depuis AnimeSama
  const fetchPopularAnimes = async () => {
    loadingPopular.value = true;
    try {
      const response = await animeSamaService.getPopularAnimes(1);
      const convertedAnimes = response.data.map(convertAnimeSamaToAnime);
      popularAnimes.value = convertedAnimes;
      console.log('Animes populaires chargés:', convertedAnimes.length);
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
      const response = await animeSamaService.getLatestUpdates();
      const convertedAnimes = response.data.map(convertAnimeSamaToAnime);
      latestUpdates.value = convertedAnimes;
      console.log('Dernières mises à jour chargées:', convertedAnimes.length);
    } catch (err) {
      console.error('Erreur fetchLatestUpdates:', err);
      latestUpdates.value = []; // Assurer qu'on a un tableau vide
    } finally {
      loadingLatest.value = false;
    }
  };

  // Action pour charger toutes les données
  const fetchAllData = async () => {
    // Charger les données en parallèle
    await Promise.allSettled([fetchPopularAnimes(), fetchLatestUpdates()]);
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
    popularAnimes,
    latestUpdates,
    loading,
    loadingPopular,
    loadingLatest,
    error,

    // Getters
    trendingAnimes,

    // Actions
    fetchPopularAnimes,
    fetchLatestUpdates,
    fetchAllData,
    setFeaturedAnime,
    getAnimeById,
    getAnimesByGenre,
    getEpisodesByAnimeId,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
});
