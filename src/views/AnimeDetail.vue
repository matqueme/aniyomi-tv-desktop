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
        class="flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold backdrop-blur-md transition-all duration-300 focus-none"
        :class="[
          isBackFocused
            ? 'scale-105 border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-lg'
            : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/10',
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
    <div v-else-if="animeDetails">
      <!-- Banner avec image de fond -->
      <div class="relative h-96 overflow-hidden">
        <img
          v-if="animeDetails?.bannerUrl"
          :src="animeDetails.bannerUrl"
          :alt="animeDetails.title"
          class="h-full w-full object-cover"
        />
        <img
          v-else
          :src="animeDetails?.posterUrl"
          :alt="animeDetails?.title"
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
                  :src="animeDetails?.posterUrl"
                  :alt="animeDetails?.title"
                  class="h-64 w-48 rounded-lg object-cover shadow-2xl"
                />
              </div>

              <!-- Informations principales -->
              <div class="flex-1 space-y-4">
                <div>
                  <h1 class="text-4xl font-bold text-white">
                    {{ animeDetails?.title }}
                  </h1>
                  <p
                    v-if="animeDetails?.originalTitle"
                    class="text-lg text-slate-300"
                  >
                    {{ animeDetails.originalTitle }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-4 text-sm text-slate-300">
                  <span
                    v-if="animeDetails?.year && animeDetails.year !== 2024"
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{ animeDetails.year }}</span>
                  </span>
                  <span
                    v-if="
                      animeDetails?.totalEpisodes &&
                      animeDetails.totalEpisodes > 0
                    "
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold"
                      >{{ animeDetails.totalEpisodes }} épisode{{
                        animeDetails.totalEpisodes > 1 ? 's' : ''
                      }}
                    </span>
                  </span>
                  <span
                    v-if="
                      animeDetails?.seasons && animeDetails.seasons.length > 0
                    "
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold"
                      >{{ animeDetails.seasons.length }} saison{{
                        animeDetails.seasons.length > 1 ? 's' : ''
                      }}</span
                    >
                  </span>
                  <span
                    v-if="
                      animeDetails?.duration &&
                      animeDetails.duration !== '24 min'
                    "
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{
                      animeDetails.duration
                    }}</span>
                  </span>
                  <span
                    v-if="
                      animeDetails?.studio &&
                      animeDetails.studio !== 'Studio Animation'
                    "
                    class="flex items-center gap-1"
                  >
                    <span class="font-semibold">{{ animeDetails.studio }}</span>
                  </span>
                  <span
                    v-if="animeDetails?.status"
                    class="flex items-center gap-1 rounded-full px-2 py-1"
                    :class="statusClass"
                  >
                    <span class="font-semibold">{{ statusText }}</span>
                  </span>
                </div>

                <!-- Genres -->
                <div
                  v-if="
                    animeDetails?.genres &&
                    animeDetails.genres.length > 0 &&
                    !isGenericGenres
                  "
                  class="flex flex-wrap gap-2"
                >
                  <span
                    v-for="genre in animeDetails.genres"
                    :key="genre"
                    class="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200"
                  >
                    {{ genre }}
                  </span>
                </div>

                <!-- Note -->
                <div
                  v-if="animeDetails?.rating && animeDetails.rating !== 8.5"
                  class="flex items-center gap-2"
                >
                  <div class="flex items-center">
                    <span class="text-2xl font-bold text-yellow-400">★</span>
                    <span class="ml-1 text-xl font-semibold text-white">
                      {{ animeDetails.rating }}/10
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
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
              v-if="animeDetails?.description && !isGenericDescription"
              class="space-y-4"
            >
              <h2 class="text-2xl font-bold text-white">Synopsis</h2>
              <p class="leading-relaxed text-slate-300">
                {{ animeDetails.description }}
              </p>
            </div>

            <!-- Sélecteur de saison avec Swiper -->
            <div v-if="availableSeasons.length > 1" class="space-y-4">
              <h2 class="text-2xl font-bold text-white">Saisons</h2>
              <div
                v-focus-section:seasons="seasonsConfig"
                class="max-w-screen mb-8 box-border"
              >
                <swiper-container
                  ref="seasonSwiperRef"
                  v-focus
                  :slides-per-view="'auto'"
                  :space-between="24"
                  :free-mode="true"
                  :grab-cursor="false"
                  :mouse-wheel="false"
                  :keyboard="{
                    enabled: false,
                    onlyInViewport: true,
                    pageUpDown: false,
                  }"
                  class="season-swiper-element"
                  tabindex="0"
                  @focus="handleSeasonSwiperFocus"
                  @blur="handleSeasonSwiperBlur"
                  @keydown="handleSeasonSwiperKeydown"
                  @slidechange="handleSeasonSlideChange"
                >
                  <swiper-slide
                    v-for="(seasonData, index) in availableSeasons"
                    :key="seasonData.number"
                    :class="[
                      'season-slide-element',
                      {
                        focused:
                          index === currentSeasonSlideIndex &&
                          seasonSwiperHasFocus,
                      },
                    ]"
                  >
                    <div
                      class="flex w-[180px] min-w-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all duration-300"
                      :class="getSeasonCardClasses(seasonData.number, index)"
                      @click="() => changeSeason(seasonData.number)"
                    >
                      <img
                        v-if="seasonData.posterUrl"
                        :src="seasonData.posterUrl"
                        :alt="`Saison ${seasonData.number}`"
                        class="mb-1 h-16 w-12 rounded object-cover"
                      />
                      <div class="w-full text-center">
                        <h3 class="truncate font-semibold">
                          {{
                            seasonData.title || `Saison ${seasonData.number}`
                          }}
                        </h3>
                        <p class="text-sm opacity-75">
                          {{
                            seasonData.episodes?.length ||
                            seasonData.episodeCount ||
                            0
                          }}
                          épisodes
                        </p>
                        <div
                          v-if="
                            seasonData.voices && seasonData.voices.length > 0
                          "
                          class="mt-1 flex justify-center gap-1"
                        >
                          <span
                            v-for="voice in seasonData.voices"
                            :key="voice"
                            class="inline-block rounded bg-slate-700/50 px-1 py-0.5 text-xs text-slate-300"
                          >
                            {{ voice.toUpperCase() }}
                          </span>
                        </div>
                        <span
                          v-if="seasonData.status"
                          class="mt-1 inline-block rounded-full px-2 py-1 text-xs"
                          :class="[
                            seasonData.status === 'completed'
                              ? 'bg-green-500/20 text-green-200'
                              : seasonData.status === 'ongoing'
                                ? 'bg-blue-500/20 text-blue-200'
                                : 'bg-orange-500/20 text-orange-200',
                          ]"
                        >
                          {{
                            seasonData.status === 'completed'
                              ? 'Terminée'
                              : seasonData.status === 'ongoing'
                                ? 'En cours'
                                : 'À venir'
                          }}
                        </span>
                      </div>
                    </div>
                  </swiper-slide>
                </swiper-container>
              </div>
            </div>

            <!-- Liste des épisodes -->
            <div v-focus-section:episodes="episodesConfig" class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-white">Épisodes</h2>
                <div v-if="currentSeasonData" class="text-right">
                  <div class="text-slate-400">
                    {{
                      currentSeasonData.title ||
                      `Saison ${currentSeasonData.number}`
                    }}
                    - {{ episodes.length }} épisodes
                  </div>
                  <div
                    v-if="
                      currentSeasonData.voices &&
                      currentSeasonData.voices.length > 0
                    "
                    class="mt-1 flex justify-end gap-2"
                  >
                    <span
                      v-for="voice in currentSeasonData.voices"
                      :key="voice"
                      class="inline-block rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200"
                    >
                      {{ voice.toUpperCase() }}
                    </span>
                  </div>
                </div>
              </div>
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
                  class="group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all duration-300 focus-none"
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
                      class="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"
                    >
                      <!-- Effet de texture subtile -->
                      <div
                        class="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-600/10 to-slate-500/20"
                      ></div>

                      <!-- Numéro d'épisode en arrière-plan -->
                      <div
                        class="absolute inset-0 flex items-center justify-center"
                      >
                        <span class="text-4xl font-bold text-slate-800/50">{{
                          episode.number
                        }}</span>
                      </div>

                      <!-- Icône play au premier plan -->
                      <div
                        class="relative z-10 rounded-full bg-slate-600/80 p-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-indigo-500/80"
                      >
                        <PhPlay
                          :size="16"
                          class="text-slate-200 transition-colors duration-300 group-hover:text-white"
                          weight="fill"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Informations de l'épisode -->
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold text-white">
                        Épisode {{ episode.number
                        }}{{ episode.title ? ` - ${episode.title}` : '' }}
                      </h3>
                      <span
                        v-if="episode.duration"
                        class="text-sm text-slate-400"
                        >{{ episode.duration }}</span
                      >
                    </div>
                    <p
                      v-if="episode.description"
                      class="line-clamp-2 text-sm text-slate-400"
                    >
                      {{ episode.description }}
                    </p>
                    <div class="flex items-center justify-between">
                      <div
                        v-if="episode.voices && episode.voices.length > 0"
                        class="flex gap-2"
                      >
                        <span
                          v-for="voice in episode.voices"
                          :key="voice"
                          class="inline-block rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200"
                        >
                          {{ voice.toUpperCase() }}
                        </span>
                      </div>
                      <span
                        v-if="episode.airDate"
                        class="text-xs text-slate-500"
                      >
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
            <div
              v-if="hasInformationContent"
              class="rounded-lg bg-slate-800/50 p-6"
            >
              <h3 class="mb-4 text-lg font-semibold text-white">
                Informations
              </h3>
              <div class="space-y-3 text-sm">
                <div v-if="animeDetails?.studio" class="flex justify-between">
                  <span class="text-slate-400">Studio :</span>
                  <span class="text-slate-200">{{ animeDetails.studio }}</span>
                </div>
                <div v-if="animeDetails?.year" class="flex justify-between">
                  <span class="text-slate-400">Année :</span>
                  <span class="text-slate-200">{{ animeDetails.year }}</span>
                </div>
                <div v-if="animeDetails?.status" class="flex justify-between">
                  <span class="text-slate-400">Statut :</span>
                  <span class="text-slate-200">{{ statusText }}</span>
                </div>
                <div v-if="currentSeasonData" class="flex justify-between">
                  <span class="text-slate-400">Épisodes de la saison :</span>
                  <span class="text-slate-200">{{
                    currentSeasonData.episodes?.length
                  }}</span>
                </div>
                <div
                  v-if="
                    animeDetails?.seasons && animeDetails.seasons.length > 0
                  "
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Saisons :</span>
                  <span class="text-slate-200">{{
                    animeDetails.seasons.length
                  }}</span>
                </div>
                <div
                  v-if="
                    animeDetails?.totalEpisodes &&
                    animeDetails.totalEpisodes !==
                      currentSeasonData?.episodes?.length
                  "
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Total épisodes :</span>
                  <span class="text-slate-200">{{
                    animeDetails.totalEpisodes
                  }}</span>
                </div>
                <div
                  v-if="
                    animeDetails?.duration && animeDetails.duration !== '24 min'
                  "
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Durée :</span>
                  <span class="text-slate-200">{{
                    animeDetails.duration
                  }}</span>
                </div>
                <div
                  v-if="animeDetails?.rating && animeDetails.rating !== 8.5"
                  class="flex justify-between"
                >
                  <span class="text-slate-400">Note :</span>
                  <span class="text-slate-200"
                    >{{ animeDetails.rating }}/10</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Extension :</span>
                  <span class="text-slate-200">{{ extensionName }}</span>
                </div>
                <div v-if="isNewRoute" class="flex justify-between">
                  <span class="text-slate-400">Saison actuelle :</span>
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
import type { AnimeCardInfo, Episode, AnimeDetails } from '@/types/anime';
import { normalizeKeyboardEvent, isBackKey } from '@/utils/keyboardUtils';
import { extensionManager } from '@/extensions/manager/ExtensionManager';
import 'swiper/swiper-bundle.css';

