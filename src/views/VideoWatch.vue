<template>
  <div
    ref="videoWatchContainer"
    v-focus-section:video-watch.default
    class="video-watch-container min-h-screen bg-black"
  >
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
import { mockAnimes } from '@/data/mockData';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';

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

// État du composant
const videoSource = ref<string>('');
const videoType = ref<string>('application/x-mpegURL');
const posterImage = ref<string>('');
const animeInfo = ref<AnimeInfo | null>(null);
const currentEpisode = ref<number>(1);
const episodeInfo = ref<EpisodeInfo | null>(null);

// UI State - simplifiées car intégrées dans le VideoPlayer
const videoWatchContainer = ref<HTMLElement | null>(null);

const hasNextEpisode = computed(() => {
  return !!(
    animeInfo.value && currentEpisode.value < animeInfo.value.totalEpisodes
  );
});

// Méthodes
const loadAnimeData = () => {
  const animeId = route.params.animeId as string;
  const episodeNumber = parseInt(route.params.episode as string) || 1;

  // Récupérer les données de l'anime depuis le mock
  const animeData = mockAnimes.find((anime) => anime.id === animeId);
  if (animeData) {
    animeInfo.value = {
      id: animeData.id,
      title: animeData.title,
      description: animeData.description,
      poster: animeData.posterUrl,
      totalEpisodes: animeData.episodeCount,
    };
  }

  // Récupérer la source vidéo pour cet épisode
  const videoData = getVideoSource(animeId, episodeNumber);
  if (videoData) {
    currentEpisode.value = episodeNumber;
    episodeInfo.value = {
      number: videoData.episode,
      title: videoData.title,
      videoUrl: videoData.videoUrl,
      videoType: videoData.videoType,
      poster: videoData.poster,
    };

    // Configuration du lecteur vidéo
    videoSource.value = videoData.videoUrl;
    videoType.value = videoData.videoType;
    posterImage.value = videoData.poster || animeInfo.value?.poster || '';
  } else {
    // Fallback si pas de source vidéo trouvée
    currentEpisode.value = episodeNumber;
    episodeInfo.value = {
      number: episodeNumber,
      title: `Épisode ${episodeNumber}`,
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoType: 'video/mp4',
    };

    videoSource.value = episodeInfo.value.videoUrl;
    videoType.value = episodeInfo.value.videoType;
    posterImage.value = animeInfo.value?.poster || '';
  }
};

const goToNextEpisode = () => {
  if (hasNextEpisode.value) {
    const newEpisode = currentEpisode.value + 1;
    router.push({
      name: 'VideoWatch',
      params: {
        animeId: animeInfo.value?.id,
        episode: newEpisode.toString(),
      },
    });
  }
};

const goBack = () => {
  router.back();
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
  loadAnimeData();

  await nextTick();

  // Forcer le focus spatial sur la section au montage
  SpatialNavigation.focus('video-controls');
});

// Watchers pour les changements de route
watch(
  () => route.params.episode,
  () => {
    loadAnimeData();
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
