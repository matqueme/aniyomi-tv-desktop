<template>
  <div id="app" class="bg-black text-white">
    <!-- Navigation Header -->
    <NavigationBar
      v-model="searchQuery"
      @search="handleSearch"
      @settings="handleSettings"
    />

    <!-- Contenu principal avec padding pour la navbar -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer (optionnel, pour plus tard) -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NavigationBar from './components/ui/NavigationBar.vue';

const searchQuery = ref('');

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

body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #000;
  color: #fff;
  overflow-x: hidden; /* Empêche le scroll horizontal */
  overflow-y: auto; /* Permet le scroll vertical */
}

#app {
  min-height: 100vh;
}

.main-content {
  padding-top: 64px; /* Hauteur de la navbar */
  min-height: calc(100vh - 64px);
}

.tv-test-indicator {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 400px;
  backdrop-filter: blur(8px);
}

.tv-test-text {
  color: #22c55e;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.tv-test-search {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
}

/* Styles pour le scroll horizontal */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
