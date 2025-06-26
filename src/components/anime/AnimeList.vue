<template>
  <div class="mb-2 box-border max-w-screen">
    <h2 class="mb-4 ml-4 text-2xl font-bold text-white">{{ title }}</h2>
    <div
      ref="listContainer"
      class="flex gap-6 overflow-x-visible scroll-smooth p-4 transition-transform duration-300 ease-out"
      :style="{ transform: `translateX(${scrollOffset}px)` }"
    >
      <AnimeCard
        v-for="(anime, index) in animes"
        :key="anime.id"
        :anime="anime"
        :is-focused="index === focusedIndex && isActive"
        @select="(anime) => emit('select', anime)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { readonly } from 'vue';
import type { Anime } from '@/types/anime';
import AnimeCard from '@/components/anime/AnimeCard.vue';
import { useAnimeListNavigation } from '@/composables/useAnimeListNavigation';

interface Props {
  animes: Anime[];
  title: string;
  itemsPerRow?: number;
  listId?: string;
}

interface Emits {
  (e: 'select', anime: Anime): void;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerRow: 6,
  listId: () => `list-${Math.random().toString(36).substr(2, 9)}`, // ID auto-généré
});

const emit = defineEmits<Emits>();

// Utilisation du composable pour la navigation
const {
  focusedIndex,
  scrollOffset,
  listContainer,
  isActive,
  activate,
  deactivate,
  focusOnLastRow,
  focusOnFirstRow,
} = useAnimeListNavigation({
  animes: props.animes,
  title: props.title,
  itemsPerRow: props.itemsPerRow,
  listId: props.listId,
  onSelect: (anime) => emit('select', anime),
});

// Méthodes exposées
defineExpose({
  activate,
  deactivate,
  focusOnLastRow,
  focusOnFirstRow,
  focusedIndex: readonly(focusedIndex),
  isActive: readonly(isActive),
});
</script>

<style scoped>
.grid {
  transition: transform 0.3s ease-in-out;
}
</style>
