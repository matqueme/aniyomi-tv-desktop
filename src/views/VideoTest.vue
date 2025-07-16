<template>
  <div class="min-h-screen bg-slate-900 p-6">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          class="mb-4 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-700"
          @click="goBack"
        >
          <PhArrowLeft :size="20" />
          Retour
        </button>

        <h1 class="mb-2 text-3xl font-bold text-white">
          Test Extracteurs Vidéo
        </h1>
        <p class="text-slate-400">
          Test des extracteurs vidéo pour Sendvid et Sibnet
        </p>
      </div>

      <!-- Section de test -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Panel de contrôle -->
        <div class="rounded-lg bg-slate-800 p-6">
          <h2 class="mb-4 text-xl font-semibold text-white">Configuration</h2>

          <!-- Sélecteur d'extracteur -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-slate-300">
              Type d'extracteur
            </label>
            <select
              v-model="selectedExtractor"
              class="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @change="onExtractorChange"
            >
              <option value="sendvid">Sendvid</option>
              <option value="sibnet">Sibnet</option>
            </select>
          </div>

          <!-- URL d'entrée -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-slate-300">
              {{
                selectedExtractor === 'sendvid' ? 'URL Sendvid' : 'URL Sibnet'
              }}
            </label>
            <input
              v-model="testUrl"
              type="text"
              :placeholder="
                selectedExtractor === 'sendvid'
                  ? 'https://sendvid.com/embed/dpqvmaau'
                  : 'https://video.sibnet.ru/shell.php?videoid=3647044'
              "
              class="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Boutons d'action -->
          <div class="mb-4 flex gap-3">
            <button
              :disabled="loading || !testUrl"
              class="rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-600"
              @click="extractVideo"
            >
              {{ loading ? 'Extraction...' : 'Extraire' }}
            </button>

            <button
              class="rounded-md bg-slate-600 px-4 py-2 text-white transition-colors hover:bg-slate-500"
              @click="clearResults"
            >
              Effacer
            </button>
          </div>

          <!-- Résultats de l'extraction -->
          <div v-if="extractionResults.length > 0" class="mb-4">
            <h3 class="mb-2 text-lg font-medium text-white">
              Sources extraites
            </h3>
            <div class="space-y-2">
              <div
                v-for="(source, index) in extractionResults"
                :key="index"
                class="rounded border bg-slate-700 p-3"
              >
                <div class="mb-1 text-sm font-medium text-green-400">
                  {{ source.quality }}
                </div>
                <div class="mb-2 break-all text-xs text-slate-300">
                  {{ source.url }}
                </div>
                <button
                  class="rounded bg-indigo-600 px-2 py-1 text-xs text-white transition-colors hover:bg-indigo-700"
                  @click="playVideo(source)"
                >
                  Lire cette source
                </button>
              </div>
            </div>
          </div>

          <!-- Messages d'erreur -->
          <div
            v-if="error"
            class="rounded border border-red-600 bg-red-900/50 p-3 text-sm text-red-200"
          >
            {{ error }}
          </div>
        </div>

        <!-- Lecteur vidéo -->
        <div class="rounded-lg bg-slate-800 p-6">
          <h2 class="mb-4 text-xl font-semibold text-white">Lecteur Vidéo</h2>

          <div
            v-if="currentVideoSource"
            class="aspect-video overflow-hidden rounded-lg bg-black"
          >
            <VideoPlayer
              :src="currentVideoSource.url"
              :type="getVideoType(currentVideoSource.url)"
              :show-custom-controls="true"
              autoplay
              @ready="onVideoReady"
              @error="onVideoError"
            />
          </div>

          <div
            v-else
            class="flex aspect-video items-center justify-center rounded-lg bg-slate-700"
          >
            <div class="text-center text-slate-400">
              <PhPlay :size="48" class="mx-auto mb-2 opacity-50" />
              <p>Sélectionnez une source vidéo pour commencer</p>
            </div>
          </div>

          <!-- Informations sur la vidéo actuelle -->
          <div v-if="currentVideoSource" class="mt-4 rounded bg-slate-700 p-3">
            <h3 class="mb-2 text-sm font-medium text-white">Source actuelle</h3>
            <div class="space-y-1 text-xs text-slate-300">
              <div>
                <strong>Qualité:</strong> {{ currentVideoSource.quality }}
              </div>
              <div><strong>URL:</strong> {{ currentVideoSource.url }}</div>
              <div v-if="currentVideoSource.headers">
                <strong>Headers:</strong>
                {{ Object.keys(currentVideoSource.headers).length }} header(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs de débogage -->
      <div v-if="logs.length > 0" class="mt-8 rounded-lg bg-slate-800 p-6">
        <h2 class="mb-4 text-xl font-semibold text-white">Logs de débogage</h2>
        <div class="max-h-64 overflow-y-auto rounded bg-slate-900 p-4">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="mb-1 text-xs"
            :class="{
              'text-red-400': log.type === 'error',
              'text-yellow-400': log.type === 'warn',
              'text-green-400': log.type === 'success',
              'text-slate-300': log.type === 'info',
            }"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PhArrowLeft, PhPlay } from '@phosphor-icons/vue';
