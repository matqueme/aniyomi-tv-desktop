<template>
  <div class="min-h-screen w-full bg-transparent">
    <!-- Header de recherche -->
    <div class="px-6 pt-6 pb-4">
      <div class="mb-6 flex items-center gap-4">
        <button
          ref="backButtonRef"
          class="flex items-center justify-center rounded-lg border p-3 text-slate-400 transition-all duration-300 ease-in-out hover:text-slate-200 focus:outline-none"
          :class="[
            isBackButtonFocused
              ? 'scale-[1.05] border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
              : 'border-slate-600/40 hover:border-indigo-500/40 hover:bg-indigo-500/10',
          ]"
          @click="goBack"
        >
          <ph-arrow-left :size="24" />
        </button>

        <h1 class="text-3xl font-bold text-slate-200">Recherche</h1>
      </div>

      <!-- Barre de recherche principale -->
      <div class="max-w-2xl">
        <div
          class="relative flex items-center rounded-xl border px-6 py-4 transition-all duration-300 ease-in-out"
          :class="[
            isSearchFocused
              ? 'scale-[1.01] border-indigo-500 bg-slate-800/90 shadow-lg shadow-indigo-500/20'
              : 'border-slate-600/40 bg-slate-800/60',
          ]"
        >
          <ph-magnifying-glass
            class="mr-4 flex-shrink-0 text-slate-400"
            :size="24"
          />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Tapez pour rechercher des animes..."
            class="flex-1 border-none bg-transparent text-lg text-slate-200 placeholder-slate-500 outline-none"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            ref="clearButtonRef"
            class="ml-4 cursor-pointer rounded p-2 text-slate-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-slate-200 focus:outline-none"
            :class="[
              isClearButtonFocused
                ? 'scale-[1.05] bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
                : '',
            ]"
            @click="clearSearch"
          >
            <ph-x :size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu de recherche -->
    <div class="px-6 pb-12">
      <!-- Message d'accueil -->
      <div v-if="!searchQuery && !hasSearched" class="py-16 text-center">
        <ph-magnifying-glass class="mx-auto mb-4 text-slate-500" :size="64" />
        <h2 class="mb-2 text-xl font-semibold text-slate-300">
          Recherchez vos animes préférés
        </h2>
        <p class="text-slate-500">
          Utilisez la barre de recherche ci-dessus pour trouver des animes
        </p>
      </div>

      <!-- Indicateur de chargement -->
      <div v-else-if="isSearching" class="py-16 text-center">
        <LoadingSpinner title="Recherche en cours..." />
      </div>

      <!-- Aucun résultat -->
      <div
        v-else-if="hasSearched && searchResults.length === 0"
        class="py-16 text-center"
      >
        <ph-file-x class="mx-auto mb-4 text-slate-500" :size="64" />
        <h2 class="mb-2 text-xl font-semibold text-slate-300">
          Aucun résultat trouvé
        </h2>
        <p class="text-slate-500">Essayez avec d'autres mots-clés</p>
      </div>

      <!-- Résultats de recherche -->
      <div v-else-if="searchResults.length > 0" class="space-y-8">
        <div>
          <h2 class="mb-4 text-xl font-semibold text-slate-300">
            {{ searchResults.length }} résultat{{
              searchResults.length > 1 ? 's' : ''
            }}
            pour "{{ searchQuery }}"
          </h2>

          <AnimeList
            ref="searchResultsListRef"
            :animes="searchResults"
            :list-id="'search-results'"
            title=""
            @select="handleAnimeSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  PhArrowLeft,
  PhMagnifyingGlass,
  PhX,
  PhFileX,
} from '@phosphor-icons/vue';
import { useAnimeStore } from '@/stores/anime';
import { useNavigationStore } from '@/stores/navigation';
import { useTVNavigation } from '@/composables/useTVNavigation';
import AnimeList from '@/components/anime/AnimeList.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import type { Anime } from '@/types/anime';

// Options du composant pour éviter l'erreur ESLint
defineOptions({
  name: 'SearchPage',
});

const router = useRouter();
const animeStore = useAnimeStore();
const navigationStore = useNavigationStore();

// Récupérer le terme de recherche depuis l'URL
const route = router.currentRoute;
const initialSearchQuery = (route.value.query.q as string) || '';

// Refs pour les éléments focusables
const backButtonRef = ref<HTMLButtonElement>();
const searchInputRef = ref<HTMLInputElement>();
const clearButtonRef = ref<HTMLButtonElement>();
const searchResultsListRef = ref<InstanceType<typeof AnimeList>>();

// État de la recherche
const searchQuery = ref(initialSearchQuery);
const searchResults = ref<Anime[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);

// État du focus pour chaque élément (navigation TV simple)
const currentFocusIndex = ref(1); // Commencer sur la barre de recherche
const isInSearchResults = ref(false); // Flag pour savoir si on navigue dans les résultats
const maxFocusIndex = computed(() => {
  let max = 1; // back button (0) + search input (1)
  if (searchQuery.value) max++; // clear button
  return max;
});

// Fonctions de navigation
const navigateToNavbar = () => {
  // Utiliser la navigation globale du store
  navigationStore.navigateUp();
};

