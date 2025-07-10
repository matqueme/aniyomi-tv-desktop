<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
  >
    <!-- Navigation Header -->
    <NavigationBar
      v-if="shouldShowNavbar"
      v-model="searchQuery"
      @settings="handleSettings"
    />

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from './components/ui/NavigationBar.vue';

const route = useRoute();

const searchQuery = ref('');

// Computed pour déterminer si la navbar doit être affichée
const shouldShowNavbar = computed(() => {
  return route.name !== 'AnimeDetail' && route.name !== 'VideoWatch';
});

const handleSettings = () => {
  console.log('Ouvrir les paramètres');
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
