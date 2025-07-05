<template>
  <div
    :class="[
      'anime-card group cursor-pointer transition-all duration-300',
      'relative overflow-hidden rounded-lg bg-slate-800/30',
      'border-2 transition-all duration-300',
      'focus-none',
      isFocused
        ? 'scale-105 border-indigo-400 shadow-lg shadow-indigo-500/20'
        : 'border-slate-600/40',
      'hover:border-indigo-400/70 hover:shadow-lg hover:shadow-indigo-500/15',
      'backdrop-blur-sm',
    ]"
    :data-focused="isFocused"
    tabindex="0"
    @click="handleClick"
    @keyup="handlekeydup"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Image principale -->
    <div class="relative h-full w-full">
      <img
        :src="anime.posterUrl"
        :alt="anime.title"
        :class="[
          'h-full w-full object-cover transition-transform duration-300 ease-out',
        ]"
        loading="lazy"
      />
      <!-- Overlay simplifié -->
      <div
        :class="[
          'absolute inset-0 bg-gradient-to-t from-black/85 to-transparent',
          'transition-opacity duration-300',
          'group-hover:from-black/75',
          isFocused ? 'from-black/75' : '',
        ]"
      ></div>
      <!-- Badge épisodes -->
      <div
        :class="[
          'absolute right-3 top-3 rounded-lg border backdrop-blur-md',
          'px-2.5 py-1 text-xs font-semibold transition-all duration-300',
          'border-slate-600/50 bg-black/60 text-slate-200',
          'group-hover:border-indigo-400/70 group-hover:bg-indigo-500/80 group-hover:text-white',
          isFocused ? 'border-indigo-400/70 bg-indigo-500/80 text-white' : '',
        ]"
      >
        <span>{{ anime.episodeCount }} EP</span>
      </div>
    </div>
    <!-- Contenu textuel -->
    <div
      :class="[
        'absolute bottom-0 left-0 right-0 p-4 transition-all duration-300',
        'bg-gradient-to-t from-black/90 to-transparent',
        'translate-y-2 transform group-hover:translate-y-0',
        isFocused ? 'translate-y-0' : '',
      ]"
    >
      <h3
        :class="[
          'mb-2 line-clamp-1 text-base font-bold leading-tight text-white',
          'transition-colors duration-300',
          'group-hover:text-indigo-200',
          isFocused ? 'text-indigo-200' : '',
        ]"
      >
        {{ anime.title }}
      </h3>
      <div class="flex items-center justify-between">
        <span
          :class="[
            'text-sm font-medium transition-colors duration-300',
            'text-slate-300 group-hover:text-indigo-300',
            isFocused ? 'text-indigo-300' : '',
          ]"
        >
          {{ anime.year }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from '@/types/anime';

interface Props {
  anime: Anime;
  isFocused?: boolean;
}

interface Emits {
  (e: 'select', anime: Anime): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  emit('select', props.anime);
};

const handleFocus = () => {
  emit('focus');
};

const handleBlur = () => {
  emit('blur');
};

const handlekeydup = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('select', props.anime);
  }
};
</script>

<style scoped>
.anime-card {
  width: 320px;
  min-width: 320px;
  height: 180px;
  max-height: 180px;
  flex-shrink: 0;
}

/* Utilitaire pour limiter le texte à 1 ligne */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Optimisation des performances */
.anime-card {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Animation de l'image au hover */
.anime-card img {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.3s ease;
  filter: brightness(0.9);
  transform-origin: center center;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.anime-card:hover img,
.anime-card.focused img {
  filter: brightness(1);
  transform: scale(1.1) translateZ(0);
}
</style>