const route = useRoute();
const router = useRouter();
const animeStore = useAnimeStore();

// État local
const animeDetails = ref<AnimeDetails | null>(null);
const anime = ref<AnimeCardInfo | null>(null);
const selectedSeason = ref<number>(1);
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

// États de focus
const isPlayFocused = ref(false);
const isPlayHovered = ref(false);
const isFavoriteFocused = ref(false);
const isBackFocused = ref(false);

// États de focus pour les saisons
const focusedSeasonIndex = ref(-1);
const currentSeasonSlideIndex = ref(0);
const seasonSwiperHasFocus = ref(false);

// Throttle pour limiter la fréquence des navigations de saisons
const lastSeasonNavigationTime = ref(0);
const seasonNavigationDelay = 150; // 150ms entre chaque navigation

// Références pour la navigation spatiale
const playButtonRef = ref<HTMLButtonElement>();
const favoriteButtonRef = ref<HTMLButtonElement>();
const episodeRefs = ref<HTMLElement[]>([]);
const seasonSwiperRef = ref<HTMLElement | null>(null);

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
    down: availableSeasons.value.length > 1 ? '@seasons' : '@episodes',
  },
}));

const seasonsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@actions',
    down: '@episodes',
  },
}));

const episodesConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: availableSeasons.value.length > 1 ? '@seasons' : '@actions',
    right: '@sidebar',
  },
}));

const sidebarConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    left: '@episodes',
  },
}));

// Computed pour accéder aux données de l'anime
const currentSeasonData = computed(() => {
  if (!animeDetails.value || !animeDetails.value.seasons) return null;
  return animeDetails.value.seasons.find(
    (s) => s.number === selectedSeason.value
  );
});

const availableSeasons = computed(() => {
  return animeDetails.value?.seasons || [];
});

// Computed pour récupérer les épisodes de la saison sélectionnée
const episodes = computed(() => {
  if (!currentSeasonData.value?.episodes) return [];
  return currentSeasonData.value.episodes;
});

// Computed pour le statut
const statusText = computed(() => {
  switch (animeDetails.value?.status) {
    case 'ongoing':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'upcoming':
      return 'À venir';
    default:
      return undefined;
  }
});

const statusClass = computed(() => {
  switch (animeDetails.value?.status) {
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
  if (!animeDetails.value?.genres || animeDetails.value.genres.length === 0)
    return true;
  const genericGenres = ['Action', 'Animation'];
  return (
    animeDetails.value.genres.every((genre) => genericGenres.includes(genre)) &&
    animeDetails.value.genres.length === 2
  );
});

// Vérifier si la description est générique
const isGenericDescription = computed(() => {
  if (!animeDetails.value?.description) return true;
  const description = animeDetails.value.description;
  return description.startsWith('Anime ') && description.includes(' - Saison ');
});

// Vérifier si la section informations a du contenu utile
const hasInformationContent = computed(() => {
  if (!animeDetails.value) return false;

  // Vérifier chaque condition d'affichage des informations avec les mêmes critères que le template
  const hasStudio = animeDetails.value.studio;
  const hasYear = animeDetails.value.year;
  const hasStatus = animeDetails.value.status;
  const hasTotalEpisodes = animeDetails.value.totalEpisodes;
  const hasSeasons =
    animeDetails.value.seasons && animeDetails.value.seasons.length > 0;
  const hasCurrentSeasonData = !!currentSeasonData.value;
  const hasDuration = animeDetails.value.duration;
  const hasRating = animeDetails.value.rating;
  const hasExtensionInfo = isNewRoute.value;

  return (
    hasStudio ||
    hasYear ||
    hasStatus ||
    hasTotalEpisodes ||
    hasSeasons ||
    hasCurrentSeasonData ||
    hasDuration ||
    hasRating ||
    hasExtensionInfo
  );
});

// Fonction pour déterminer les classes des cartes de saison
const getSeasonCardClasses = (seasonNumber: number, index: number) => {
  if (selectedSeason.value === seasonNumber)
    return 'border-indigo-400 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20';
  if (index === focusedSeasonIndex.value && seasonSwiperHasFocus.value)
    return 'border-indigo-400 bg-slate-800/50 text-white shadow-lg';
  return 'border-slate-600/40 bg-slate-800/30 text-slate-300 hover:border-indigo-400/70 hover:bg-indigo-500/10';
};

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
    await loadFromExtension();
  } catch (err) {
    console.error("Erreur lors du chargement des détails de l'anime:", err);
    error.value = 'Erreur lors du chargement';
  } finally {
    isLoading.value = false;
  }
};

