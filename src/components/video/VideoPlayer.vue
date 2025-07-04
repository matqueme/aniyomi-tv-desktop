<template>
  <div
    ref="containerRef"
    class="video-player-container relative h-full w-full bg-black"
    tabindex="0"
    @keydown="handleKeyDown"
    @mousemove="onMouseMove"
    @click="togglePlayPause"
  >
    <!-- Bouton de retour en haut à gauche -->
    <div
      v-if="showCustomControls"
      v-focus-section:video-top-controls="topControlsConfig"
      class="absolute left-0 right-0 top-0 z-20"
    >
      <button
        ref="backButtonRef"
        v-focus
        v-focus-events="{
          'enter-up': () => emit('goBack'),
          focused: () => onControlFocus('back'),
          unfocused: () => onControlUnfocus(),
        }"
        class="absolute left-4 top-4 flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 p-3 font-medium text-slate-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-400/40 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-red-400/80 focus:bg-red-400/70 focus:text-white focus:shadow-[0_0_0_2px_rgba(248,113,113,0.3),0_8px_20px_rgba(248,113,113,0.25)] focus:outline-none"
        :class="{
          'opacity-0': !controlsVisible && isPlaying,
          'opacity-100': controlsVisible || !isPlaying,
          'scale-105 border-red-400/80 bg-red-400/70 text-white shadow-[0_0_0_2px_rgba(248,113,113,0.3),0_8px_20px_rgba(248,113,113,0.25)]':
            focusedControl === 'back',
        }"
        @click="() => emit('goBack')"
      >
        <PhArrowLeft :size="24" />
      </button>
    </div>

    <!-- Lecteur vidéo -->
    <div ref="videoContainer" class="video-container h-full w-full">
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

    <!-- Indicateurs visuels style Netflix -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <!-- Indicateur de seek -->
      <div
        v-if="showSeekIndicator"
        class="seek-indicator flex items-center justify-center rounded-lg bg-black/50 px-4 py-3 backdrop-blur-sm transition-all duration-300 ease-out"
      >
        <component
          :is="seekDirection === 'forward' ? PhFastForward : PhRewind"
          :size="28"
          class="text-white/90"
        />
        <span class="ml-2 text-base font-medium text-white/90">10s</span>
      </div>
    </div>

    <!-- Contrôles personnalisés modernes style Netflix -->
    <div
      v-if="showCustomControls"
      v-focus-section:video-controls="controlsConfig"
      class="custom-controls absolute inset-x-0 bottom-0 transition-all duration-500 ease-in-out"
      :class="{
        'translate-y-full opacity-0': !controlsVisible,
        'translate-y-0 opacity-100': controlsVisible,
      }"
    >
      <!-- Gradient backdrop -->
      <div
        class="controls-backdrop absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      ></div>

      <!-- Container des contrôles -->
      <div class="relative z-10 p-6 pb-8">
        <!-- Barre de progression moderne -->
        <div class="progress-container mb-6">
          <!-- Temps et infos -->
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center space-x-4 text-sm font-medium">
              <span class="text-white">{{ formatTime(currentTime) }}</span>
              <span class="text-slate-400">/</span>
              <span class="text-slate-300">{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div
            ref="progressBarRef"
            v-focus
            v-focus-events="{
              'enter-up': handleProgressClick,
              focused: () => onControlFocus('progress'),
              unfocused: () => onControlUnfocus(),
            }"
            class="progress-bar group relative h-1.5 cursor-pointer rounded-full bg-slate-600/60 backdrop-blur-sm transition-all duration-200 hover:h-2"
            :class="{
              'h-2 ring-2 ring-indigo-400 ring-offset-2 ring-offset-black/50':
                focusedControl === 'progress',
              'h-2': focusedControl === 'progress',
            }"
            @click="seekToPosition"
          >
            <!-- Buffer (optionnel) -->
            <div
              class="absolute inset-y-0 left-0 rounded-full bg-slate-500/40"
              style="width: 85%"
            ></div>

            <!-- Progress actuel -->
            <div
              class="progress-fill relative h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-lg transition-all duration-150"
              :style="{ width: progressPercentage + '%' }"
            >
              <!-- Thumb -->
              <div
                class="progress-thumb absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white shadow-lg transition-all duration-200 group-hover:scale-110"
                :class="{
                  'scale-125 shadow-indigo-500/50':
                    focusedControl === 'progress',
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Contrôles principaux -->
        <div class="flex items-center justify-between">
          <!-- Groupe de gauche: Play/Pause uniquement -->
          <div class="flex items-center space-x-3">
            <button
              ref="playPauseRef"
              v-focus
              v-focus-events="{
                'enter-up': togglePlayPause,
                focused: () => onControlFocus('playPause'),
                unfocused: () => onControlUnfocus(),
              }"
              class="flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 px-4 py-2 font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-400/50 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/80 focus:text-white focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
              :class="{
                'scale-105 border-indigo-600 bg-indigo-600/80 text-white shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                  focusedControl === 'playPause',
              }"
              @click="togglePlayPause"
            >
              <component :is="isPlaying ? PhPause : PhPlay" :size="20" />
            </button>
          </div>

          <!-- Informations anime/épisode au centre -->
          <div v-if="animeTitle && currentEpisode" class="text-center">
            <div class="text-sm font-semibold text-white">
              {{ animeTitle }} - Épisode {{ currentEpisode }}
            </div>
          </div>

          <!-- Groupe de droite: Episodes, Volume et plein écran -->
          <div class="flex items-center space-x-3">
            <!-- Navigation épisodes -->
            <div
              v-if="hasPreviousEpisode || hasNextEpisode"
              class="flex items-center space-x-2"
            >
              <button
                v-if="hasNextEpisode"
                ref="nextEpisodeRef"
                v-focus
                v-focus-events="{
                  'enter-up': () => emit('nextEpisode'),
                  focused: () => onControlFocus('nextEpisode'),
                  unfocused: () => onControlUnfocus(),
                }"
                class="flex items-center justify-center rounded-lg border border-indigo-600/50 bg-indigo-600/60 px-3 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-600 hover:bg-indigo-600/80 focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/90 focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
                :class="{
                  'scale-105 border-indigo-600 bg-indigo-600/90 shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                    focusedControl === 'nextEpisode',
                }"
                @click="() => emit('nextEpisode')"
              >
                <span class="mr-1 text-xs font-medium">Suivant</span>
                <PhCaretRight :size="20" />
              </button>
            </div>

            <button
              ref="fullscreenRef"
              v-focus
              v-focus-events="{
                'enter-up': toggleFullscreen,
                focused: () => onControlFocus('fullscreen'),
                unfocused: () => onControlUnfocus(),
              }"
              class="flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 px-4 py-2.5 font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-400/50 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/80 focus:text-white focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
              :class="{
                'scale-105 border-indigo-600 bg-indigo-600/80 text-white shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                  focusedControl === 'fullscreen',
              }"
              @click="toggleFullscreen"
            >
              <PhArrowsOut :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay de chargement moderne -->
    <div
      v-if="isLoading"
      class="loading-overlay absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md"
    >
      <LoadingSpinner />
      <p class="mt-4 text-lg font-medium text-slate-300">
        Chargement de la vidéo...
      </p>
    </div>

    <!-- Overlay d'erreur moderne -->
    <div
      v-if="error"
      class="error-overlay absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md"
    >
      <div class="max-w-md text-center">
        <div class="mb-6 flex justify-center">
          <div class="rounded-full bg-red-500/20 p-4">
            <PhWarning :size="48" class="text-red-400" />
          </div>
        </div>
        <h3 class="mb-3 text-2xl font-bold text-white">Erreur de lecture</h3>
        <p class="mb-6 leading-relaxed text-slate-300">{{ error }}</p>
        <button
          class="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          @click="retry"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  PhPlay,
  PhPause,
  PhRewind,
  PhFastForward,
  PhArrowsOut,
  PhWarning,
  PhCaretRight,
  PhArrowLeft,
} from '@phosphor-icons/vue';
import LoadingSpinner from '../ui/LoadingSpinner.vue';

