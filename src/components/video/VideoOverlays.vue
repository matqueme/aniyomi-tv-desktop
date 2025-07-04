<template>
  <!-- Overlay de chargement -->
  <div
    v-if="isLoading"
    class="loading-overlay absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md"
  >
    <LoadingSpinner />
    <p class="mt-4 text-lg font-medium text-slate-300">
      Chargement de la vidéo...
    </p>
  </div>

  <!-- Overlay d'erreur -->
  <div
    v-if="error"
    class="error-overlay absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md"
  >
    <div class="max-w-md text-center">
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-red-500/20 p-4">
          <PhWarning :size="48" class="text-red-400" />
        </div>
      </div>
      <h3 class="mb-3 text-2xl font-bold text-white">Erreur de lecture</h3>
      <p class="mb-6 leading-relaxed text-slate-300">{{ error }}</p>
      <button
        class="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        @click="() => emit('retry')"
      >
        Réessayer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhWarning } from '@phosphor-icons/vue';
import LoadingSpinner from '../ui/LoadingSpinner.vue';

interface Props {
  isLoading: boolean;
  error: string;
}

defineProps<Props>();

const emit = defineEmits<{
  retry: [];
}>();
</script>
