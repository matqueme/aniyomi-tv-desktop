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
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  z-index: 1000;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.4);
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
}

.loading-text {
  color: #e2e8f0;
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.025em;
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
    border-width: 2px;
  }

  .loading-text {
    font-size: 0.875rem;
  }
}
</style>
