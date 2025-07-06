<template>
  <div class="anime-detail min-h-screen bg-slate-900" @keyup="handleKeyUp">
    <!-- Bouton retour -->
    <div v-focus-section:back="backConfig" class="fixed left-4 top-4 z-50">
      <button
        v-focus
        v-focus-events="{
          'enter-up': goBack,
          focused: () => (isBackFocused = true),
          unfocused: () => (isBackFocused = false),
        }"
        class="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold backdrop-blur-md transition-all duration-300 focus-none"
        :class="[
          isBackFocused
            ? 'scale-105 bg-slate-800/90 text-white shadow-lg shadow-slate-500/30'
            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800/80',
        ]"
        @click="goBack"
      >
        <PhArrowLeft :size="20" />
        Retour
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <div
          class="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
        ></div>
        <p class="text-white">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center"
    >
      <div class="text-center">
        <p class="mb-4 text-xl text-red-400">{{ error }}</p>
        <button
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          @click="loadAnimeDetails"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="anime">
      <!-- Banner avec image de fond -->
      <div class="relative h-96 overflow-hidden">
        <img
          v-if="anime?.bannerUrl"
          :src="anime.bannerUrl"
          :alt="anime.title"
          class="h-full w-full object-cover"
        />
        <img
          v-else
          :src="anime?.posterUrl"
          :alt="anime?.title"
          class="h-full w-full object-cover blur-sm"
        />

        <!-- Overlay gradient -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"
        ></div>

        <!-- Contenu principal -->
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="mx-auto max-w-7xl">
            <div class="flex flex-col gap-6 sm:flex-row sm:items-end">
              <!-- Poster -->
              <div class="flex-shrink-0">
                <img
                  :src="anime?.posterUrl"
                  :alt="anime?.title"
                  class="h-64 w-48 rounded-lg object-cover shadow-2xl"
                />
              </div>

              <!-- Informations principales -->
              <div class="flex-1 space-y-4">
                <div>
                  <h1 class="text-4xl font-bold text-white">
                    {{ anime?.title }}
                  </h1>
                  <p v-if="anime?.originalTitle" class="text-lg text-slate-300">
                    {{ anime.originalTitle }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-4 text-sm text-slate-300">
                  <span
                    v-if="anime?.year && anime.year !== 2024"
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{ anime.year }}</span>
                  </span>
                  <span
                    v-if="anime?.episodeCount && anime.episodeCount > 0"
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold"
                      >{{ anime.episodeCount }} épisode{{
                        anime.episodeCount > 1 ? 's' : ''
                      }}</span
                    >
                  </span>
                  <span
                    v-if="anime?.duration && anime.duration !== '24 min'"
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{ anime.duration }}</span>
                  </span>
                  <span
                    v-if="anime?.studio && anime.studio !== 'Studio Animation'"
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{ anime.studio }}</span>
                  </span>
                  <span
                    v-if="anime?.status && statusText !== 'Inconnu'"
                    class="flex items-center gap-1 rounded-full px-2 py-1"
                    :class="statusClass"
                  >
                    <span class="font-semibold">{{ statusText }}</span>
                  </span>
                </div>

                <!-- Genres -->
                <div
                  v-if="
                    anime?.genres && anime.genres.length > 0 && !isGenericGenres
                  "
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="genre in anime.genres"
                    :key="genre"
                    class="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200"
                  >
                    {{ genre }}
                  </span>
                </div>

                <!-- Note -->
                <div
                  v-if="anime?.rating && anime.rating !== 8.5"
                  class="flex items-center gap-2"
                >
                  <div class="flex items-center">
                    <span class="text-2xl font-bold text-yellow-400">★</span>
                    <span class="ml-1 text-xl font-semibold text-white">
                      {{ anime.rating }}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu détaillé -->
      <div class="mx-auto max-w-7xl px-8 py-8">
        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Colonne principale -->
          <div class="space-y-8 lg:col-span-2">
            <!-- Boutons d'action -->
            <div
              v-focus-section:actions.default="actionsConfig"
              class="flex flex-wrap gap-4"
            >
              <button
                ref="playButtonRef"
                v-focus
                v-focus-events="{
                  'enter-up': playAnime,
                  focused: () => (isPlayFocused = true),
                  unfocused: () => (isPlayFocused = false),
                }"
                class="flex items-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-all duration-300 focus-none"
                :class="[
                  isPlayFocused
                    ? 'scale-105 border-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'border-indigo-500 bg-indigo-500 text-white hover:border-indigo-400 hover:bg-indigo-600',
                ]"
                @click="playAnime"
                @mouseenter="isPlayHovered = true"
                @mouseleave="isPlayHovered = false"
              >
                <div class="relative">
                  <PhPlay
                    :size="20"
                    weight="regular"
                    class="transition-opacity duration-500"
                    :style="{ opacity: isPlayFocused || isPlayHovered ? 0 : 1 }"
                  />
                  <PhPlay
                    :size="20"
                    weight="fill"
                    class="absolute inset-0 transition-opacity duration-500"
                    :style="{ opacity: isPlayFocused || isPlayHovered ? 1 : 0 }"
                  />
                </div>
                Regarder maintenant
              </button>

              <button
                ref="favoriteButtonRef"
                v-focus
                v-focus-events="{
                  'enter-up': toggleFavorite,
                  focused: () => (isFavoriteFocused = true),
                  unfocused: () => (isFavoriteFocused = false),
                }"
                class="flex items-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-all duration-300 focus-none"
                :class="[
                  isFavoriteFocused
                    ? 'scale-105 border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-lg'
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/10',
                ]"
                @click="toggleFavorite"
              >
                <PhHeart :size="20" :weight="isFavorite ? 'fill' : 'regular'" />
                {{
                  isFavorite ? 'Supprimer des favoris' : 'Ajouter aux favoris'
                }}
              </button>
            </div>

            <!-- Synopsis -->
            <div
              v-if="anime?.description && !isGenericDescription"
              class="space-y-4"
            >
              <h2 class="text-2xl font-bold text-white">Synopsis</h2>
              <p class="leading-relaxed text-slate-300">
                {{ anime.description }}
              </p>
            </div>

            <!-- Liste des épisodes -->
            <div v-focus-section:episodes="episodesConfig" class="space-y-4">
              <h2 class="text-2xl font-bold text-white">Épisodes</h2>
              <div class="grid gap-3">
                <div
                  v-for="episode in episodes"
                  :key="episode.id"
                  ref="episodeRefs"
                  v-focus
                  v-focus-events="{
                    'enter-up': () => watchEpisode(episode),
                    focused: () => setFocusedEpisode(episode.id),
                    unfocused: () => setFocusedEpisode(null),
                  }"
                  class="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all duration-300 focus-none"
                  :class="[
                    focusedEpisodeId === episode.id
                      ? 'scale-[1.02] border-indigo-400 bg-indigo-500/10 shadow-lg'
                      : 'border-slate-600/40 bg-slate-800/30 hover:border-indigo-400/70 hover:bg-indigo-500/5',
                  ]"
                  @click="() => watchEpisode(episode)"
                >
                  <!-- Miniature de l'épisode -->
                  <div class="h-16 w-28 flex-shrink-0 overflow-hidden rounded">
                    <img
                      v-if="episode.thumbnailUrl"
                      :src="episode.thumbnailUrl"
                      :alt="`Épisode ${episode.number}`"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center bg-slate-700"
                    >
                      <PhPlay :size="24" class="text-slate-400" />
                    </div>
                  </div>

                  <!-- Informations de l'épisode -->
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold text-white">
                        Épisode {{ episode.number }} - {{ episode.title }}
                      </h3>
                      <span class="text-sm text-slate-400">{{
                        episode.duration
                      }}</span>
                    </div>
                    <p
                      v-if="episode.description"
                      class="line-clamp-2 text-sm text-slate-400"
                    >
                      {{ episode.description }}
                    </p>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-slate-500">
                        {{ formatDate(episode.airDate) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div v-focus-section:sidebar="sidebarConfig" class="space-y-6">
            <!-- Informations détaillées -->
            <div class="rounded-lg bg-slate-800/50 p-6">
              <h3 class="mb-4 text-lg font-semibold text-white">
                Informations
              </h3>
              <div class="space-y-3 text-sm">
                <div
                  v-if="anime?.studio && anime.studio !== 'Studio Animation'"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Studio:</span>
                  <span class="text-slate-200">{{ anime.studio }}</span>
                </div>
                <div
                  v-if="anime?.year && anime.year !== 2024"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Année:</span>
                  <span class="text-slate-200">{{ anime.year }}</span>
                </div>
                <div
                  v-if="anime?.status && statusText !== 'Inconnu'"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Statut:</span>
                  <span class="text-slate-200">{{ statusText }}</span>
                </div>
                <div
                  v-if="anime?.episodeCount && anime.episodeCount > 0"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Épisodes:</span>
                  <span class="text-slate-200">{{ anime.episodeCount }}</span>
                </div>
                <div
                  v-if="anime?.duration && anime.duration !== '24 min'"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Durée:</span>
                  <span class="text-slate-200">{{ anime.duration }}</span>
                </div>
                <div
                  v-if="anime?.rating && anime.rating !== 8.5"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Note:</span>
                  <span class="text-slate-200">{{ anime.rating }}/10</span>
                </div>
                <div v-if="isNewRoute" class="flex justify-between">
                  <span class="text-slate-400">Extension:</span>
                  <span class="text-slate-200">{{ extensionName }}</span>
                </div>
                <div v-if="isNewRoute" class="flex justify-between">
                  <span class="text-slate-400">Saison:</span>
                  <span class="text-slate-200">{{ season }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhPlay, PhHeart, PhArrowLeft } from '@phosphor-icons/vue';
import { useAnimeStore } from '@/stores/anime';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';
import type { Anime, Episode } from '@/types/anime';
import { normalizeKeyboardEvent, isBackKey } from '@/utils/keyboardUtils';
import { extensionManager } from '@/services/extensions/manager';

const route = useRoute();
const router = useRouter();
const animeStore = useAnimeStore();

// État local
const anime = ref<Anime | null>(null);
const episodes = ref<Episode[]>([]);
const isFavorite = ref(false);
const focusedEpisodeId = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Paramètres de route - support des deux formats
const isNewRoute = computed(
  () => route.params.extension && route.params.animeName && route.params.season
);
const extensionName = computed(() => route.params.extension as string);
const animeName = computed(() => route.params.animeName as string);
const season = computed(() => route.params.season as string);
const animeId = computed(() => route.params.id as string);

// États de focus
const isPlayFocused = ref(false);
const isPlayHovered = ref(false);
const isFavoriteFocused = ref(false);
const isBackFocused = ref(false);

// Références pour la navigation spatiale
const playButtonRef = ref<HTMLButtonElement>();
const favoriteButtonRef = ref<HTMLButtonElement>();
const episodeRefs = ref<HTMLElement[]>([]);

// Configuration de la navigation spatiale
const backConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    down: '@actions',
  },
}));

const actionsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@back',
    down: '@episodes',
  },
}));

const episodesConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@actions',
    right: '@sidebar',
  },
}));

const sidebarConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    left: '@episodes',
  },
}));

// Computed pour le statut
const statusText = computed(() => {
  switch (anime.value?.status) {
    case 'ongoing':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'upcoming':
      return 'À venir';
    default:
      return 'Inconnu';
  }
});

const statusClass = computed(() => {
  switch (anime.value?.status) {
    case 'ongoing':
      return 'bg-green-500/20 text-green-200';
    case 'completed':
      return 'bg-blue-500/20 text-blue-200';
    case 'upcoming':
      return 'bg-orange-500/20 text-orange-200';
    default:
      return 'bg-slate-500/20 text-slate-200';
  }
});

// Vérifier si les genres sont génériques (ceux qu'on ajoute par défaut)
const isGenericGenres = computed(() => {
  if (!anime.value?.genres || anime.value.genres.length === 0) return true;
  const genericGenres = ['Action', 'Animation'];
  return (
    anime.value.genres.every((genre) => genericGenres.includes(genre)) &&
    anime.value.genres.length === 2
  );
});

// Vérifier si la description est générique
const isGenericDescription = computed(() => {
  if (!anime.value?.description) return true;
  const description = anime.value.description;
  return description.startsWith('Anime ') && description.includes(' - Saison ');
});