const loadFromExtension = async () => {
  // Charger les détails complets de l'anime depuis l'extension
  animeDetails.value = await extensionManager.getAnimeDetails(
    extensionName.value,
    animeName.value
  );

  // Définir la saison sélectionnée à partir de la route (avec validation)
  const seasonParam = season.value;
  const seasonNumber = seasonParam ? parseInt(seasonParam) : 1;
  selectedSeason.value = isNaN(seasonNumber) ? 1 : seasonNumber;

  // Créer un objet anime compatible pour les anciens composants
  anime.value = {
    id: animeDetails.value.id,
    title: animeDetails.value.title,
    posterUrl: animeDetails.value.posterUrl,
    year: animeDetails.value.year,
    extension: animeDetails.value.extension,
  };
};

const playAnime = () => {
  if (episodes.value.length > 0 && animeDetails.value) {
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
      router.push(`/watch/${animeDetails.value.id}/1`);
    }
  }
};

const watchEpisode = (episode: Episode) => {
  if (animeDetails.value) {
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
      router.push(`/watch/${animeDetails.value.id}/${episode.number}`);
    }
  }
};

const toggleFavorite = () => {
  if (!animeDetails.value) return;

  if (isFavorite.value) {
    animeStore.removeFromFavorites(animeDetails.value.id);
  } else {
    animeStore.addToFavorites(animeDetails.value.id);
  }
  isFavorite.value = !isFavorite.value;
};

