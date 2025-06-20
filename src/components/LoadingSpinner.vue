<template>
  <div class="loading-container">
    <div class="loading-content">
      <!-- Simple spinner -->
      <div class="spinner"></div>

      <!-- Texte simple -->
      <p class="loading-text">{{ title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Chargement...',
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #ef4444;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: white;
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-container {
    padding: 1rem;
  }

  .spinner {
    width: 30px;
    height: 30px;
  }

  .loading-text {
    font-size: 0.875rem;
  }
}
</style>
