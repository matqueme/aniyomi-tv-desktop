<template>
  <div class="min-h-screen w-full bg-black">
    <!-- Loading State -->
    <div
      v-if="animeStore.loading"
      class="flex h-64 items-center justify-center"
    >
      <div class="text-xl text-white">Chargement des animes...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="animeStore.error"
      class="flex h-64 items-center justify-center"
    >
      <div class="text-xl text-red-500">{{ animeStore.error }}</div>
    </div>
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
          title="Tendances"
          @select="handleAnimeSelect"
          @navigate-up="navigateToList('up', 0)"
          @navigate-down="navigateToList('down', 0)"
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
          title="Tous les animes"
          @select="handleAnimeSelect"
          @navigate-up="navigateToList('up', 1)"
          @navigate-down="navigateToList('down', 1)"
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
          title="Action"
          @select="handleAnimeSelect"
          @navigate-up="navigateToList('up', 2)"
          @navigate-down="navigateToList('down', 2)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useAnimeStore } from '../stores/anime';
import type { Anime } from '../types/anime';
import AnimeList from '../components/AnimeList.vue';

const animeStore = useAnimeStore();

// Références vers les composants AnimeList
const trendingListRef = ref<InstanceType<typeof AnimeList>>();
const allAnimesListRef = ref<InstanceType<typeof AnimeList>>();
const actionListRef = ref<InstanceType<typeof AnimeList>>();

// Références vers les sections pour le défilement
const trendingSectionRef = ref<HTMLElement>();
const allAnimesSectionRef = ref<HTMLElement>();
const actionSectionRef = ref<HTMLElement>();

// Index de la liste actuellement active
const activeListIndex = ref(0);

// Computed properties pour filtrer les animes par genre
const actionAnimes = computed(() =>
  animeStore.animes.filter((anime) => anime.genres.includes('Action'))
);

// Tableau des références de listes pour faciliter la navigation
const getActiveLists = () => {
  const lists: Array<{
    ref:
      | typeof trendingListRef
      | typeof allAnimesListRef
      | typeof actionListRef;
    sectionRef:
      | typeof trendingSectionRef
      | typeof allAnimesSectionRef
      | typeof actionSectionRef;
    hasItems: boolean;
  }> = [];

  if (animeStore.trendingAnimes.length > 0) {
    lists.push({
      ref: trendingListRef,
      sectionRef: trendingSectionRef,
      hasItems: true,
    });
  }
  if (animeStore.animes.length > 0) {
    lists.push({
      ref: allAnimesListRef,
      sectionRef: allAnimesSectionRef,
      hasItems: true,
    });
  }
  if (actionAnimes.value.length > 0) {
    lists.push({
      ref: actionListRef,
      sectionRef: actionSectionRef,
      hasItems: true,
    });
  }

  return lists;
};

// Fonction pour faire défiler vers la section active
const scrollToActiveSection = (listIndex: number) => {
  const lists = getActiveLists();
  const targetSection = lists[listIndex]?.sectionRef?.value;

  if (!targetSection) return;

  // Calculer la position pour centrer la section
  const sectionTop = targetSection.offsetTop;
  const sectionHeight = targetSection.offsetHeight;
  const windowHeight = window.innerHeight;

  // Position pour centrer la section (ou la mettre en haut si elle est trop grande)
  const centerPosition = sectionTop - (windowHeight - sectionHeight) / 2;
  const finalPosition = Math.max(0, centerPosition);

  // Défilement fluide vers la position calculée
  window.scrollTo({
    top: finalPosition,
    behavior: 'smooth',
  });
};

// Navigation entre les listes
const navigateToList = (direction: 'up' | 'down', currentListIndex: number) => {
  const lists = getActiveLists();

  if (lists.length <= 1) return; // Pas de navigation si une seule liste

  const currentList = lists[currentListIndex]?.ref?.value;
  if (!currentList) return;

  let newIndex: number;

  if (direction === 'up') {
    newIndex = currentListIndex > 0 ? currentListIndex - 1 : lists.length - 1;
  } else {
    newIndex = currentListIndex < lists.length - 1 ? currentListIndex + 1 : 0;
  }

  const newList = lists[newIndex]?.ref?.value;
  if (!newList) return;
  console.log(
    `Navigation ${direction}: de la liste ${currentListIndex} vers la liste ${newIndex}`
  );

  // Faire défiler vers la nouvelle section
  scrollToActiveSection(newIndex);

  // Désactiver la liste actuelle
  currentList.deactivate();

  // Activer la nouvelle liste
  if (direction === 'up') {
    // Aller à la dernière ligne de la nouvelle liste
    newList.activate();
    setTimeout(() => newList.focusOnLastRow(), 50);
  } else {
    // Aller à la première ligne de la nouvelle liste
    newList.activate();
    setTimeout(() => newList.focusOnFirstRow(), 50);
  }

  activeListIndex.value = newIndex;
};

// Gestion de la sélection d'anime
const handleAnimeSelect = (anime: Anime) => {
  console.log('Anime sélectionné:', anime);
  animeStore.setFeaturedAnime(anime);
  // Ici vous pouvez naviguer vers une page de détail
  // router.push(`/anime/${anime.id}`);
};

// Initialiser la navigation
const initializeNavigation = () => {
  const lists = getActiveLists();

  console.log(`Initialisation de la navigation avec ${lists.length} listes`);

  // Désactiver toutes les listes
  lists.forEach((list, index) => {
    console.log(`Désactivation de la liste ${index}`);
    list.ref?.value?.deactivate();
  });
  // Activer la première liste disponible
  if (lists.length > 0) {
    console.log('Activation de la première liste');
    lists[0].ref?.value?.activate();
    activeListIndex.value = 0;

    // Faire défiler vers la première section
    setTimeout(() => {
      scrollToActiveSection(0);
    }, 100);
  }
};

// Lifecycle
onMounted(async () => {
  // Charger les données au montage du composant
  await Promise.all([animeStore.fetchAnimes()]);

  // Définir un anime featured par défaut
  if (animeStore.animes.length > 0 && !animeStore.featuredAnime) {
    animeStore.setFeaturedAnime(
      animeStore.trendingAnimes[0] || animeStore.animes[0]
    );
  }
  // Initialiser la navigation après le rendu
  setTimeout(() => {
    console.log('Initialisation de la navigation...');
    initializeNavigation();
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
