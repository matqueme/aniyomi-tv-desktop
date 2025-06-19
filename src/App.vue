<template>
  <div id="app" class="bg-black text-white">
    <!-- Navigation Header (optionnel, pour plus tard) -->
    <!-- <AppHeader /> -->

    <!-- Contenu principal -->
    <router-view />

    <!-- Footer (optionnel, pour plus tard) -->
    <!-- <AppFooter /> -->
  </div>
</template>

<script setup lang="ts">
// Configuration globale si nécessaire
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

/* Styles pour le scroll horizontal */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
