<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
  >
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  background-attachment: fixed;
  color: #fff;
  overflow-x: hidden; /* Empêche le scroll horizontal */
  overflow-y: auto; /* Permet le scroll vertical */
}

#app {
  min-height: 100vh;
  position: relative;
}

#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  pointer-events: none;
  z-index: -1;
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
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 0.75rem;
  padding: 1rem;
  max-width: 400px;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.tv-test-text {
  color: #6366f1;
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
