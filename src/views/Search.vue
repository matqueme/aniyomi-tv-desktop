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
import { useSearchNavigation } from '@/composables/useSearchNavigation';
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

// Navigation simplifiée avec le composable
const searchNavigation = useSearchNavigation();

// Navigation TV avec handlers pour la gestion des résultats de recherche
useTVNavigation({
  onSelect: () => {
    if (searchNavigation.isInSearchResults.value) {
      navigationStore.handleSelect();
    } else {
      searchNavigation.handleSelect();
    }
  },
  onBack: () => {
    goBack();
  },
});

// États des éléments focusés
const isBackButtonFocused = computed(() =>
  searchNavigation.isBackButtonFocused()
);
const isSearchFocused = computed(() => searchNavigation.isSearchFocused());
const isClearButtonFocused = computed(() =>
  searchNavigation.isClearButtonFocused()
);

// Configuration de la navigation
onMounted(async () => {
  // Initialiser la navigation avec le composable
  await searchNavigation.initializeNavigation(() => {
    if (searchResults.value.length > 0) {
      navigationStore.navigateDown();
    }
  });

  // Ajouter les éléments navigables
  searchNavigation.addElement(
    'back-button',
    backButtonRef.value ?? null,
    () => backButtonRef.value?.focus(),
    () => goBack()
  );

  searchNavigation.addElement(
    'search-input',
    searchInputRef.value ?? null,
    () => searchInputRef.value?.focus()
  );

  // Si il y a un terme de recherche initial, déclencher la recherche
  if (initialSearchQuery) {
    onSearchInput();
  }
});

// Nettoyage à la destruction du composant
onUnmounted(() => {
  searchNavigation.cleanup();
});

// Gérer l'ajout/suppression du bouton clear
watch(searchQuery, (newValue, oldValue) => {
  const hadClearButton = !!oldValue;
  const hasClearButton = !!newValue;

  if (!hadClearButton && hasClearButton) {
    // Ajouter le bouton clear
    searchNavigation.addElement(
      'clear-button',
      clearButtonRef.value || null,
      () => clearButtonRef.value?.focus(),
      () => clearSearch()
    );
  } else if (hadClearButton && !hasClearButton) {
    // Supprimer le bouton clear
    searchNavigation.removeElement('clear-button');
  }
});

// Surveiller l'état de navigation global
watch(
  () => navigationStore.activeElement,
  (newElement) => {
    if (newElement?.id === 'search-results') {
      searchNavigation.isInSearchResults.value = true;
    } else if (
      newElement?.id === 'search-navigation' ||
      newElement?.id === 'search-input'
    ) {
      searchNavigation.isInSearchResults.value = false;
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
  searchNavigation.updateFocus(); // Focus sur la barre de recherche
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
