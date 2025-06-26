<template>
  <div class="min-h-screen w-full bg-transparent">
    <!-- Simple Loading State - Overlay sur tout -->
    <LoadingSpinner v-if="animeStore.loading" title="Chargement des anime..." />

    <!-- Anime Lists -->
    <div v-else class="space-y-12 px-6 pt-12 pb-12">
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
          @select="handleAnimeSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useAnimeStore } from '@/stores/anime';
import { useNavigationStore } from '@/stores/navigation';
import { useTVNavigation } from '@/composables/useTVNavigation';
import type { Anime } from '@/types/anime';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import AnimeList from '@/components/anime/AnimeList.vue';

const animeStore = useAnimeStore();
const navigationStore = useNavigationStore();

// Utiliser le composable de navigation TV
useTVNavigation();

// Références vers les composants AnimeList (pour compatibilité si nécessaire)
const trendingListRef = ref<InstanceType<typeof AnimeList>>();
const allAnimesListRef = ref<InstanceType<typeof AnimeList>>();
const actionListRef = ref<InstanceType<typeof AnimeList>>();

// Références vers les sections pour le défilement
const trendingSectionRef = ref<HTMLElement>();
const allAnimesSectionRef = ref<HTMLElement>();
const actionSectionRef = ref<HTMLElement>();

// Computed properties pour filtrer les animes par genre
const actionAnimes = computed(() =>
  animeStore.animes.filter((anime) => anime.genres.includes('Action'))
);

// Fonction pour configurer le défilement vers les sections
const setupSectionScrolling = () => {
  const sectionRefs = [
    { id: 'trending', ref: trendingSectionRef },
    { id: 'all-animes', ref: allAnimesSectionRef },
    { id: 'action', ref: actionSectionRef },
  ];

  // Ajouter la fonction de défilement à chaque liste dans le store
  sectionRefs.forEach(({ id, ref }) => {
    const list = navigationStore.lists.find((l) => l.id === id);
    if (list && ref.value) {
      list.scrollToSection = () => {
        const sectionTop = ref.value!.offsetTop;
        const sectionHeight = ref.value!.offsetHeight;
        const windowHeight = window.innerHeight;
        const centerPosition = sectionTop - (windowHeight - sectionHeight) / 2;
        const finalPosition = Math.max(0, centerPosition);

        window.scrollTo({
          top: finalPosition,
          behavior: 'smooth',
        });
      };
    }
  });
};

// Gestion de la sélection d'anime
const handleAnimeSelect = (anime: Anime) => {
  console.log('Anime sélectionné:', anime);
  animeStore.setFeaturedAnime(anime);
  // Navigation vers une page de détail si nécessaire
  // router.push(`/anime/${anime.id}`);
};

// Lifecycle
onMounted(async () => {
  // Charger les données
  await animeStore.fetchAnimes();

  // Définir un anime featured par défaut
  if (animeStore.animes.length > 0 && !animeStore.featuredAnime) {
    animeStore.setFeaturedAnime(
      animeStore.trendingAnimes[0] || animeStore.animes[0]
    );
  }

  // Attendre que les composants soient montés et les listes enregistrées
  setTimeout(() => {
    setupSectionScrolling();
    navigationStore.initializeNavigation();
  }, 500);
});
</script>

<style scoped>
.anime-section {
  scroll-margin-top: 2rem;
  transition: all 0.3s ease-in-out;
}

/* Amélioration du défilement fluide */
html {
  scroll-behavior: smooth;
}

/* Effet de focus sur la section active */
.anime-section:focus-within {
  transform: scale(1.02);
  transition: transform 0.3s ease-in-out;
}
</style>
