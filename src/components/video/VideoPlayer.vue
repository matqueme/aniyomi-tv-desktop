<template>
  <div
    class="video-player-container relative flex h-full w-full items-center justify-center bg-black"
    @mousemove="onMouseMove"
    @click="clickTogglePlayPause"
    @keyup="handleKeyUp"
  >
    <!-- Bouton de retour en haut à gauche -->
    <VideoBackButton
      :visible="showCustomControls"
      :controls-visible="controlsVisible"
      :is-playing="isPlaying"
      :focused-control="focusedControl"
      @go-back="emit('goBack')"
      @control-focus="onControlFocus"
    />

    <!-- Lecteur vidéo -->
    <div ref="videoContainer" class="video-container aspect-video w-full">
      <video
        ref="videoRef"
        class="video-js vjs-theme-forest h-full w-full"
        controls
        preload="auto"
        data-setup="{}"
      >
        <p class="vjs-no-js">
          Pour voir cette vidéo, vous devez activer JavaScript et utiliser un
          navigateur qui
          <a href="https://videojs.com/html5-video-support/" target="_blank"
            >supporte la vidéo HTML5</a
          >.
        </p>
      </video>
    </div>

    <!-- Indicateur de seek -->
    <VideoSeekIndicator
      :visible="showSeekIndicator"
      :direction="seekDirection"
    />

    <!-- Contrôles personnalisés -->
    <VideoControls
      :visible="showCustomControls"
      :controls-visible="controlsVisible"
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      :focused-control="focusedControl"
      :anime-title="animeTitle"
      :current-episode="currentEpisode"
      :has-next-episode="hasNextEpisode"
      @toggle-play-pause="togglePlayPause"
      @toggle-fullscreen="toggleFullscreen"
      @next-episode="emit('nextEpisode')"
      @seek="seekToTime"
      @control-focus="onControlFocus"
    />

    <!-- Overlays de chargement et d'erreur -->
    <VideoOverlays :is-loading="isLoading" :error="error" @retry="retry" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import VideoBackButton from './VideoBackButton.vue';
import VideoSeekIndicator from './VideoSeekIndicator.vue';
import VideoControls from './VideoControls.vue';
import VideoOverlays from './VideoOverlays.vue';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';
import { usePlatform } from '@/composables/usePlatform';

// Détection de plateforme
const { isTv } = usePlatform();

// Types
interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoplay?: boolean;
  showCustomControls?: boolean;
  // Nouveaux props pour la navigation d'épisodes
  hasNextEpisode?: boolean;
  currentEpisode?: number;
  animeTitle?: string;
}

// Props
const props = withDefaults(defineProps<VideoPlayerProps>(), {
  type: 'application/x-mpegURL',
  poster: '',
  autoplay: false,
  showCustomControls: true,
  hasNextEpisode: false,
  currentEpisode: 1,
  animeTitle: '',
});

// Émissions d'événements
const emit = defineEmits<{
  ready: [];
  play: [];
  pause: [];
  ended: [];
  error: [error: string];
  timeupdate: [currentTime: number];
  // Nouveaux événements pour la navigation
  nextEpisode: [];
  goBack: [];
}>();

// Références
const videoRef = ref<HTMLVideoElement>();
const videoContainer = ref<HTMLDivElement>();

// État du composant
const player = ref<ReturnType<typeof videojs> | null>(null);
const isLoading = ref(true);
const error = ref<string>('');
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(false);
const controlsVisible = ref(true);
const focusedControl = ref<string>('playPause');

// Nouveaux états pour les indicateurs visuels
const showSeekIndicator = ref(false);
const seekDirection = ref<'forward' | 'backward'>('forward');
const seekIndicatorTimeout = ref<number | null>(null);

// Timeout pour masquer les contrôles
let hideControlsTimeout: number;

// Contrôles vidéo
const togglePlayPause = () => {
  if (!player.value) return;

  if (isPlaying.value) {
    player.value.pause();
    SpatialNavigation.focus('video-controls');
  } else {
    player.value.play();
    SpatialNavigation.focus('video-progress-bar');
  }
};

/**
 * Gestion du clic pour basculer play/pause
 * Permet de ne pas interférer avec la navigation spatiale
 * @param {MouseEvent} event - L'événement de clic
 * @returns {void}
 **/
