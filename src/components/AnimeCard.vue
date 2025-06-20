<template>
  <div
    :class="[
      'anime-card cursor-pointer transition-all duration-300',
      'overflow-hidden rounded-lg bg-gray-800 shadow-lg',
      'hover:scale-105 hover:shadow-xl',
      isFocused ? 'scale-105 ring-4 ring-blue-500' : '',
    ]"
    @click="$emit('select', anime)"
  >
    <div class="relative aspect-[2/3]">
      <img
        :src="anime.posterUrl"
        :alt="anime.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        class="bg-opacity-75 absolute top-2 right-2 rounded bg-black px-2 py-1 text-sm text-white"
      >
        ⭐ {{ anime.rating }}
      </div>
      <div
        class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-4"
      >
        <h3 class="mb-1 truncate text-lg font-bold text-white">
          {{ anime.title }}
        </h3>
        <p class="mb-2 text-sm text-gray-300">
          {{ anime.year }} • {{ anime.episodeCount }} épisodes
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from '../types/anime';

interface Props {
  anime: Anime;
  isFocused?: boolean;
}

interface Emits {
  (e: 'select', anime: Anime): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.anime-card {
  width: 200px;
  min-width: 200px;
}
</style>
