<template>
  <div v-focus-section:results.default="resultsSectionConfig" class="w-full">
    <div
      v-if="animes.length > 0"
      class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
    >
      <div
        v-for="anime in animes"
        :key="anime.id"
        ref="animeCardRefs"
        v-focus
        v-focus-events="{
          'enter-up': () => handleSelect(anime),
          focused: () => setFocusedAnime(anime.id),
          unfocused: () => setFocusedAnime(null),
        }"
        class="group cursor-pointer transition-all duration-300 ease-in-out focus-none"
        :class="[
          focusedAnimeId === anime.id
            ? 'scale-[1.05] transform'
            : 'hover:scale-[1.02]',
        ]"
        @click="() => handleSelect(anime)"
      >
        <!-- Image de l'anime -->
        <div
          class="relative mb-3 overflow-hidden rounded-lg transition-all duration-300"
          :class="[
            focusedAnimeId === anime.id
              ? 'shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900'
              : '',
          ]"
        >
          <img
            :src="anime.posterUrl"
            :alt="anime.title"
            class="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            :class="[focusedAnimeId === anime.id ? 'brightness-110' : '']"
          />

          <!-- Overlay au focus -->
          <div
            v-if="focusedAnimeId === anime.id"
            class="absolute inset-0 bg-indigo-500/10"
          />
        </div>

        <!-- Titre de l'anime -->
        <h3
          class="text-sm font-medium text-slate-300 transition-colors duration-200 group-hover:text-slate-200"
          :class="[focusedAnimeId === anime.id ? 'text-indigo-200' : '']"
        >
          {{ anime.title }}
        </h3>

        <!-- Année si disponible -->
        <p
          v-if="anime.year"
          class="text-xs text-slate-500 transition-colors duration-200"
          :class="[focusedAnimeId === anime.id ? 'text-indigo-300' : '']"
        >
          {{ anime.year }}
        </p>
      </div>
    </div>

    <!-- Message si aucun résultat -->
    <div v-else class="py-16 text-center">
      <ph-file-x class="mx-auto mb-4 text-slate-500" :size="64" />
      <h3 class="mb-2 text-xl font-semibold text-slate-300">
        Aucun résultat trouvé
      </h3>
      <p class="text-slate-500">Essayez avec d'autres mots-clés</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PhFileX } from '@phosphor-icons/vue';
import type { AnimeCardInfo } from '@/types/anime';

// Props
interface Props {
  animes: AnimeCardInfo[];
}

defineProps<Props>();

// Émissions
const emit = defineEmits<{
  select: [anime: AnimeCardInfo];
}>();

// Refs
const animeCardRefs = ref<HTMLDivElement[]>([]);

// État
const focusedAnimeId = ref<string | null>(null);

// Configuration de la section spatiale
const resultsSectionConfig = ref({
  enterTo: 'default-element',
  leaveFor: {
    left: '@keyboard',
    up: '@header',
  },
});

// Méthodes
const setFocusedAnime = (animeId: string | null) => {
  focusedAnimeId.value = animeId;
};

const handleSelect = (anime: AnimeCardInfo) => {
  emit('select', anime);
};
</script>
