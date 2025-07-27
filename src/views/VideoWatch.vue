<template>
  <div class="video-watch-container min-h-screen bg-black">
    <!-- Lecteur vidéo en plein écran avec navigation intégrée -->
    <VideoPlayer
      v-if="videoSource"
      :src="videoSource"
      :type="videoType"
      :poster="posterImage"
      :autoplay="true"
      :show-custom-controls="true"
      :has-next-episode="hasNextEpisode"
      :current-episode="currentEpisode"
      :anime-title="animeInfo?.title"
      @ended="onEnded"
      @error="onError"
      @next-episode="goToNextEpisode"
      @go-back="goBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoPlayer from '../components/video/VideoPlayer.vue';
import { getVideoSource } from '@/data/mockVideoData';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';
import { extractorManager } from '@/extractors/ExtractorManager';
import { useAnimeStore } from '@/stores/anime';
import type { Episode } from '@/types/anime';

// Types
interface AnimeInfo {
  id: string;
  title: string;
  description: string;
  poster: string;
  totalEpisodes: number;
}

interface EpisodeInfo {
  number: number;
  title: string;
  videoUrl: string;
  videoType: string;
  poster?: string;
}

// Router
const route = useRoute();
const router = useRouter();

// Store
const animeStore = useAnimeStore();

// État du composant
const videoSource = ref<string>('');
const videoType = ref<string>('application/x-mpegURL');
const posterImage = ref<string>('');
const animeInfo = ref<AnimeInfo | null>(null);
const currentEpisode = ref<number>(1);
const episodeInfo = ref<EpisodeInfo | null>(null);
const currentSeason = ref<number>(1);
const currentEpisodeData = ref<Episode | null>(null);

const hasNextEpisode = computed(() => {
  return !!(
    animeInfo.value && currentEpisode.value < animeInfo.value.totalEpisodes
  );
});

