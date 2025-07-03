<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
  >
    <!-- Navigation Header -->
    <NavigationBar
      v-if="shouldShowNavbar"
      v-model="searchQuery"
      @search="handleSearch"
      @settings="handleSettings"
    />

    <!-- Contenu principal avec padding pour la navbar -->
    <main>
      <router-view />
    </main>
    <!-- Debug Navigation (seulement en développement) -->
    <NavigationDebug v-if="isDev" />

    <!-- Footer (optionnel, pour plus tard) -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from './components/ui/NavigationBar.vue';
import NavigationDebug from './components/debug/NavigationDebug.vue';

const route = useRoute();
const isDev = import.meta.env.DEV; // Vérifie si l'application est en mode développement

const searchQuery = ref('');

// Computed pour déterminer si la navbar doit être affichée
const shouldShowNavbar = computed(() => {
  // Masquer la navbar sur la page de détail d'anime
  return route.name !== 'AnimeDetail';
});

const handleSearch = (query: string) => {
  console.log('Recherche:', query);
  // Ici vous pouvez implémenter la logique de recherche
};

const handleSettings = () => {
  console.log('Ouvrir les paramètres');
  // Ici vous pouvez implémenter l'ouverture des paramètres
};
</script>

<style>
/* Styles globaux */
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app::before {
  background:
    radial-gradient(
      circle at 20% 80%,
      rgba(99, 102, 241, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(59, 130, 246, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(147, 197, 253, 0.03) 0%,
      transparent 50%
    );
  z-index: -1;
}
</style>