// Fonctions
const goBack = () => {
  router.push({
    name: 'Home',
  });
};

const loadAnimeDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    if (isNewRoute.value) {
      // Nouvelle route: /:extension/:animeName/:season
      await loadFromExtension();
    } else {
      // Ancienne route: /anime/:id
      await loadFromStore();
    }
  } catch (err) {
    console.error("Erreur lors du chargement des détails de l'anime:", err);
    error.value = 'Erreur lors du chargement';
  } finally {
    isLoading.value = false;
  }
};

const loadFromExtension = async () => {
  // Charger les épisodes depuis l'extension
  episodes.value = await extensionManager.getEpisodes(
    extensionName.value,
    animeName.value,
    season.value
  );

  // Créer les informations de l'anime à partir des paramètres
  anime.value = {
    id: `${extensionName.value}-${animeName.value}`,
    title: decodeURIComponent(animeName.value).replace(/[-_]/g, ' '),
    originalTitle: decodeURIComponent(animeName.value),
    description: `Anime ${decodeURIComponent(animeName.value).replace(/[-_]/g, ' ')} - Saison ${season.value}`,
    posterUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
    bannerUrl:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
    year: 2024,
    status: 'ongoing' as const,
    genres: ['Action', 'Animation'],
    rating: 8.5,
    episodeCount: episodes.value.length,
    duration: '24 min',
    studio: 'Studio Animation',
    extension: extensionName.value,
    season: season.value,
  };

  // Vérifier si l'anime est en favoris
  isFavorite.value = animeStore.isFavorite(anime.value.id);
};