const navigateToSearchResults = () => {
  if (searchResults.value.length > 0) {
    // Marquer qu'on passe à la navigation globale
    isInSearchResults.value = true;
    // Utiliser la navigation globale du store
    navigationStore.navigateDown();
  }
};

// Navigation TV avec handlers personnalisés
useTVNavigation({
  onUp: () => {
    if (isInSearchResults.value) {
      // Si on est dans les résultats, on peut soit rester dans les résultats soit revenir à la navigation locale
      const canNavigateUp =
        navigationStore.activeElement?.navigateUp !== undefined;
      if (!canNavigateUp) {
        // Sortir des résultats et revenir à la navigation locale
        isInSearchResults.value = false;
        currentFocusIndex.value = maxFocusIndex.value;
        updateFocus();
      } else {
        navigationStore.navigateUp();
      }
    } else if (currentFocusIndex.value > 0) {
      currentFocusIndex.value--;
      updateFocus();
    } else {
      // Si on est sur le premier élément (bouton retour), aller vers la navbar
      navigateToNavbar();
    }
  },
  onDown: () => {
    if (currentFocusIndex.value < maxFocusIndex.value) {
      currentFocusIndex.value++;
      updateFocus();
    } else if (searchResults.value.length > 0) {
      // Si on est sur le dernier élément et qu'il y a des résultats, aller vers la liste
      navigateToSearchResults();
    }
  },
  onLeft: () => {
    // Si on est dans la navigation globale (liste de résultats active)
    if (isInSearchResults.value) {
      navigationStore.navigateLeft();
    }
    // Sinon, pas de navigation horizontale locale
  },
  onRight: () => {
    // Si on est dans la navigation globale (liste de résultats active)
    if (isInSearchResults.value) {
      navigationStore.navigateRight();
    }
    // Sinon, pas de navigation horizontale locale
  },
  onSelect: () => {
    handleSelect();
  },
  onBack: () => {
    goBack();
  },
});

// États des éléments focusés
const isBackButtonFocused = computed(() => currentFocusIndex.value === 0);
const isSearchFocused = computed(() => currentFocusIndex.value === 1);
const isClearButtonFocused = computed(
  () => searchQuery.value && currentFocusIndex.value === 2
);

// Configuration de la navigation
onMounted(async () => {
  await nextTick();

  // Désactiver la navigation globale au début (on commence en navigation locale)
  if (navigationStore.isNavigationActive) {
    navigationStore.deactivateNavigation();
  }

  updateFocus();

  // Si il y a un terme de recherche initial, déclencher la recherche
  if (initialSearchQuery) {
    onSearchInput();
  }
});

const updateFocus = () => {
  switch (currentFocusIndex.value) {
    case 0:
      backButtonRef.value?.focus();
      break;
    case 1:
      searchInputRef.value?.focus();
      break;
    case 2:
      if (searchQuery.value) {
        clearButtonRef.value?.focus();
      }
      break;
  }
};

const handleSelect = () => {
  switch (currentFocusIndex.value) {
    case 0:
      goBack();
      break;
    case 1:
      // Input already focused
      break;
    case 2:
      if (searchQuery.value) {
        clearSearch();
      }
      break;
  }
};

// Ajuster l'index de focus quand le bouton clear apparaît/disparaît
watch(searchQuery, (newValue, oldValue) => {
  const hadClearButton = !!oldValue;
  const hasClearButton = !!newValue;

  if (!hadClearButton && hasClearButton) {
    // Clear button vient d'apparaître
  } else if (hadClearButton && !hasClearButton) {
    // Clear button vient de disparaître
    if (currentFocusIndex.value > 1) {
      currentFocusIndex.value = 1; // Retour à la recherche
      updateFocus();
    }
  }
});

// Surveiller l'état de navigation global pour synchroniser notre état local
watch(
  () => navigationStore.activeElement,
  (newElement) => {
    if (newElement?.id === 'search-results') {
      isInSearchResults.value = true;
    } else if (isInSearchResults.value) {
      // On a quitté les résultats de recherche
      isInSearchResults.value = false;
    }
  }
);

// Fonction de recherche avec debounce
let searchTimeout: number;

const onSearchInput = () => {
  clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    hasSearched.value = false;
    isSearching.value = false;
    return;
  }

  isSearching.value = true;

  searchTimeout = setTimeout(async () => {
    try {
      // Simulated search - replace with real API call
      const allAnimes = [...animeStore.animes, ...animeStore.trendingAnimes];
      const filtered = allAnimes.filter(
        (anime) =>
          anime.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          anime.description
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())
      );

      searchResults.value = filtered;
      hasSearched.value = true;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const clearSearch = async () => {
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;
  isSearching.value = false;

  await nextTick();
  updateFocus(); // Focus sur la barre de recherche
};

const goBack = () => {
  router.back();
};

const handleAnimeSelect = (anime: Anime) => {
  console.log('Anime sélectionné:', anime);
  // Ici vous pouvez naviguer vers la page de détail de l'anime
  // router.push(`/anime/${anime.id}`);
};
</script>
