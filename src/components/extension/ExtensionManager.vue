&lt;template&gt; &lt;div class="p-4"&gt; &lt;h1 class="text-2xl font-bold
mb-4"&gt;Gestionnaire d'Extensions&lt;/h1&gt; &lt;!-- Sélecteur d'extension
--&gt; &lt;div class="mb-6"&gt; &lt;h2 class="text-lg font-semibold
mb-2"&gt;Extension actuelle&lt;/h2&gt; &lt;select
v-model="extensionStore.currentExtensionId" @change="loadData" class="p-2 border
rounded" &gt; &lt;option v-for="extension in extensionStore.enabledExtensions"
:key="extension.id" :value="extension.id" &gt;
{{ extension.name }}
&lt;/option&gt; &lt;/select&gt; &lt;/div&gt; &lt;!-- Liste des extensions --&gt;
&lt;div class="mb-6"&gt; &lt;h2 class="text-lg font-semibold mb-2"&gt;Extensions
disponibles&lt;/h2&gt; &lt;div class="grid gap-2"&gt; &lt;div v-for="extension
in extensionStore.extensions" :key="extension.id" class="flex items-center
justify-between p-3 border rounded" &gt; &lt;div&gt; &lt;h3
class="font-medium"&gt;{{ extension.name }}&lt;/h3&gt; &lt;p class="text-sm
text-gray-600"&gt;{{ extension.description }}&lt;/p&gt; &lt;p class="text-xs
text-gray-500"&gt;Version {{ extension.version }}&lt;/p&gt; &lt;/div&gt;
&lt;button @click="extensionStore.toggleExtension(extension.id)"
:class="extension.isEnabled ? 'bg-green-500' : 'bg-gray-500'" class="px-3 py-1
text-white rounded text-sm" &gt;
{{ extension.isEnabled ? 'Activé' : 'Désactivé' }}
&lt;/button&gt; &lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;!-- Animes populaires
--&gt; &lt;div class="mb-6"&gt; &lt;h2 class="text-lg font-semibold
mb-2"&gt;Animes populaires&lt;/h2&gt; &lt;div v-if="animeStore.loadingPopular"
class="text-center py-4"&gt; Chargement... &lt;/div&gt; &lt;div
v-else-if="animeStore.error" class="text-red-500 py-4"&gt;
{{ animeStore.error }}
&lt;/div&gt; &lt;div v-else class="grid grid-cols-2 md:grid-cols-4
lg:grid-cols-6 gap-4"&gt; &lt;div v-for="anime in animeStore.popularAnimes"
:key="anime.id" class="border rounded p-2" &gt; &lt;img :src="anime.posterUrl"
:alt="anime.title" class="w-full h-48 object-cover rounded mb-2" &gt; &lt;h3
class="font-medium text-sm"&gt;{{ anime.title }}&lt;/h3&gt; &lt;p class="text-xs
text-gray-600"&gt;{{ anime.year }}&lt;/p&gt; &lt;/div&gt; &lt;/div&gt;
&lt;/div&gt; &lt;!-- Dernières mises à jour --&gt; &lt;div class="mb-6"&gt;
&lt;h2 class="text-lg font-semibold mb-2"&gt;Dernières mises à jour&lt;/h2&gt;
&lt;div v-if="animeStore.loadingLatest" class="text-center py-4"&gt;
Chargement... &lt;/div&gt; &lt;div v-else class="grid grid-cols-2 md:grid-cols-4
lg:grid-cols-6 gap-4"&gt; &lt;div v-for="anime in animeStore.latestAnimes"
:key="anime.id" class="border rounded p-2" &gt; &lt;img :src="anime.posterUrl"
:alt="anime.title" class="w-full h-48 object-cover rounded mb-2" &gt; &lt;h3
class="font-medium text-sm"&gt;{{ anime.title }}&lt;/h3&gt; &lt;p class="text-xs
text-gray-600"&gt;{{ anime.year }}&lt;/p&gt; &lt;/div&gt; &lt;/div&gt;
&lt;/div&gt; &lt;!-- Recherche --&gt; &lt;div class="mb-6"&gt; &lt;h2
class="text-lg font-semibold mb-2"&gt;Recherche&lt;/h2&gt; &lt;div class="flex
gap-2 mb-4"&gt; &lt;input v-model="searchQuery" @keyup.enter="search"
type="text" placeholder="Rechercher un anime..." class="flex-1 p-2 border
rounded" &gt; &lt;button @click="search" :disabled="animeStore.loadingSearch"
class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
disabled:opacity-50" &gt; Rechercher &lt;/button&gt; &lt;/div&gt; &lt;div
v-if="animeStore.loadingSearch" class="text-center py-4"&gt; Recherche en
cours... &lt;/div&gt; &lt;div v-else-if="animeStore.searchResults.length &gt; 0"
class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"&gt; &lt;div
v-for="anime in animeStore.searchResults" :key="anime.id" class="border rounded
p-2" &gt; &lt;img :src="anime.posterUrl" :alt="anime.title" class="w-full h-48
object-cover rounded mb-2" &gt; &lt;h3 class="font-medium text-sm"&gt;{{
  anime.title
}}&lt;/h3&gt; &lt;p class="text-xs text-gray-600"&gt;{{ anime.year }}&lt;/p&gt;
&lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;/div&gt; &lt;/template&gt; &lt;script
setup lang="ts"&gt; import { ref, onMounted } from 'vue'; import {
useExtensionStore, useAnimeStore } from '@/stores/extensions'; const
extensionStore = useExtensionStore(); const animeStore = useAnimeStore(); const
searchQuery = ref(''); const loadData = async () => { if
(extensionStore.currentExtensionId) { await Promise.all([
animeStore.fetchPopularAnimes(extensionStore.currentExtensionId),
animeStore.fetchLatestAnimes(extensionStore.currentExtensionId) ]); } }; const
search = async () => { if (searchQuery.value.trim() &&
extensionStore.currentExtensionId) { await
animeStore.searchAnimes(extensionStore.currentExtensionId,
searchQuery.value.trim()); } }; onMounted(async () => {
extensionStore.loadExtensions(); await loadData(); }); &lt;/script&gt;