const setFocusedEpisode = (episodeId: string | null) => {
  focusedEpisodeId.value = episodeId;
};

const formatDate = (date: Date | string) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date inconnue';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.warn('Erreur lors du formatage de date:', error);
    return 'Date inconnue';
  }
};

const changeSeason = (seasonNumber: number) => {
  if (seasonNumber === selectedSeason.value) return;

  selectedSeason.value = seasonNumber;

  // Recharger les épisodes pour la nouvelle saison
  if (isNewRoute.value) {
    router.push({
      name: 'AnimeDetail',
      params: {
        extension: extensionName.value,
        animeName: animeName.value,
        season: seasonNumber.toString(),
      },
    });
  }
};

// Fonctions de gestion pour la navigation des saisons
const handleSeasonSwiperKeydown = (event: KeyboardEvent) => {
  // Gérer la navigation uniquement si le swiper a le focus
  if (!seasonSwiperHasFocus.value) return;

  // Throttle pour éviter une navigation trop rapide
  const now = Date.now();
  if (now - lastSeasonNavigationTime.value < seasonNavigationDelay) {
    return;
  }

  // Normaliser l'événement clavier pour la compatibilité TV
  const keyData = normalizeKeyboardEvent(event);

  if (keyData.code === 'ArrowLeft' || keyData.keyCode === 37) {
    event.preventDefault();
    lastSeasonNavigationTime.value = now;
    navigateToPreviousSeason();
  } else if (keyData.code === 'ArrowRight' || keyData.keyCode === 39) {
    event.preventDefault();
    lastSeasonNavigationTime.value = now;
    navigateToNextSeason();
  } else if (keyData.isEnterKey || keyData.isSpaceKey) {
    event.preventDefault();
    if (currentSeasonSlideIndex.value < availableSeasons.value.length) {
      changeSeason(
        availableSeasons.value[currentSeasonSlideIndex.value].number
      );
    }
  }
};