// Types
interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoplay?: boolean;
  showCustomControls?: boolean;
  // Nouveaux props pour la navigation d'épisodes
  hasPreviousEpisode?: boolean;
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
  hasPreviousEpisode: false,
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
  previousEpisode: [];
  nextEpisode: [];
  goBack: [];
}>();

// Références
const containerRef = ref<HTMLDivElement>();
const videoRef = ref<HTMLVideoElement>();
const videoContainer = ref<HTMLDivElement>();
const progressBarRef = ref<HTMLDivElement>();
const playPauseRef = ref<HTMLButtonElement>();
const fullscreenRef = ref<HTMLButtonElement>();
const backButtonRef = ref<HTMLButtonElement>();
const nextEpisodeRef = ref<HTMLButtonElement>();

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

// Configuration pour la navigation spatiale
const controlsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@video-top-controls',
    down: '',
    left: '',
    right: '',
  },
  restrict: 'self-first',
}));

// Configuration pour les contrôles du haut (bouton croix)
const topControlsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@navbar',
    down: '@video-controls',
    left: '@navbar',
    right: '',
  },
  restrict: 'self-first',
}));

// Computed
const progressPercentage = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

// Méthodes utilitaires
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Contrôles vidéo
const togglePlayPause = () => {
  if (!player.value) return;

  if (isPlaying.value) {
    player.value.pause();
  } else {
    player.value.play();
  }
};

