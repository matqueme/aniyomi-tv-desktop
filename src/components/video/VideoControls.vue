<template>
  <div
    v-if="visible"
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
      <!-- Barre de progression -->
      <VideoProgressBar
        :current-time="currentTime"
        :duration="duration"
        :focused-control="focusedControl"
        @seek="(time) => emit('seek', time)"
        @control-focus="(control) => emit('controlFocus', control)"
      />

      <!-- Contrôles principaux -->
      <div
        v-focus-section:video-controls.default="controlsButtonsConfig"
        class="flex items-center justify-between"
      >
        <!-- Groupe de gauche: Play/Pause uniquement -->
        <div class="flex items-center space-x-3">
          <button
            ref="playPauseRef"
            v-focus
            v-focus-events="{
              'enter-up': () => emit('togglePlayPause'),
              focused: () => emit('controlFocus', 'playPause'),
            }"
            class="flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 px-4 py-2 font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-400/50 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/80 focus:text-white focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
            :class="{
              'scale-105 border-indigo-600 bg-indigo-600/80 text-white shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                focusedControl === 'playPause',
            }"
            @click="onPlayPauseClick"
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
          <div v-if="hasNextEpisode" class="flex items-center space-x-2">
            <button
              ref="nextEpisodeRef"
              v-focus
              v-focus-events="{
                'enter-up': () => emit('nextEpisode'),
                focused: () => emit('controlFocus', 'nextEpisode'),
              }"
              class="flex items-center justify-center rounded-lg border border-indigo-600/50 bg-indigo-600/60 px-3 py-2 font-medium text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-600 hover:bg-indigo-600/80 focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/90 focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
              :class="{
                'scale-105 border-indigo-600 bg-indigo-600/90 shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                  focusedControl === 'nextEpisode',
              }"
              @click="onNextEpisodeClick"
            >
              <span class="mr-1 text-xs font-medium">Suivant</span>
              <PhCaretRight :size="20" />
            </button>
          </div>

          <button
            v-if="!isTv"
            ref="fullscreenRef"
            v-focus
            v-focus-events="{
              'enter-up': () => emit('toggleFullscreen'),
              focused: () => emit('controlFocus', 'fullscreen'),
            }"
            class="flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 px-4 py-2.5 font-medium text-slate-200 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-indigo-400/50 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-indigo-600 focus:bg-indigo-600/80 focus:text-white focus:shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)] focus:outline-none"
            :class="{
              'scale-105 border-indigo-600 bg-indigo-600/80 text-white shadow-[0_0_0_2px_rgb(99,102,241),0_8px_20px_rgba(99,102,241,0.4)]':
                focusedControl === 'fullscreen',
            }"
            @click="onFullscreenClick"
          >
            <PhArrowsOut :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  PhPlay,
  PhPause,
  PhArrowsOut,
  PhCaretRight,
} from '@phosphor-icons/vue';
import VideoProgressBar from './VideoProgressBar.vue';
import { usePlatform } from '@/composables/usePlatform';

// Détection de plateforme
const { isTv } = usePlatform();

interface Props {
  visible: boolean;
  controlsVisible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  focusedControl: string;
  animeTitle?: string;
  currentEpisode?: number;
  hasNextEpisode?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  togglePlayPause: [];
  toggleFullscreen: [];
  nextEpisode: [];
  seek: [time: number];
  controlFocus: [control: string];
}>();

const playPauseRef = ref<HTMLButtonElement>();
const fullscreenRef = ref<HTMLButtonElement>();
const nextEpisodeRef = ref<HTMLButtonElement>();

const controlsButtonsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@video-progress-bar',
    down: '@video-bottom-controls',
    left: '',
    right: '',
  },
}));

function onPlayPauseClick(event: MouseEvent) {
  if (event.detail !== 0) emit('togglePlayPause');
}
function onNextEpisodeClick(event: MouseEvent) {
  if (event.detail !== 0) emit('nextEpisode');
}
function onFullscreenClick(event: MouseEvent) {
  if (event.detail !== 0) emit('toggleFullscreen');
}

defineExpose({
  playPauseRef,
  fullscreenRef,
  nextEpisodeRef,
});
</script>

<style scoped>
/* Animation des contrôles */
.custom-controls {
  transform-origin: bottom;
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

/* Responsive design pour mobile/TV */
@media (max-width: 768px) {
  .custom-controls {
    padding: 1rem;
    padding-bottom: 1.5rem;
  }
}
</style>