import VideoPlayer from '@/components/video/VideoPlayer.vue';
import { extractorManager } from '@/extractors/ExtractorManager';
import type { VideoSource } from '@/extractors/base/BaseExtractor';

const router = useRouter();

// État du composant
const selectedExtractor = ref('sendvid');
const testUrl = ref('https://sendvid.com/embed/dpqvmaau');
const loading = ref(false);
const error = ref('');
const extractionResults = ref<VideoSource[]>([]);
const currentVideoSource = ref<VideoSource | null>(null);
const logs = ref<Array<{ type: string; message: string; timestamp: string }>>(
  []
);

// Méthodes
const onExtractorChange = () => {
  // Changer l'URL par défaut selon l'extracteur sélectionné
  if (selectedExtractor.value === 'sendvid') {
    testUrl.value = 'https://sendvid.com/embed/dpqvmaau';
  } else if (selectedExtractor.value === 'sibnet') {
    testUrl.value = 'https://video.sibnet.ru/shell.php?videoid=3647044';
  }

  // Nettoyer les résultats précédents
  clearResults();
  addLog('info', `Extracteur changé vers: ${selectedExtractor.value}`);
};

const goBack = () => {
  router.push({ name: 'Home' });
};

const addLog = (type: string, message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push({ type, message, timestamp });
  console.log(`[VideoTest] ${message}`);
};

const clearResults = () => {
  extractionResults.value = [];
  currentVideoSource.value = null;
  error.value = '';
  logs.value = [];
  addLog('info', 'Résultats effacés');
};

const extractVideo = async () => {
  if (!testUrl.value) {
    error.value = 'Veuillez entrer une URL';
    return;
  }

  loading.value = true;
  error.value = '';
  addLog('info', `Début de l'extraction depuis: ${testUrl.value}`);

  try {
    // Vérifier si l'URL est supportée
    if (!extractorManager.isUrlSupported(testUrl.value)) {
      throw new Error('URL non supportée par les extracteurs disponibles');
    }

    addLog('info', 'URL supportée, extraction en cours...');

    // Extraire les sources
    const sources = await extractorManager.extractFromUrl(testUrl.value);

    if (sources.length === 0) {
      throw new Error('Aucune source vidéo trouvée');
    }

    extractionResults.value = sources;
    addLog('success', `${sources.length} source(s) extraite(s) avec succès`);

    // Auto-sélectionner la première source
    if (sources.length > 0) {
      playVideo(sources[0]);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    error.value = errorMessage;
    addLog('error', `Erreur: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

const playVideo = (source: VideoSource) => {
  currentVideoSource.value = source;
  addLog('info', `Lecture de la source: ${source.quality}`);
};

const getVideoType = (url: string): string => {
  if (url.includes('.m3u8')) {
    return 'application/x-mpegURL';
  } else if (url.includes('.mp4')) {
    return 'video/mp4';
  } else if (url.includes('.webm')) {
    return 'video/webm';
  }
  return 'video/mp4'; // fallback
};

const onVideoReady = () => {
  addLog('success', 'Lecteur vidéo prêt');
};

const onVideoError = (errorMessage: string) => {
  addLog('error', `Erreur du lecteur: ${errorMessage}`);
};

// Lifecycle
onMounted(() => {
  addLog('info', 'Page de test initialisée');
  addLog(
    'info',
    'Extracteurs disponibles: ' +
      extractorManager.getAvailableExtractors().join(', ')
  );
});
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