const toggleMute = () => {
  if (!player.value) return;
  player.value.muted(!player.value.muted());
};

const toggleFullscreen = () => {
  if (!player.value) return;
  if (player.value.isFullscreen()) {
    player.value.exitFullscreen();
  } else {
    player.value.requestFullscreen();
  }
};

const seekToPosition = (event: MouseEvent) => {
  if (!player.value || !progressBarRef.value) return;

  const rect = progressBarRef.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  player.value.currentTime(newTime);
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

const onControlUnfocus = () => {
  // On peut garder le focus visuel un moment après avoir quitté
  // focusedControl.value = '';
};

// Gestionnaire spécial pour la barre de progression
const handleProgressClick = () => {
  // Avancer de 10% quand on clique sur Entrée sur la barre de progression
  const newTime = Math.min(
    duration.value,
    currentTime.value + duration.value * 0.1
  );
  player.value?.currentTime(newTime);
};

// Navigation spatiale améliorée - gestion des touches qui n'interfèrent pas avec la navigation
const handleKeyDown = (event: KeyboardEvent) => {
  // Gestion des touches spéciales globales qui ne sont pas des flèches directionnelles
  switch (event.code) {
    case 'Escape':
      event.preventDefault();
      if (player.value?.isFullscreen()) {
        player.value.exitFullscreen();
      }
      break;
    case 'Space':
      event.preventDefault();
      togglePlayPause();
      showControls();
      break;
    case 'KeyF':
      event.preventDefault();
      toggleFullscreen();
      showControls();
      break;
    case 'KeyM':
      event.preventDefault();
      toggleMute();
      showControls();
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
      controlsVisible.value = false;
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

    // Focus automatiquement sur le bouton play/pause au démarrage
    if (playPauseRef.value) {
      playPauseRef.value.focus();
      focusedControl.value = 'playPause';
    }
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Bouton principal (Play/Pause) */
.control-button-primary {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-out;
  background-color: rgba(30, 41, 59, 0.6);
  color: rgb(226, 232, 240);
  border: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  backdrop-filter: blur(12px);
}

.control-button-primary:hover {
  background-color: rgba(51, 65, 85, 0.8);
  color: rgb(255, 255, 255);
  border-color: rgba(99, 102, 241, 0.5);
  transform: scale(1.02);
}

.control-button-primary.focused {
  background-color: rgba(99, 102, 241, 0.8);
  color: rgb(255, 255, 255);
  border-color: rgb(99, 102, 241);
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px rgb(99, 102, 241),
    0 8px 20px rgba(99, 102, 241, 0.4);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Boutons secondaires */
.control-button-secondary {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-out;
  background-color: rgba(30, 41, 59, 0.6);
  color: rgb(226, 232, 240);
  border: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  backdrop-filter: blur(12px);
}

/* Boutons d'épisodes */
.control-button-episode {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-out;
  background-color: rgba(99, 102, 241, 0.6);
  color: rgb(255, 255, 255);
  border: 1px solid rgba(99, 102, 241, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  backdrop-filter: blur(12px);
}

.control-button-episode:hover {
  background-color: rgba(99, 102, 241, 0.8);
  border-color: rgb(99, 102, 241);
  transform: scale(1.02);
}

.control-button-episode.focused {
  background-color: rgba(99, 102, 241, 0.9);
  border-color: rgb(99, 102, 241);
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px rgb(99, 102, 241),
    0 8px 20px rgba(99, 102, 241, 0.4);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Bouton de retour */
.control-button-back {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: rgba(30, 41, 59, 0.6);
  color: rgb(226, 232, 240);
  border: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease-out;
  font-weight: 500;
}

.control-button-back:hover {
  background-color: rgba(51, 65, 85, 0.8);
  color: rgb(255, 255, 255);
  border-color: rgba(248, 113, 113, 0.4);
  transform: scale(1.02);
}

.control-button-back.focused {
  background-color: rgba(248, 113, 113, 0.7);
  color: rgb(255, 255, 255);
  border-color: rgba(248, 113, 113, 0.8);
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px rgba(248, 113, 113, 0.3),
    0 8px 20px rgba(248, 113, 113, 0.25);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.control-button-secondary:hover {
  background-color: rgba(51, 65, 85, 0.8);
  color: rgb(255, 255, 255);
  border-color: rgba(99, 102, 241, 0.5);
}

.control-button-secondary.focused {
  background-color: rgba(99, 102, 241, 0.8);
  color: rgb(255, 255, 255);
  border-color: rgb(99, 102, 241);
  transform: scale(1.05);
  box-shadow:
    0 0 0 2px rgb(99, 102, 241),
    0 8px 20px rgba(99, 102, 241, 0.4);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Barre de progression */
.progress-bar {
  outline: none;
  transition: height 0.2s ease-out;
}

.progress-bar:hover .progress-thumb {
  transform: translateY(-50%) translateX(50%) scale(1.2);
}

.progress-fill {
  position: relative;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.progress-thumb {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(99, 102, 241, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

/* Animation des contrôles */
.custom-controls {
  transform-origin: bottom;
}

/* Masquer les contrôles natifs de Video.js */
.video-js .vjs-control-bar {
  display: v-bind('props.showCustomControls ? "none" : "flex"');
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

/* Forcer l'alignement en haut pour la vidéo */
.video-js .vjs-tech {
  object-fit: cover;
  object-position: top center;
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
}

/* Amélioration du backdrop blur */
.custom-controls::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 40%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
  backdrop-filter: blur(2px);
  z-index: -1;
}

.controls-backdrop {
  -webkit-mask-image: linear-gradient(to top, black 70%, transparent 100%);
  mask-image: linear-gradient(to top, black 70%, transparent 100%);
}

/* Animations d'entrée/sortie */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.custom-controls {
  animation: slideInUp 0.3s ease-out;
}

/* Style pour l'indicateur de seek */
@keyframes seekFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes seekFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.seek-indicator {
  animation: seekFadeIn 0.2s ease-out;
}

/* Responsive design pour mobile/TV */
@media (max-width: 768px) {
  .control-button-secondary {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .custom-controls {
    padding: 1rem;
    padding-bottom: 1.5rem;
  }
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
