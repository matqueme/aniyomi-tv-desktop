import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Anime, Episode, AnimeCardInfo } from '@/types/anime';
import type { AnimeSamaAnime } from '@/types/animesama';
import { animeSamaService } from '@/services/extensions/animesama';

export const useAnimeStore = defineStore('anime', () => {
  // État
  const episodes = ref<Episode[]>([]);
  const favorites = ref<string[]>([]);

  // États pour l'extension AnimeSama
  const popularAnimes = ref<Anime[]>([]);
  const latestUpdates = ref<AnimeCardInfo[]>([]);

  // États de chargement
  const loading = ref(false);
  const loadingPopular = ref(false);
  const loadingLatest = ref(false);
  const error = ref<string | null>(null);

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

  const mapAnimeDataCardInfo = (
    animeSamaData: AnimeSamaAnime
  ): AnimeCardInfo => {
    return {
      id: btoa(animeSamaData.url).replace(/[^a-zA-Z0-9]/g, ''),
      title: animeSamaData.title,
      posterUrl: animeSamaData.thumbnailUrl || '',
      year: new Date().getFullYear(), // Par défaut l'année actuelle
      numberOfEpisodes: Math.floor(Math.random() * 24) + 1, // Entre 1 et 24 épisodes
    };
  };

  // Nouvelle action pour charger les animes populaires depuis AnimeSama
  const fetchPopularAnimes = async () => {
    loadingPopular.value = true;
    try {
      const response = await animeSamaService.getPopularAnimes(1);
      popularAnimes.value = response.data.map(convertAnimeSamaToAnime);
      console.log('Animes populaires chargés:', popularAnimes.value.length);
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
      // Supposons que response.data contient le tableau d'animes
      latestUpdates.value = response.data.map(mapAnimeDataCardInfo);
      console.log(
        'Dernières mises à jour chargées:',
        latestUpdates.value.length
      );
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
