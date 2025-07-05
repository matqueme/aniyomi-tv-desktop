<template>
  <div
    v-focus-section:search.default="searchSectionConfig"
    class="min-h-screen w-full bg-transparent pt-16"
    @keyup="handleKeyUp"
  >
    <!-- Header avec bouton retour et texte de recherche -->
    <div class="px-6 pb-6 pt-6">
      <div class="mb-6">
        <h1 class="mb-4 text-3xl font-bold text-slate-200">Recherche</h1>

        <SearchHeader :search-text="searchQuery" />
      </div>
    </div>

    <div class="flex flex-col gap-6 px-6 pb-12 xl:flex-row xl:gap-8">
      <!-- Clavier virtuel en haut sur mobile/tablette, à gauche sur grand écran -->
      <div class="w-full xl:w-1/3">
        <VirtualKeyboard
          v-model="searchQuery"
          @key-press="onKeyPress"
          @backspace="onBackspace"
          @clear="onClear"
        />
      </div>

      <!-- Résultats de recherche en bas sur mobile/tablette, à droite sur grand écran -->
      <div class="flex-1">
        <!-- Message d'accueil -->
        <div v-if="!searchQuery && !hasSearched" class="py-16 text-center">
          <ph-magnifying-glass class="mx-auto mb-4 text-slate-500" :size="64" />
          <h2 class="mb-2 text-xl font-semibold text-slate-300">
            Recherchez vos animes préférés
          </h2>
          <p class="text-slate-500">
            Utilisez le clavier virtuel pour taper votre recherche
          </p>
        </div>

        <!-- Résultats de recherche -->
        <div v-else-if="searchResults.length > 0" class="space-y-6">
          <div>
            <h2 class="mb-4 text-xl font-semibold text-slate-300">
              {{ searchResults.length }} résultat{{
                searchResults.length > 1 ? 's' : ''
              }}
              pour "{{ searchQuery }}"
            </h2>

            <SearchResultsGrid
              :animes="searchResults"
              @select="handleAnimeSelect"
            />
          </div>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { PhMagnifyingGlass, PhFileX } from '@phosphor-icons/vue';
import { useAnimeStore } from '@/stores/anime';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';
import VirtualKeyboard from '@/components/search/VirtualKeyboard.vue';
import SearchHeader from '@/components/search/SearchHeader.vue';
import SearchResultsGrid from '@/components/search/SearchResultsGrid.vue';
import type { Anime } from '@/types/anime';
import { normalizeKeyboardEvent, isBackKey } from '@/utils/keyboardUtils';

// Options du composant pour éviter l'erreur ESLint
defineOptions({
  name: 'SearchPage',
});

const router = useRouter();
const animeStore = useAnimeStore();

// Récupérer le terme de recherche depuis l'URL
const route = router.currentRoute;
const initialSearchQuery = (route.value.query.q as string) || '';

// État de la recherche
const searchQuery = ref(initialSearchQuery);
const searchResults = ref<Anime[]>([]);
const hasSearched = ref(false);

// Configuration de la section spatiale
const searchSectionConfig = ref({
  enterTo: 'keyboard',
  leaveFor: {},
});

// Configuration de la navigation
onMounted(async () => {
  await nextTick();
  SpatialNavigation.focus('keyboard');
});

// Fonction de recherche avec debounce
let searchTimeout: number;

const performSearch = () => {
  clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    hasSearched.value = false;
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      // TODO: Remplacer par une vraie API de recherche
      const allAnimes = [...animeStore.animes];
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

// Gestionnaires d'événements du clavier virtuel
const onKeyPress = () => {
  performSearch();
};

const onBackspace = () => {
  performSearch();
};

const onClear = () => {
  searchResults.value = [];
  hasSearched.value = false;
};

const handleAnimeSelect = (anime: Anime) => {
  router.push(`/anime/${anime.id}`);
};

// Gestion du bouton retour de la télécommande
const handleKeyUp = (event: KeyboardEvent) => {
  const keyData = normalizeKeyboardEvent(event);

  if (isBackKey(keyData.code, keyData.keyCode)) {
    event.preventDefault();
    router.push({ name: 'Home' });
  }
};
</script>
