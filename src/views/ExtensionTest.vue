<template>
  <div class="extension-test">
    <div class="header">
      <h1>Test Extension AnimeSama</h1>
      <p>Page de test pour l'extension de scraping AnimeSama</p>
    </div>

    <div class="test-sections">
      <!-- Section Extensions Disponibles -->
      <section class="test-section">
        <h2>Extensions Disponibles</h2>
        <div class="extensions-grid">
          <ExtensionCard
            v-for="extension in availableExtensions"
            :key="extension.id"
            :extension="extension"
            @test="selectExtension"
            @install="installExtension"
            @activate="activateExtension"
            @remove="removeExtension"
          />
        </div>
      </section>

      <!-- Section Extension Sélectionnée -->
      <section v-if="selectedExtension" class="test-section">
        <h2>Test Extension: {{ selectedExtension.name }}</h2>
        <p>
          Extension actuellement testée:
          <strong>{{ selectedExtension.name }}</strong>
        </p>
      </section>

      <!-- Section Animes Populaires -->
      <section class="test-section">
        <h2>Animes Populaires</h2>
        <button :disabled="loading.popular" @click="testPopularAnimes">
          {{ loading.popular ? 'Chargement...' : 'Tester Animes Populaires' }}
        </button>
        <div v-if="results.popular.length" class="results">
          <div
            v-for="anime in results.popular"
            :key="anime.url"
            class="anime-item"
          >
            <img
              v-if="anime.thumbnailUrl"
              :src="anime.thumbnailUrl"
              :alt="anime.title"
              class="thumbnail"
            />
            <div class="anime-info">
              <h3>{{ anime.title }}</h3>
              <p class="genre">{{ anime.genre }}</p>
              <p class="status">Status: {{ anime.status }}</p>
              <p class="description">{{ anime.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Recherche -->
      <section class="test-section">
        <h2>Recherche</h2>
        <div class="search-controls">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un anime..."
            @keyup.enter="testSearch"
          />
          <button :disabled="loading.search" @click="testSearch">
            {{ loading.search ? 'Recherche...' : 'Rechercher' }}
          </button>
        </div>
        <div v-if="results.search.length" class="results">
          <div
            v-for="anime in results.search"
            :key="anime.url"
            class="anime-item"
          >
            <img
              v-if="anime.thumbnailUrl"
              :src="anime.thumbnailUrl"
              :alt="anime.title"
              class="thumbnail"
            />
            <div class="anime-info">
              <h3>{{ anime.title }}</h3>
              <p class="genre">{{ anime.genre }}</p>
              <p class="status">Status: {{ anime.status }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Dernières Mises à Jour -->
      <section class="test-section">
        <h2>Dernières Mises à Jour</h2>
        <button :disabled="loading.latest" @click="testLatestUpdates">
          {{ loading.latest ? 'Chargement...' : 'Tester Dernières MAJ' }}
        </button>
        <div v-if="results.latest.length" class="results">
          <div
            v-for="anime in results.latest"
            :key="anime.url"
            class="anime-item"
          >
            <img
              v-if="anime.thumbnailUrl"
              :src="anime.thumbnailUrl"
              :alt="anime.title"
              class="thumbnail"
            />
            <div class="anime-info">
              <h3>{{ anime.title }}</h3>
              <p class="genre">{{ anime.genre }}</p>
              <p class="status">Status: {{ anime.status }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Épisodes -->
      <section class="test-section">
        <h2>Test Épisodes</h2>
        <button :disabled="loading.episodes" @click="testEpisodes">
          {{ loading.episodes ? 'Chargement...' : 'Tester Liste Épisodes' }}
        </button>
        <div v-if="results.episodes.length" class="results">
          <div
            v-for="episode in results.episodes.slice(0, 5)"
            :key="episode.episodeNumber"
            class="episode-item"
          >
            <h4>{{ episode.name }}</h4>
            <p>Numéro: {{ episode.episodeNumber }}</p>
            <p>Scanlator: {{ episode.scanlator }}</p>
            <button class="video-btn" @click="testVideoLinks(episode)">
              Tester Liens Vidéo
            </button>
          </div>
        </div>
      </section>

      <!-- Section Liens Vidéo -->
      <section v-if="results.videos.length" class="test-section">
        <h2>Liens Vidéo</h2>
        <div class="results">
          <div
            v-for="video in results.videos"
            :key="video.url"
            class="video-item"
          >
            <p><strong>Qualité:</strong> {{ video.quality }}</p>
            <p><strong>URL:</strong> {{ video.url }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { animeSamaService } from '@/services/extensions/animesama';
import ExtensionCard from '@/components/extension/ExtensionCard.vue';
import type {
  AnimeSamaAnime,
  AnimeSamaEpisode,
  AnimeSamaVideo,
} from '@/types/animesama';

// Interface pour les extensions
interface Extension {
  id: string;
  name: string;
  version: string;
  language: string;
  description: string;
  icon?: string;
  status: 'available' | 'installed' | 'active';
}

// État de chargement
const loading = reactive({
  popular: false,
  search: false,
  latest: false,
  episodes: false,
});

// Résultats des tests
const results = reactive({
  popular: [] as AnimeSamaAnime[],
  search: [] as AnimeSamaAnime[],
  latest: [] as AnimeSamaAnime[],
  episodes: [] as AnimeSamaEpisode[],
  videos: [] as AnimeSamaVideo[],
});

// Query de recherche
const searchQuery = ref('');

// Extensions disponibles
const availableExtensions = ref<Extension[]>([
  {
    id: 'animesama-fr',
    name: 'Anime-Sama',
    version: '1.0.0',
    language: 'Français',
    description:
      'Extension pour scraper le site Anime-Sama.fr et récupérer les animes en français.',
    status: 'active',
  },
]);

// Extension sélectionnée
const selectedExtension = ref<Extension | null>(availableExtensions.value[0]);

// Fonctions pour les extensions
function selectExtension(extension: Extension) {
  selectedExtension.value = extension;
  console.log('Extension sélectionnée:', extension.name);
}

function installExtension(extension: Extension) {
  extension.status = 'installed';
  console.log('Extension installée:', extension.name);
}

function activateExtension(extension: Extension) {
  extension.status = 'active';
  selectedExtension.value = extension;
  console.log('Extension activée:', extension.name);
}

function removeExtension(extension: Extension) {
  extension.status = 'available';
  if (selectedExtension.value?.id === extension.id) {
    selectedExtension.value = null;
  }
  console.log('Extension supprimée:', extension.name);
}

// Fonctions de test
async function testPopularAnimes() {
  loading.popular = true;
  try {
    const response = await animeSamaService.getPopularAnimes(1);
    results.popular = response.data;
    console.log('Animes populaires:', response);
  } catch (error) {
    console.error('Erreur lors du test des animes populaires:', error);
  } finally {
    loading.popular = false;
  }
}

async function testSearch() {
  if (!searchQuery.value.trim()) return;

  loading.search = true;
  try {
    const response = await animeSamaService.searchAnimes({
      query: searchQuery.value,
      page: 1,
    });
    results.search = response.data;
    console.log('Résultats de recherche:', response);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
  } finally {
    loading.search = false;
  }
}

async function testLatestUpdates() {
  loading.latest = true;
  try {
    const response = await animeSamaService.getLatestUpdates();
    results.latest = response.data;
    console.log('Dernières mises à jour:', response);
  } catch (error) {
    console.error('Erreur lors du test des dernières MAJ:', error);
  } finally {
    loading.latest = false;
  }
}

async function testEpisodes() {
  loading.episodes = true;
  try {
    const episodes = await animeSamaService.getEpisodeList('/test-anime');
    results.episodes = episodes;
    console.log('Liste des épisodes:', episodes);
  } catch (error) {
    console.error('Erreur lors du test des épisodes:', error);
  } finally {
    loading.episodes = false;
  }
}

async function testVideoLinks(episode: AnimeSamaEpisode) {
  try {
    const videos = await animeSamaService.getVideoList(episode);
    results.videos = videos;
    console.log('Liens vidéo pour', episode.name, ':', videos);
  } catch (error) {
    console.error('Erreur lors du test des liens vidéo:', error);
  }
}
</script>

<style scoped>
.extension-test {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  color: #f9fafb;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #f9fafb;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  color: #d1d5db;
  font-size: 1.1rem;
}

.test-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.test-section {
  background: rgba(31, 41, 55, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.5);
  backdrop-filter: blur(10px);
}

.test-section h2 {
  color: #f9fafb;
  margin-bottom: 1rem;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

button {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
}

button:disabled {
  background: rgba(55, 65, 81, 0.8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.search-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-controls input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  font-size: 0.9rem;
  background: rgba(17, 24, 39, 0.8);
  color: #f9fafb;
  backdrop-filter: blur(5px);
}

.search-controls input::placeholder {
  color: #9ca3af;
}

.search-controls input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.results {
  margin-top: 1.5rem;
}

.anime-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(5px);
  transition: all 0.2s;
}

.anime-item:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(17, 24, 39, 0.8);
}

.thumbnail {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  background: rgba(55, 65, 81, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.anime-info {
  flex: 1;
}

.anime-info h3 {
  color: #f9fafb;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.anime-info p {
  margin: 0.25rem 0;
  color: #d1d5db;
  font-size: 0.9rem;
}

.genre {
  color: #a78bfa !important;
  font-weight: 500;
}

.status {
  color: #34d399 !important;
  font-weight: 500;
}

.episode-item {
  padding: 1rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(5px);
}

.episode-item h4 {
  color: #f9fafb;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.episode-item p {
  margin: 0.25rem 0;
  color: #d1d5db;
  font-size: 0.9rem;
}

.video-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.video-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
}

.video-item {
  padding: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(5px);
}

.video-item p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #d1d5db;
}

.video-item strong {
  color: #f9fafb;
}

.extensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
</style>