const clickTogglePlayPause = (event: MouseEvent) => {
  if (event.detail !== 0) togglePlayPause();
};

const toggleFullscreen = () => {
  if (!player.value || isTv.value) return; // Désactiver sur TV
  if (player.value.isFullscreen()) {
    player.value.exitFullscreen();
  } else {
    player.value.requestFullscreen();
  }
};

const seekToTime = (time: number) => {
  if (!player.value) return;
  player.value.currentTime(time);
};

const retry = () => {
  error.value = '';
  initializePlayer();
};

// Gestion des événements de focus pour la navigation spatiale
const onControlFocus = (controlName: string) => {
  focusedControl.value = controlName;
  showControls();
  // Pour le bouton de retour, on s'assure qu'il reste visible plus longtemps
  if (controlName === 'back') {
    controlsVisible.value = true;
  }
};

// Navigation spatiale améliorée - gestion des touches qui n'interfèrent pas avec la navigation
const handleKeyUp = (event: KeyboardEvent) => {
  // Empêcher le handler global si le focus est sur un bouton de contrôle vidéo
  const active = document.activeElement;
  if (active && active.tagName === 'BUTTON' && event.code === 'Enter') return;

  // Gestion des touches spéciales globales qui ne sont pas des flèches directionnelles
  switch (event.code) {
    case 'Escape':
      event.preventDefault();
      if (!isTv.value && player.value?.isFullscreen()) {
        player.value.exitFullscreen();
      }
      break;
    case 'Enter':
    case 'Space':
      event.preventDefault();
      togglePlayPause();
      showControls();
      break;
    case 'KeyF':
      // Fullscreen uniquement sur desktop
      if (!isTv.value) {
        event.preventDefault();
        toggleFullscreen();
        showControls();
      }
      break;
    case 'KeyJ':
      // Reculer de 10 secondes avec J
      event.preventDefault();
      if (player.value) {
        const newTime = Math.max(0, currentTime.value - 10);
        player.value.currentTime(newTime);
        showSeekFeedback('backward');
        showControls();
      }
      break;
    case 'KeyL':
      // Avancer de 10 secondes avec L
      event.preventDefault();
      if (player.value) {
        const newTime = Math.min(duration.value, currentTime.value + 10);
        player.value.currentTime(newTime);
        showSeekFeedback('forward');
        showControls();
      }
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      // Seulement si on est focalisé sur la barre de progression
      if (focusedControl.value === 'progress') {
        event.preventDefault();
        const direction = event.code === 'ArrowRight' ? 1 : -1;
        const newTime = Math.max(
          0,
          Math.min(duration.value, currentTime.value + direction * 10)
        );
        player.value?.currentTime(newTime);
        showSeekFeedback(direction > 0 ? 'forward' : 'backward');
        showControls();
      }
      // Sinon, ne pas empêcher l'événement pour laisser la navigation spatiale fonctionner
      break;
    case 'Digit0':
    case 'Digit1':
    case 'Digit2':
    case 'Digit3':
    case 'Digit4':
    case 'Digit5':
    case 'Digit6':
    case 'Digit7':
    case 'Digit8':
    case 'Digit9': {
      // Navigation par pourcentage (0-9 = 0%-90%)
      event.preventDefault();
      const digit = parseInt(event.code.replace('Digit', ''));
      const targetTime = (digit / 10) * duration.value;
      player.value?.currentTime(targetTime);
      showControls();
      break;
    }
    case 'Numpad0':
    case 'Numpad1':
    case 'Numpad2':
    case 'Numpad3':
    case 'Numpad4':
    case 'Numpad5':
    case 'Numpad6':
    case 'Numpad7':
    case 'Numpad8':
    case 'Numpad9': {
      // Navigation par pourcentage (Numpad0-9 = 0%-90%)
      event.preventDefault();
      const digit = parseInt(event.code.replace('Numpad', ''));
      const targetTime = (digit / 10) * duration.value;
      player.value?.currentTime(targetTime);
      showControls();
      break;
    }
  }
};

