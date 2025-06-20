<template>
  <div
    class="bg-opacity-75 fixed right-4 bottom-4 rounded-lg bg-black p-4 font-mono text-sm text-white"
  >
    <h3 class="mb-2 font-bold">🎮 Navigation Debug</h3>
    <div class="space-y-1">
      <div>Actif: {{ isActive ? '✅' : '❌' }}</div>
      <div>Listes: {{ totalLists }}</div>
      <div>Index: {{ activeListIndex }}</div>
      <div>Liste: {{ activeList?.title || 'Aucune' }}</div>
      <div>Focus: {{ activeList?.getFocusedIndex?.() || 0 }}</div>
    </div>
    <div class="mt-2 border-t border-gray-600 pt-2">
      <div class="text-xs text-gray-400">
        ⬆️⬇️ Navigation verticale | ⬅️➡️ Navigation horizontale | ⏎ Sélection
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNavigationStore } from '../../stores/navigation';

const navigationStore = useNavigationStore();

const isActive = computed(() => navigationStore.isNavigationActive);
const totalLists = computed(() => navigationStore.totalLists);
const activeListIndex = computed(() => navigationStore.activeListIndex);
const activeList = computed(() => navigationStore.activeList);
</script>