const loadFromStore = async () => {
  const foundAnime = animeStore.getAnimeById(animeId.value);

  if (!foundAnime) {
    console.error('Anime non trouvé');
    router.push('/');
    return;
  }

  anime.value = foundAnime;

  // Charger les épisodes
  episodes.value = animeStore.getEpisodesByAnimeId(animeId.value);

  // Vérifier si l'anime est en favoris
  isFavorite.value = animeStore.isFavorite(animeId.value);
};

const playAnime = () => {
  if (episodes.value.length > 0 && anime.value) {
    if (isNewRoute.value) {
      // Nouvelle route avec extension
      router.push({
        name: 'VideoWatch',
        params: {
          animeId: animeName.value,
          episode: '1',
        },
        query: {
          extension: extensionName.value,
          season: season.value,
        },
      });
    } else {
      // Ancienne route
      router.push(`/watch/${anime.value.id}/1`);
    }
  }
};

const watchEpisode = (episode: Episode) => {
  if (anime.value) {
    if (isNewRoute.value) {
      // Nouvelle route avec extension
      router.push({
        name: 'VideoWatch',
        params: {
          animeId: animeName.value,
          episode: episode.number.toString(),
        },
        query: {
          extension: extensionName.value,
          season: season.value,
        },
      });
    } else {
      // Ancienne route
      router.push(`/watch/${anime.value.id}/${episode.number}`);
    }
  }
};

const toggleFavorite = () => {
  if (!anime.value) return;

  if (isFavorite.value) {
    animeStore.removeFromFavorites(anime.value.id);
  } else {
    animeStore.addToFavorites(anime.value.id);
  }
  isFavorite.value = !isFavorite.value;
};

const setFocusedEpisode = (episodeId: string | null) => {
  focusedEpisodeId.value = episodeId;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Gestion du bouton retour de la télécommande
const handleKeyUp = (event: KeyboardEvent) => {
  const keyData = normalizeKeyboardEvent(event);

  if (isBackKey(keyData.code, keyData.keyCode)) {
    event.preventDefault();
    goBack();
  }
};

// Lifecycle
onMounted(async () => {
  await loadAnimeDetails();

  await nextTick();
  // Focus automatiquement sur le bouton play
  SpatialNavigation.focus('actions');
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.anime-detail {
  transform: translateZ(0);
  will-change: transform;
}

/* Animation des cartes d'épisodes */
.episode-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.episode-card:hover {
  transform: translateY(-2px);
}
</style>
