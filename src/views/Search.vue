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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
const hasSearched = ref(false);

// État du focus pour chaque élément (navigation TV simple)
const currentFocusIndex = ref(1); // Commencer sur la barre de recherche
const isInSearchResults = ref(false); // Flag pour savoir si on navigue dans les résultats

// Navigation TV avec handlers pour la gestion des résultats de recherche
useTVNavigation({
  onSelect: () => {
    // Si on est dans les résultats, utiliser la navigation globale
    if (isInSearchResults.value) {
      navigationStore.handleSelect();
    } else {
      // Sinon utiliser la logique locale (sera gérée par l'élément enregistré)
      navigationStore.handleSelect();
    }
  },
  onBack: () => {
    goBack();
  },
});

// États des éléments focusés - tenant compte de l'état de navigation global
const isBackButtonFocused = computed(() => {
  return (
    navigationStore.activeElement?.id === 'search-navigation' &&
    currentFocusIndex.value === 0
  );
});

const isSearchFocused = computed(() => {
  return (
    navigationStore.activeElement?.id === 'search-input' &&
    currentFocusIndex.value === 1
  );
});

const isClearButtonFocused = computed(() => {
  return (
    navigationStore.activeElement?.id === 'search-input' &&
    searchQuery.value &&
    currentFocusIndex.value === 2
  );
});

// Configuration de la navigation
onMounted(async () => {
  await nextTick();

  // Créer un élément navigable pour la navigation (bouton retour)
  const navigationElement = {
    id: 'search-navigation',
    title: 'Navigation page',
    type: 'list' as const,
    activate: () => {
      isInSearchResults.value = false;
      currentFocusIndex.value = 0; // Focus sur le bouton retour
      updateFocus();
    },
    deactivate: () => {
      backButtonRef.value?.blur();
    },
    getFocusedIndex: () => 0,
    navigateLeft: () => {
      // Pas de navigation horizontale pour le bouton retour
    },
    navigateRight: () => {
      // Pas de navigation horizontale pour le bouton retour
    },
    navigateUp: () => {
      // Pas de navigation vers le haut depuis le bouton retour
    },
    navigateDown: () => {
      // Pas de navigation vers le bas depuis le bouton retour
    },
    handleSelect: () => {
      goBack();
    },
    scrollToSection: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  };

  // Créer un élément navigable pour la recherche (barre + bouton clear)
  const searchElement = {
    id: 'search-input',
    title: 'Barre de recherche',
    type: 'list' as const,
    activate: (startIndex = 0) => {
      isInSearchResults.value = false;
      // startIndex 0 = barre de recherche, 1 = bouton clear (si présent)
      const searchFocusIndex = startIndex === 0 ? 1 : searchQuery.value ? 2 : 1;
      currentFocusIndex.value = searchFocusIndex;
      updateFocus();
    },
    deactivate: () => {
      searchInputRef.value?.blur();
      clearButtonRef.value?.blur();
    },
    getFocusedIndex: () => {
      // Retourner l'index relatif à cette section (0 pour barre, 1 pour clear)
      return currentFocusIndex.value === 1
        ? 0
        : currentFocusIndex.value === 2
          ? 1
          : 0;
    },
    navigateLeft: () => {
      if (currentFocusIndex.value === 2 && searchQuery.value) {
        // Du bouton clear vers la barre de recherche
        currentFocusIndex.value = 1;
        updateFocus();
      }
    },
    navigateRight: () => {
      if (currentFocusIndex.value === 1 && searchQuery.value) {
        // De la barre vers le bouton clear
        currentFocusIndex.value = 2;
        updateFocus();
      }
    },
    navigateUp: () => {
      // Pas de navigation vers le haut dans cette section
    },
    navigateDown: () => {
      // Naviguer vers les résultats si présents
      if (searchResults.value.length > 0) {
        isInSearchResults.value = true;
        navigationStore.navigateDown();
      }
    },
    handleSelect: () => {
      handleSelect();
    },
    scrollToSection: () => {
      const searchSection = document.querySelector('.max-w-2xl');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  };

  // Enregistrer les éléments dans le store
  navigationStore.registerElement(navigationElement);
  navigationStore.registerElement(searchElement);

  // Activer la navigation globale
  if (!navigationStore.isNavigationActive) {
    navigationStore.activateNavigation();
  }

  // Forcer l'activation de la barre de recherche (premier élément, index 0)
  await nextTick();
  navigationStore.navigateUp(); // Cela va activer le premier élément (la barre de recherche)
  currentFocusIndex.value = 1; // Focus sur la barre de recherche

  updateFocus();

  // Si il y a un terme de recherche initial, déclencher la recherche
  if (initialSearchQuery) {
    onSearchInput();
  }
});

// Nettoyage à la destruction du composant
onUnmounted(() => {
  navigationStore.unregisterElement('search-navigation');
  navigationStore.unregisterElement('search-input');
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
    } else if (
      newElement?.id === 'search-navigation' ||
      newElement?.id === 'search-input'
    ) {
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
    return;
  }

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
    }
  }, 150);
};

const clearSearch = async () => {
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;

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