// Fonction pour afficher l'indicateur de seek
const showSeekFeedback = (direction: 'forward' | 'backward') => {
  seekDirection.value = direction;
  showSeekIndicator.value = true;
  if (seekIndicatorTimeout.value) {
    clearTimeout(seekIndicatorTimeout.value);
  }
  seekIndicatorTimeout.value = window.setTimeout(() => {
    showSeekIndicator.value = false;
  }, 600);
};

// Gestion de la visibilité des contrôles (plus smooth)
const showControls = () => {
  controlsVisible.value = true;
  clearTimeout(hideControlsTimeout);
  hideControlsTimeout = window.setTimeout(() => {
    if (isPlaying.value) {
      SpatialNavigation.focus('video-progress-bar');
      controlsVisible.value = false;
      clearTimeout(hideControlsTimeout);
    }
  }, 4000);
};

// Gestion du mouvement de la souris
const onMouseMove = () => {
  showControls();
};

// Initialisation du lecteur
const initializePlayer = async () => {
  if (!videoRef.value) return;

  try {
    isLoading.value = true;
    error.value = '';

    // Configuration Video.js
    const options = {
      fluid: false,
      responsive: false,
      fill: true,
      controls: !props.showCustomControls,
      autoplay: props.autoplay,
      preload: 'auto',
      poster: props.poster,
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
      },
      sources: [
        {
          src: props.src,
          type: props.type,
        },
      ],
    };

    player.value = videojs(videoRef.value, options);

    // Événements du lecteur
    player.value.ready(() => {
      isLoading.value = false;
      emit('ready');
    });

    player.value.on('play', () => {
      isPlaying.value = true;
      showControls();
      emit('play');
    });

    player.value.on('pause', () => {
      isPlaying.value = false;
      showControls();
      emit('pause');
    });

    player.value.on('ended', () => {
      isPlaying.value = false;
      controlsVisible.value = true;
      emit('ended');
    });

    player.value.on('timeupdate', () => {
      if (player.value) {
        currentTime.value = player.value.currentTime() || 0;
        emit('timeupdate', currentTime.value);
      }
    });

    player.value.on('durationchange', () => {
      if (player.value) {
        duration.value = player.value.duration() || 0;
      }
    });

    player.value.on('volumechange', () => {
      if (player.value) {
        volume.value = player.value.volume() || 0;
        isMuted.value = player.value.muted() || false;
      }
    });

    // Définir le volume à 100% au démarrage
    player.value.volume(1);
    player.value.muted(false);

    player.value.on('error', () => {
      const errorMessage = 'Erreur lors de la lecture de la vidéo';
      error.value = errorMessage;
      isLoading.value = false;
      emit('error', errorMessage);
    });

    await nextTick();

    // Le focus sera géré par les sous-composants
    focusedControl.value = 'playPause';
  } catch (err) {
    console.error("Erreur lors de l'initialisation du lecteur:", err);
    error.value = "Impossible d'initialiser le lecteur vidéo";
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  initializePlayer();
});

onUnmounted(() => {
  if (player.value) {
    player.value.dispose();
  }
  clearTimeout(hideControlsTimeout);
  if (seekIndicatorTimeout.value) {
    clearTimeout(seekIndicatorTimeout.value);
  }
});

// Watchers
watch(
  () => props.src,
  () => {
    if (player.value) {
      player.value.src({
        src: props.src,
        type: props.type,
      });
    }
  }
);
</script>

<style scoped>
.video-player-container {
  outline: none;
  background: #000000;
}

/* Style Video.js personnalisé */
.vjs-theme-forest {
  --vjs-theme-forest--primary: #6366f1;
  --vjs-theme-forest--secondary: #1e293b;
}

.video-js {
  border-radius: 0;
  overflow: hidden;
  width: 100% !important;
  height: 100% !important;
}

/* Masquer les contrôles natifs de Video.js */
.video-js .vjs-control-bar {
  display: v-bind('props.showCustomControls ? "none" : "flex"');
}

/* Pour les petits écrans - conteneur vidéo */
.video-container {
  width: 100vw !important;
  max-width: 100vw;
  height: auto !important;
  max-height: 100vh;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pour les petits écrans - style de la vidéo */
.video-js .vjs-tech {
  object-fit: contain;
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw;
  max-height: 100vh;
  position: static;
}

/* Focus indicators pour la navigation spatiale */
[data-sn-focusable]:focus {
  outline: none;
}

/* Amélioration des transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
