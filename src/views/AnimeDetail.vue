<template>
  <div class="anime-detail min-h-screen bg-slate-900">
    <!-- Bouton retour -->
    <div v-focus-section:back="backConfig" class="fixed left-4 top-4 z-50">
      <button
        v-focus
        v-focus-events="{
          'enter-up': goBack,
          focused: () => (isBackFocused = true),
          unfocused: () => (isBackFocused = false),
        }"
        class="focus-none flex items-center gap-2 rounded-lg px-4 py-2 font-semibold backdrop-blur-md transition-all duration-300"
        :class="[
          isBackFocused
            ? 'scale-105 bg-slate-800/90 text-white shadow-lg shadow-slate-500/30'
            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800/80',
        ]"
        @click="goBack"
      >
        <ph-arrow-left :size="20" />
        Retour
      </button>
    </div>

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
                <span class="flex items-center gap-1">
                  <span class="font-semibold">{{ anime?.year }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="font-semibold"
                    >{{ anime?.episodeCount }} épisodes</span
                  >
                </span>
                <span class="flex items-center gap-1">
                  <span class="font-semibold">{{ anime?.duration }}</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="font-semibold">{{ anime?.studio }}</span>
                </span>
                <span
                  class="flex items-center gap-1 rounded-full px-2 py-1"
                  :class="statusClass"
                >
                  <span class="font-semibold">{{ statusText }}</span>
                </span>
              </div>

              <!-- Genres -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in anime?.genres"
                  :key="genre"
                  class="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200"
                >
                  {{ genre }}
                </span>
              </div>

              <!-- Note -->
              <div class="flex items-center gap-2">
                <div class="flex items-center">
                  <span class="text-2xl font-bold text-yellow-400">★</span>
                  <span class="ml-1 text-xl font-semibold text-white">
                    {{ anime?.rating }}/10
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
              class="focus-none flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300"
              :class="[
                isPlayFocused
                  ? 'scale-105 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600',
              ]"
              @click="playAnime"
            >
              <ph-play :size="20" />
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
              class="focus-none flex items-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-all duration-300"
              :class="[
                isFavoriteFocused
                  ? 'scale-105 border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-lg'
                  : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/10',
              ]"
              @click="toggleFavorite"
            >
              <ph-heart :size="20" :weight="isFavorite ? 'fill' : 'regular'" />
              {{ isFavorite ? 'Supprimer des favoris' : 'Ajouter aux favoris' }}
            </button>
          </div>

          <!-- Synopsis -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-white">Synopsis</h2>
            <p class="leading-relaxed text-slate-300">
              {{ anime?.description }}
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
                class="focus-none flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all duration-300"
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
                    <ph-play :size="24" class="text-slate-400" />
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
            <h3 class="mb-4 text-lg font-semibold text-white">Informations</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Studio:</span>
                <span class="text-slate-200">{{ anime?.studio }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Année:</span>
                <span class="text-slate-200">{{ anime?.year }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Statut:</span>
                <span class="text-slate-200">{{ statusText }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Épisodes:</span>
                <span class="text-slate-200">{{ anime?.episodeCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Durée:</span>
                <span class="text-slate-200">{{ anime?.duration }}</span>
              </div>
            </div>
          </div>

          <!-- Trailer (si disponible) -->
          <div v-if="anime?.trailer" class="rounded-lg bg-slate-800/50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-white">Bande-annonce</h3>
            <button
              v-focus
              v-focus-events="{
                'enter-up': playTrailer,
                focused: () => (isTrailerFocused = true),
                unfocused: () => (isTrailerFocused = false),
              }"
              class="focus-none flex w-full items-center justify-center gap-2 rounded-lg border py-3 transition-all duration-300"
              :class="[
                isTrailerFocused
                  ? 'scale-105 border-indigo-400 bg-indigo-500/20 text-indigo-200'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-indigo-400',
              ]"
              @click="playTrailer"
            >
              <ph-play :size="20" />
              Voir la bande-annonce
            </button>
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

const route = useRoute();
const router = useRouter();
const animeStore = useAnimeStore();

// État local
const anime = ref<Anime | null>(null);
const episodes = ref<Episode[]>([]);
const isFavorite = ref(false);
const focusedEpisodeId = ref<string | null>(null);

// États de focus
const isPlayFocused = ref(false);
const isFavoriteFocused = ref(false);
const isTrailerFocused = ref(false);
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

// Fonctions
const goBack = () => {
  router.go(-1); // Retour à la page précédente
};

const loadAnimeDetails = async () => {
  const animeId = route.params.id as string;

  try {
    // Charger les détails de l'anime depuis le store
    const foundAnime = animeStore.getAnimeById(animeId);

    if (!foundAnime) {
      console.error('Anime non trouvé');
      router.push('/');
      return;
    }

    anime.value = foundAnime;

    // Charger les épisodes
    episodes.value = animeStore.getEpisodesByAnimeId(animeId);

    // Vérifier si l'anime est en favoris
    isFavorite.value = animeStore.isFavorite(animeId);
  } catch (error) {
    console.error("Erreur lors du chargement des détails de l'anime:", error);
    router.push('/');
  }
};

const playAnime = () => {
  if (episodes.value.length > 0) {
    // Naviguer vers le premier épisode
    watchEpisode(episodes.value[0]);
  }
};

const watchEpisode = (episode: Episode) => {
  // TODO: Naviguer vers la page de lecture de l'épisode
  console.log("Regarder l'épisode:", episode);
  // router.push(`/watch/${episode.id}`);
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

const playTrailer = () => {
  if (anime.value?.trailer) {
    // TODO: Ouvrir le trailer
    console.log('Lire la bande-annonce:', anime.value.trailer);
  }
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