// Méthodes
const loadAnimeData = async () => {
  const extensionId = route.params.extension as string;
  const animeId = route.params.animeId as string;
  const episodeNumber = parseInt(route.params.episode as string) || 1;
  const seasonParam = route.params.season as string;
  const seasonNumber = parseInt(seasonParam) || 1;

  currentSeason.value = seasonNumber;
  currentEpisode.value = episodeNumber;

  try {
    // Récupérer les détails de l'anime depuis le store
    if (!animeStore.animeDetails || animeStore.animeDetails.id !== animeId) {
      await animeStore.getAnimeDetails(extensionId, animeId);
    }

    const details = animeStore.animeDetails;
    if (!details) {
      throw new Error("Impossible de charger les détails de l'anime");
    }

    // Mettre à jour les infos de l'anime
    animeInfo.value = {
      id: details.id,
      title: details.title,
      description: details.description || '',
      poster: details.posterUrl,
      totalEpisodes: details.totalEpisodes || 0,
    };

    // Trouver la saison actuelle
    const season = details.seasons?.find((s) => s.number === seasonNumber);
    if (!season) {
      throw new Error(`Saison ${seasonNumber} non trouvée`);
    }

    // Trouver l'épisode actuel
    const episode = season.episodes?.find((e) => e.number === episodeNumber);
    if (!episode) {
      throw new Error(`Épisode ${episodeNumber} non trouvé`);
    }

    currentEpisodeData.value = episode;

    // Déterminer quelle source vidéo utiliser (chercher une URL compatible avec un extracteur)
    let selectedPlayer = null;

    if (episode.playersByVoice) {
      // Ordre de priorité pour les voix
      const voiceOrder = ['vostfr', 'vf'];
      const availableVoices = [];

      // D'abord, collecter toutes les voix disponibles
      for (const voice of voiceOrder) {
        if (episode.playersByVoice[voice]?.length > 0) {
          availableVoices.push(voice);
        }
      }

      // Ajouter d'autres voix qui ne sont pas dans l'ordre de priorité
      if (episode.voices) {
        for (const voice of episode.voices) {
          if (
            !availableVoices.includes(voice) &&
            episode.playersByVoice[voice]?.length > 0
          ) {
            availableVoices.push(voice);
          }
        }
      }

      // Parcourir toutes les voix dans l'ordre de priorité
      let playerFound = false;
      for (const voice of availableVoices) {
        // Pour chaque voix, parcourir tous les lecteurs
        if (
          episode.playersByVoice[voice] &&
          episode.playersByVoice[voice].length > 0
        ) {
          const players = episode.playersByVoice[voice];

          // Chercher le premier lecteur qui a un extracteur supporté
          for (const player of players) {
            if (player.url && extractorManager.isUrlSupported(player.url)) {
              selectedPlayer = player;
              console.log(
                `URL supportée trouvée: ${player.url} (voice: ${voice}, type: ${player.type})`
              );
              playerFound = true;
              break;
            }
          }

          if (playerFound) break;
        }
      }

      // Si aucun lecteur avec extracteur n'est trouvé, prendre le premier disponible
      if (!selectedPlayer) {
        for (const voice of availableVoices) {
          if (
            episode.playersByVoice[voice] &&
            episode.playersByVoice[voice].length > 0
          ) {
            selectedPlayer = episode.playersByVoice[voice][0];
            console.log(
              `Aucun lecteur supporté trouvé, utilisation du premier disponible: ${selectedPlayer.url} (voice: ${voice})`
            );
            break;
          }
        }
      }
    }

    if (selectedPlayer && selectedPlayer.url) {
      try {
        console.log(
          `Tentative d'extraction de la vidéo depuis: ${selectedPlayer.url}`
        );

        // Vérifier si l'URL est supportée par un extracteur
        if (extractorManager.isUrlSupported(selectedPlayer.url)) {
          // Extraire la vidéo et utiliser la première source
          const sources = await extractorManager.extractFromUrl(
            selectedPlayer.url
          );

          if (sources && sources.length > 0) {
            const source = sources[0];

            episodeInfo.value = {
              number: episodeNumber,
              title: episode.title || `Épisode ${episodeNumber}`,
              videoUrl: source.url,
              videoType: source.url.includes('.m3u8')
                ? 'application/x-mpegURL'
                : 'video/mp4',
              poster: episode.thumbnailUrl,
            };

            videoSource.value = source.url;
            videoType.value = episodeInfo.value.videoType;
            posterImage.value = episode.thumbnailUrl || details.posterUrl || '';

            console.log(
              `Source vidéo extraite: ${source.url} (qualité: ${source.quality})`
            );
            return;
          }
        }

        // Si l'extraction échoue, on essaie d'utiliser l'URL directement
        episodeInfo.value = {
          number: episodeNumber,
          title: episode.title || `Épisode ${episodeNumber}`,
          videoUrl: selectedPlayer.url,
          videoType: selectedPlayer.url.includes('.m3u8')
            ? 'application/x-mpegURL'
            : 'video/mp4',
          poster: episode.thumbnailUrl,
        };

        videoSource.value = selectedPlayer.url;
        videoType.value = episodeInfo.value.videoType;
        posterImage.value = episode.thumbnailUrl || details.posterUrl || '';
      } catch (error) {
        console.error("Erreur lors de l'extraction de la vidéo:", error);
        throw error;
      }
    } else {
      // Fallback sur les données mock si disponibles
      const videoData = getVideoSource(animeId, episodeNumber);

      if (videoData) {
        episodeInfo.value = {
          number: videoData.episode,
          title: videoData.title,
          videoUrl: videoData.videoUrl,
          videoType: videoData.videoType,
          poster: videoData.poster,
        };

        videoSource.value = videoData.videoUrl;
        videoType.value = videoData.videoType;
        posterImage.value = videoData.poster || details.posterUrl || '';
      } else {
        // Dernier recours avec vidéo par défaut
        episodeInfo.value = {
          number: episodeNumber,
          title: episode.title || `Épisode ${episodeNumber}`,
          videoUrl:
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          videoType: 'video/mp4',
          poster: episode.thumbnailUrl,
        };

        videoSource.value = episodeInfo.value.videoUrl;
        videoType.value = episodeInfo.value.videoType;
        posterImage.value = episode.thumbnailUrl || details.posterUrl || '';
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);

    // Fallback avec vidéo par défaut en cas d'erreur
    episodeInfo.value = {
      number: episodeNumber,
      title: `Épisode ${episodeNumber}`,
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoType: 'video/mp4',
    };

    videoSource.value = episodeInfo.value.videoUrl;
    videoType.value = 'video/mp4';
    posterImage.value = '';
  }
};

const goToNextEpisode = () => {
  if (hasNextEpisode.value && animeStore.animeDetails) {
    const newEpisode = currentEpisode.value + 1;
    const extension = route.params.extension as string;
    const seasonParam = route.params.season as string;

    // Construction de la route
    const routeConfig = {
      name: 'VideoWatch',
      params: {
        extension: extension,
        animeId: animeInfo.value?.id,
        season: seasonParam,
        episode: newEpisode.toString(),
      },
    };

    router.push(routeConfig);
  }
};

const goBack = () => {
  if (animeInfo.value?.id) {
    const extension = route.params.extension as string;
    const season = route.params.season as string;

    router.push({
      name: 'AnimeDetail',
      params: {
        extension: extension,
        animeName: animeInfo.value.id,
        season: season,
      },
    });
  } else {
    router.push({ name: 'Home' }); // fallback si pas d'id
  }
};

const onEnded = () => {
  // Auto-lecture de l'épisode suivant si disponible
  if (hasNextEpisode.value) {
    setTimeout(() => {
      goToNextEpisode();
    }, 3000);
  }
};

const onError = (error: string) => {
  console.error('Erreur du lecteur vidéo:', error);
};

// Lifecycle
onMounted(async () => {
  await loadAnimeData();

  await nextTick();

  // Forcer le focus spatial sur la section au montage
  SpatialNavigation.focus('video-controls');
});

// Watchers pour les changements de route
watch(
  () => [
    route.params.episode,
    route.params.season,
    route.params.animeId,
    route.params.extension,
  ],
  async () => {
    await loadAnimeData();
  }
);
</script>

<style scoped>
.video-watch-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
