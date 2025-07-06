<template>
  <div class="min-h-screen w-full bg-transparent pt-16" @keyup="handleKeyUp">
    <!-- Simple Loading State - Overlay sur tout -->
    <LoadingSpinner
      v-if="
        animeStore.loading ||
        animeStore.loadingPopular ||
        animeStore.loadingLatest
      "
      title="Chargement des anime..."
    />

    <!-- Message d'erreur -->
    <div
      v-if="
        animeStore.error &&
        !animeStore.loading &&
        !animeStore.loadingPopular &&
        !animeStore.loadingLatest
      "
      class="flex min-h-96 items-center justify-center"
    >
      <div
        class="mx-6 max-w-md rounded-lg border border-red-600 bg-red-900/50 p-6 text-center"
      >
        <h2 class="mb-2 text-xl font-bold text-red-200">
          Erreur de chargement
        </h2>
        <p class="mb-4 text-red-300">{{ animeStore.error }}</p>
        <button
          class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          @click="retryLoad"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Anime Lists -->
    <div v-else class="space-y-12 px-6 pb-12 pt-12">
      <!-- Animes Populaires (AnimeSama) -->
      <div
        v-if="animeStore.popularAnimes.length > 0"
        ref="popularSectionRef"
        class="anime-section"
      >
        <AnimeList
          ref="popularListRef"
          :animes="animeStore.popularAnimes"
          :list-id="'popular'"
          title="🔥 Animes Populaires (AnimeSama)"
          class="first-focusable"
          :leave-up-to="'navbar'"
          :leave-down-to="'latest'"
          @select="handleAnimeSelect"
        />
      </div>

      <!-- Dernières Mises à Jour (AnimeSama) -->
      <div
        v-if="animeStore.latestUpdates.length > 0"
        ref="latestSectionRef"
        class="anime-section"
      >
        <AnimeList
          ref="latestListRef"
          :animes="animeStore.latestUpdates"
          :list-id="'latest'"
          title="🆕 Dernières Mises à Jour (AnimeSama)"
          :leave-up-to="'popular'"
          :leave-down-to="'trending'"
          @select="handleAnimeSelect"
        />
      </div>

      <!-- Trending Animes -->
      <div
        v-if="animeStore.trendingAnimes.length > 0"
        ref="trendingSectionRef"
        class="anime-section"
      >
        <AnimeList
          ref="trendingListRef"
          :animes="animeStore.trendingAnimes"
          :list-id="'trending'"
          title="Tendances"
          :leave-up-to="'latest'"
          :leave-down-to="'all-animes'"
          @select="handleAnimeSelect"
        />
      </div>

      <!-- All Animes -->
      <div
        v-if="animeStore.animes.length > 0"
        ref="allAnimesSectionRef"
        class="anime-section"
      >
        <AnimeList
          ref="allAnimesListRef"
          :animes="animeStore.animes"
          :list-id="'all-animes'"
          title="Tous les animes"
          :leave-up-to="'trending'"
          :leave-down-to="'action'"
          @select="handleAnimeSelect"
        />
      </div>

      <!-- Action Animes -->
      <div
        v-if="actionAnimes.length > 0"
        ref="actionSectionRef"
        class="anime-section"
      >
        <AnimeList
          ref="actionListRef"
          :animes="actionAnimes"
          :list-id="'action'"
          title="Action"
          :leave-up-to="'all-animes'"
          @select="handleAnimeSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAnimeStore } from '@/stores/anime';
import type { Anime } from '@/types/anime';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import AnimeList from '@/components/anime/AnimeList.vue';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';
import { normalizeKeyboardEvent, isBackKey } from '@/utils/keyboardUtils';

const animeStore = useAnimeStore();
const router = useRouter();

// Références vers les composants AnimeList (maintenues pour compatibilité)
const popularListRef = ref<InstanceType<typeof AnimeList>>();
const latestListRef = ref<InstanceType<typeof AnimeList>>();
const trendingListRef = ref<InstanceType<typeof AnimeList>>();
const allAnimesListRef = ref<InstanceType<typeof AnimeList>>();
const actionListRef = ref<InstanceType<typeof AnimeList>>();

// Références vers les sections (maintenues pour compatibilité)
const popularSectionRef = ref<HTMLElement>();
const latestSectionRef = ref<HTMLElement>();
const trendingSectionRef = ref<HTMLElement>();
const allAnimesSectionRef = ref<HTMLElement>();
const actionSectionRef = ref<HTMLElement>();

// Computed properties pour filtrer les animes par genre
const actionAnimes = computed(() =>
  animeStore.animes.filter((anime) => anime.genres.includes('Action'))
);

// Gestion de la sélection d'anime
const handleAnimeSelect = (anime: Anime) => {
  animeStore.setFeaturedAnime(anime);
  router.push(`/anime/${anime.id}`);
};

// Fonction pour réessayer le chargement
const retryLoad = async () => {
  await animeStore.fetchAllData();
};

// Gestion du bouton retour de la télécommande
const handleKeyUp = (event: KeyboardEvent) => {
  const keyData = normalizeKeyboardEvent(event);

  if (isBackKey(keyData.code, keyData.keyCode)) {
    event.preventDefault();
    // Sur la page d'accueil, on ne fait rien ou on peut sortir de l'app si souhaité
    // Pour l'instant, on ne fait rien car c'est la page racine
    return;
  }
};

// Lifecycle
onMounted(async () => {
  // Charger toutes les données (mock + AnimeSama)
  await animeStore.fetchAllData();

  // Focus sur la première section après le chargement
  await nextTick();
  if (animeStore.popularAnimes.length > 0) {
    SpatialNavigation.focus('popular');
  } else if (animeStore.latestUpdates.length > 0) {
    SpatialNavigation.focus('latest');
  } else if (animeStore.trendingAnimes.length > 0) {
    SpatialNavigation.focus('trending');
  }
});
</script>

<style scoped>
.anime-section {
  scroll-margin-top: 2rem;
  transition: all 0.3s ease-in-out;
}
</style>
