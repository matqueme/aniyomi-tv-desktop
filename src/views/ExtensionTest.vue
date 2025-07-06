<template>
  <div class="min-h-screen bg-transparent pt-16">
    <div class="container mx-auto space-y-6 p-6">
      <div
        class="rounded-lg border border-slate-600/30 bg-slate-800/90 p-6 shadow-lg backdrop-blur-sm"
      >
        <h1 class="mb-6 text-3xl font-bold text-slate-100">
          Test des Extensions
        </h1>

        <!-- Sélection de l'extension -->
        <div class="mb-6">
          <label class="mb-2 block text-sm font-medium text-slate-300">
            Sélectionner une extension :
          </label>
          <select
            v-model="selectedExtensionId"
            class="w-full rounded-lg border border-slate-600/40 bg-slate-700/60 p-3 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            @change="handleExtensionChange"
          >
            <option value="" class="text-slate-400">
              -- Choisir une extension --
            </option>
            <option
              v-for="ext in extensionStore.availableExtensions"
              :key="ext.id"
              :value="ext.id"
              class="text-slate-200"
            >
              {{ ext.name }} ({{ ext.lang }}) - v{{ ext.version }}
            </option>
          </select>
        </div>

        <!-- Informations sur l'extension -->
        <div
          v-if="extensionStore.currentExtension"
          class="mb-6 rounded-lg border border-indigo-500/30 bg-indigo-900/30 p-4"
        >
          <h2 class="mb-2 text-lg font-semibold text-indigo-200">
            Extension sélectionnée
          </h2>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-slate-300">
              <strong class="text-slate-200">Nom :</strong>
              {{ extensionStore.currentExtension.metadata.name }}
            </div>
            <div class="text-slate-300">
              <strong class="text-slate-200">Version :</strong>
              {{ extensionStore.currentExtension.metadata.version }}
            </div>
            <div class="text-slate-300">
              <strong class="text-slate-200">Langue :</strong>
              {{ extensionStore.currentExtension.metadata.lang }}
            </div>
            <div class="text-slate-300">
              <strong class="text-slate-200">URL de base :</strong>
              {{ extensionStore.currentExtension.metadata.baseUrl }}
            </div>
            <div class="text-slate-300">
              <strong class="text-slate-200">Support Latest :</strong>
              {{ extensionStore.supportsLatest ? 'Oui' : 'Non' }}
            </div>
            <div class="text-slate-300">
              <strong class="text-slate-200">Support Search :</strong>
              {{ extensionStore.supportsSearch ? 'Oui' : 'Non' }}
            </div>
          </div>
          <p class="mt-2 text-slate-400">
            {{ extensionStore.currentExtension.metadata.description }}
          </p>
        </div>

        <!-- Erreur -->
        <div
          v-if="extensionStore.error"
          class="mb-6 rounded-lg border border-red-500/30 bg-red-900/30 p-4"
        >
          <h3 class="font-semibold text-red-300">Erreur</h3>
          <p class="text-red-200">{{ extensionStore.error }}</p>
        </div>

        <!-- Actions de test -->
        <div
          v-if="extensionStore.isExtensionLoaded"
          class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <button
            class="btn btn-primary"
            :disabled="extensionStore.loading"
            @click="testPopularAnimes"
          >
            {{
              extensionStore.loading
                ? 'Chargement...'
                : 'Test Animes Populaires'
            }}
          </button>

          <button
            v-if="extensionStore.supportsLatest"
            class="btn btn-secondary"
            :disabled="extensionStore.loading"
            @click="testLatestAnimes"
          >
            {{
              extensionStore.loading ? 'Chargement...' : 'Test Derniers Animes'
            }}
          </button>

          <button
            v-if="extensionStore.supportsSearch"
            class="btn btn-accent"
            :disabled="extensionStore.loading"
            @click="testSearch"
          >
            {{ extensionStore.loading ? 'Chargement...' : 'Test Recherche' }}
          </button>
        </div>

        <!-- Filtres disponibles -->
        <div v-if="extensionStore.isExtensionLoaded" class="mb-6">
          <h3 class="mb-3 text-lg font-semibold text-slate-200">
            Filtres disponibles
          </h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              v-for="filter in availableFilters"
              :key="filter.name"
              class="rounded-lg border border-slate-600/40 bg-slate-700/40 p-3"
            >
              <h4 class="mb-2 font-medium text-slate-200">
                {{ filter.displayName }}
              </h4>
              <p class="text-sm text-slate-400">Type: {{ filter.type }}</p>
              <p v-if="filter.options" class="text-sm text-slate-400">
                Options: {{ filter.options.length }} disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultats -->
      <div v-if="testResults" class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-200">Résultats du test</h3>

        <!-- Résultats de recherche d'animes -->
        <div
          v-if="testResults.type === 'animes'"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="anime in testResults.data.animes"
            :key="anime.id"
            class="cursor-pointer rounded-lg border border-slate-600/40 bg-slate-700/40 p-4 transition-all duration-200 hover:bg-slate-600/50 hover:shadow-lg hover:shadow-indigo-500/10"
            @click="testAnimeDetails(anime)"
          >
            <img
              v-if="anime.thumbnailUrl"
              :src="anime.thumbnailUrl"
              :alt="anime.title"
              class="mb-3 h-48 w-full rounded object-cover"
              @error="handleImageError"
            />
            <h4 class="mb-2 font-semibold text-slate-100">{{ anime.title }}</h4>
            <p
              v-if="anime.description"
              class="mb-2 line-clamp-3 text-sm text-slate-400"
            >
              {{ anime.description }}
            </p>
            <div
              class="flex items-center justify-between text-xs text-slate-500"
            >
              <span>Status: {{ anime.status }}</span>
              <span v-if="anime.year">{{ anime.year }}</span>
            </div>
          </div>
        </div>

        <!-- Détails de l'anime -->
        <div
          v-if="testResults.type === 'details'"
          class="rounded-lg border border-slate-600/40 bg-slate-700/40 p-6"
        >
          <div class="flex flex-col gap-6 md:flex-row">
            <img
              v-if="testResults.data.thumbnailUrl"
              :src="testResults.data.thumbnailUrl"
              :alt="testResults.data.title"
              class="h-64 w-full rounded object-cover md:w-48"
              @error="handleImageError"
            />
            <div class="flex-1">
              <h3 class="mb-3 text-2xl font-bold text-slate-100">
                {{ testResults.data.title }}
              </h3>
              <p
                v-if="testResults.data.description"
                class="mb-4 text-slate-300"
              >
                {{ testResults.data.description }}
              </p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div v-if="testResults.data.status" class="text-slate-300">
                  <strong class="text-slate-200">Status:</strong>
                  {{ testResults.data.status }}
                </div>
                <div v-if="testResults.data.year" class="text-slate-300">
                  <strong class="text-slate-200">Année:</strong>
                  {{ testResults.data.year }}
                </div>
                <div v-if="testResults.data.rating" class="text-slate-300">
                  <strong class="text-slate-200">Note:</strong>
                  {{ testResults.data.rating }}/10
                </div>
                <div v-if="testResults.data.studio" class="text-slate-300">
                  <strong class="text-slate-200">Studio:</strong>
                  {{ testResults.data.studio }}
                </div>
              </div>
              <div
                v-if="
                  testResults.data.genres && testResults.data.genres.length > 0
                "
                class="mt-4"
              >
                <strong class="mb-2 block text-slate-200">Genres:</strong>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="genre in testResults.data.genres"
                    :key="genre"
                    class="rounded-full border border-indigo-500/30 bg-indigo-900/50 px-3 py-1 text-sm text-indigo-200"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>
              <button
                class="btn btn-primary mt-4"
                @click="testEpisodes(testResults.data)"
              >
                Voir les épisodes
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des épisodes -->
        <div v-if="testResults.type === 'episodes'" class="space-y-2">
          <h4 class="text-lg font-semibold text-slate-200">
            Épisodes ({{ testResults.data.length }})
          </h4>
          <div class="max-h-96 space-y-2 overflow-y-auto">
            <div
              v-for="episode in testResults.data"
              :key="episode.id"
              class="flex cursor-pointer items-center justify-between rounded border border-slate-600/40 bg-slate-700/40 p-3 transition-all duration-200 hover:bg-slate-600/50"
              @click="testVideoSources(episode)"
            >
              <div>
                <h5 class="font-medium text-slate-200">{{ episode.title }}</h5>
                <p v-if="episode.description" class="text-sm text-slate-400">
                  {{ episode.description }}
                </p>
                <p v-if="episode.scanlator" class="text-xs text-indigo-300">
                  {{ episode.scanlator }}
                </p>
              </div>
              <div class="text-right text-sm text-slate-400">
                <div>Épisode {{ episode.number }}</div>
                <div v-if="episode.airDate">
                  {{ formatDate(episode.airDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sources vidéo -->
        <div v-if="testResults.type === 'videos'" class="space-y-2">
          <h4 class="text-lg font-semibold text-slate-200">
            Sources vidéo ({{ testResults.data.length }})
          </h4>
          <div class="space-y-2">
            <div
              v-for="(source, index) in testResults.data"
              :key="index"
              class="rounded border border-slate-600/40 bg-slate-700/40 p-3"
            >
              <div class="mb-2 flex items-start justify-between">
                <h5 class="font-medium text-slate-200">{{ source.quality }}</h5>
                <span class="text-sm text-slate-400"
                  >Source {{ index + 1 }}</span
                >
              </div>
              <p class="mb-2 break-all text-sm text-slate-300">
                {{ source.url }}
              </p>
              <div v-if="source.headers" class="text-xs text-slate-400">
                <strong class="text-slate-300">Headers:</strong>
                <pre
                  class="mt-1 whitespace-pre-wrap rounded bg-slate-800/50 p-2 text-slate-300"
                  >{{ JSON.stringify(source.headers, null, 2) }}</pre
                >
              </div>
              <div
                v-if="source.subtitles && source.subtitles.length > 0"
                class="mt-2"
              >
                <strong class="text-xs text-slate-300">Sous-titres:</strong>
                <div class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-for="subtitle in source.subtitles"
                    :key="subtitle.lang"
                    class="rounded border border-green-500/30 bg-green-900/50 px-2 py-1 text-xs text-green-200"
                  >
                    {{ subtitle.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination pour les listes -->
        <div
          v-if="
            testResults.type === 'animes' &&
            (testResults.data.hasNextPage || testResults.data.currentPage > 1)
          "
          class="mt-6 flex justify-center gap-2"
        >
          <button
            v-if="testResults.data.currentPage > 1"
            class="btn btn-outline"
            @click="changePage(testResults.data.currentPage - 1)"
          >
            Page précédente
          </button>
          <span
            class="rounded border border-slate-600/40 bg-slate-700/60 px-4 py-2 text-slate-200"
          >
            Page {{ testResults.data.currentPage }}
          </span>
          <button
            v-if="testResults.data.hasNextPage"
            class="btn btn-outline"
            @click="changePage(testResults.data.currentPage + 1)"
          >
            Page suivante
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useExtensionStore } from '../stores/extension';
import type {
  AnimeResult,
  AnimeDetails,
  Episode,
  AnimePage,
  VideoSource,
} from '../types/extension';

const extensionStore = useExtensionStore();

const selectedExtensionId = ref('');
const testResults = ref<
  | { type: 'animes'; data: AnimePage }
  | { type: 'details'; data: AnimeDetails }
  | { type: 'episodes'; data: Episode[] }
  | { type: 'videos'; data: VideoSource[] }
  | null
>(null);
const currentTestType = ref<'popular' | 'latest' | 'search' | null>(null);

const availableFilters = computed(() => {
  return extensionStore.getFilters();
});

const handleExtensionChange = () => {
  if (selectedExtensionId.value) {
    extensionStore.setCurrentExtension(selectedExtensionId.value);
    testResults.value = null;
  }
};

const testPopularAnimes = async () => {
  currentTestType.value = 'popular';
  const result = await extensionStore.getPopularAnimes(1, false);
  if (result) {
    testResults.value = {
      type: 'animes',
      data: result,
    };
  }
};

const testLatestAnimes = async () => {
  currentTestType.value = 'latest';
  const result = await extensionStore.getLatestAnimes(1, false);
  if (result) {
    testResults.value = {
      type: 'animes',
      data: result,
    };
  }
};

const testSearch = async () => {
  currentTestType.value = 'search';
  const result = await extensionStore.searchAnimes({
    query: 'naruto',
    page: 1,
  });
  if (result) {
    testResults.value = {
      type: 'animes',
      data: result,
    };
  }
};

const testAnimeDetails = async (anime: AnimeResult) => {
  const result = await extensionStore.getAnimeDetails(anime.url, false);
  if (result) {
    testResults.value = {
      type: 'details',
      data: result,
    };
  }
};

const testEpisodes = async (anime: AnimeDetails) => {
  const result = await extensionStore.getEpisodeList(anime.url, false);
  if (result) {
    testResults.value = {
      type: 'episodes',
      data: result,
    };
  }
};

const testVideoSources = async (episode: Episode) => {
  const result = await extensionStore.getVideoSources(episode.url, false);
  if (result) {
    testResults.value = {
      type: 'videos',
      data: result,
    };
  }
};

const changePage = async (page: number) => {
  if (currentTestType.value === 'popular') {
    await testPopularAnimes();
  } else if (currentTestType.value === 'latest') {
    await testLatestAnimes();
  } else if (currentTestType.value === 'search') {
    const result = await extensionStore.searchAnimes({
      query: 'naruto',
      page,
    });
    if (result) {
      testResults.value = {
        type: 'animes',
        data: result,
      };
    }
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
};

onMounted(async () => {
  await extensionStore.loadAvailableExtensions();

  // Sélectionner automatiquement AnimeSama si disponible
  const animeSamaExtension = extensionStore.availableExtensions.find(
    (ext) =>
      ext.id.toLowerCase().includes('animesama') ||
      ext.name.toLowerCase().includes('animesama')
  );

  if (animeSamaExtension) {
    selectedExtensionId.value = animeSamaExtension.id;
    extensionStore.setCurrentExtension(animeSamaExtension.id);
  }
});
</script>

<style scoped>
.btn {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  outline: none;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.btn-primary:hover {
  background-color: #4338ca;
  border-color: #4338ca;
}

.btn-secondary {
  background-color: #059669;
  color: white;
  border-color: #059669;
}

.btn-secondary:hover {
  background-color: #047857;
  border-color: #047857;
}

.btn-accent {
  background-color: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.btn-accent:hover {
  background-color: #6d28d9;
  border-color: #6d28d9;
}

.btn-outline {
  border-color: #475569;
  color: #e2e8f0;
  background-color: rgba(51, 65, 85, 0.4);
}

.btn-outline:hover {
  background-color: rgba(71, 85, 105, 0.6);
  border-color: #64748b;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Scrollbar styling pour les listes d'épisodes */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.6);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>