const navigateToPreviousSeason = () => {
  if (currentSeasonSlideIndex.value > 0) {
    currentSeasonSlideIndex.value--;
    scrollToSeasonSlide(currentSeasonSlideIndex.value);
    focusedSeasonIndex.value = currentSeasonSlideIndex.value;
  }
};

const navigateToNextSeason = () => {
  if (currentSeasonSlideIndex.value < availableSeasons.value.length - 1) {
    currentSeasonSlideIndex.value++;
    scrollToSeasonSlide(currentSeasonSlideIndex.value);
    focusedSeasonIndex.value = currentSeasonSlideIndex.value;
  }
};

const handleSeasonSlideChange = (swiper: { realIndex?: number }) => {
  // Mettre à jour l'index actuel quand Swiper change de slide
  // Seulement si le swiper a le focus pour éviter les conflits
  if (
    swiper &&
    typeof swiper.realIndex === 'number' &&
    seasonSwiperHasFocus.value
  ) {
    currentSeasonSlideIndex.value = swiper.realIndex;
    focusedSeasonIndex.value = swiper.realIndex;
  }
};

const scrollToSeasonSlide = (index: number) => {
  // Interface pour le swiper element
  interface SwiperElement extends HTMLElement {
    swiper?: {
      slideTo: (index: number, speed?: number) => void;
    };
  }

  const swiperElement = seasonSwiperRef.value as SwiperElement;
  if (!swiperElement?.swiper) return;

  // Utiliser l'API native de Swiper pour naviguer vers le slide
  swiperElement.swiper.slideTo(index, 300);
};

const handleSeasonSwiperFocus = () => {
  // Quand le swiper reçoit le focus, s'assurer qu'un slide est sélectionné
  seasonSwiperHasFocus.value = true;
  if (focusedSeasonIndex.value === -1 && availableSeasons.value.length > 0) {
    // Trouver l'index de la saison actuellement sélectionnée
    const selectedIndex = availableSeasons.value.findIndex(
      (season) => season.number === selectedSeason.value
    );
    const initialIndex = selectedIndex !== -1 ? selectedIndex : 0;

    currentSeasonSlideIndex.value = initialIndex;
    focusedSeasonIndex.value = initialIndex;
    scrollToSeasonSlide(initialIndex);
  }
};

const handleSeasonSwiperBlur = () => {
  // Quand le swiper perd le focus, réinitialiser l'état de focus
  seasonSwiperHasFocus.value = false;
  focusedSeasonIndex.value = -1;
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

  // Si des saisons sont disponibles, initialiser l'index de la saison sélectionnée
  if (availableSeasons.value.length > 1) {
    const selectedIndex = availableSeasons.value.findIndex(
      (season) => season.number === selectedSeason.value
    );
    if (selectedIndex !== -1) {
      currentSeasonSlideIndex.value = selectedIndex;
    }
  }
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

/* Styles spécifiques pour le carousel Swiper */
.season-swiper-element {
  overflow: visible;
  outline: none;
}

.season-slide-element {
  width: auto;
  flex-shrink: 0;
  padding: 2px; /* Ajustement pour l'espacement */
}
</style>
