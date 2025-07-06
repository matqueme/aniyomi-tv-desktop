<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
    <div class="mb-4 flex items-start justify-between">
      <div class="flex-1">
        <h3 class="mb-1 text-xl font-bold text-gray-900">
          {{ extension.metadata.name }}
        </h3>
        <p class="mb-2 text-sm text-gray-600">
          {{ extension.metadata.description }}
        </p>

        <div class="mb-3 flex flex-wrap gap-2">
          <span
            class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
          >
            v{{ extension.metadata.version }}
          </span>
          <span
            class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
          >
            {{ extension.metadata.lang.toUpperCase() }}
          </span>
          <span
            v-if="extension.metadata.nsfw"
            class="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800"
          >
            NSFW
          </span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2">
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          @click="$emit('select', extension.metadata.id)"
        >
          Sélectionner
        </button>

        <div class="text-right text-xs text-gray-500">
          <div>{{ extension.metadata.baseUrl }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-700">Derniers animes :</span>
        <span
          class="rounded px-2 py-1 text-xs"
          :class="
            extension.supportsLatest
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          "
        >
          {{ extension.supportsLatest ? 'Supporté' : 'Non supporté' }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-700">Recherche :</span>
        <span
          class="rounded px-2 py-1 text-xs"
          :class="
            extension.supportsSearch
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          "
        >
          {{ extension.supportsSearch ? 'Supportée' : 'Non supportée' }}
        </span>
      </div>
    </div>

    <!-- Filtres disponibles -->
    <div
      v-if="showFilters && filters.length > 0"
      class="mt-4 border-t border-gray-200 pt-4"
    >
      <h4 class="mb-2 font-medium text-gray-700">Filtres disponibles :</h4>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="filter in filters"
          :key="filter.name"
          class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
        >
          {{ filter.displayName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import type { AnimeExtension } from '../../types/extension';

interface Props {
  extension: AnimeExtension;
  showFilters?: boolean;
}

interface Emits {
  (e: 'select', extensionId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: false,
});

defineEmits<Emits>();

const filters = computed(() => {
  return props.showFilters ? props.extension.getFilters() : [];
});
</script>
