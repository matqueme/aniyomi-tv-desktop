<template>
  <div
    class="fixed right-4 bottom-4 rounded-lg border border-slate-600/40 bg-slate-900/90 p-4 font-mono text-sm text-white shadow-lg backdrop-blur-md"
  >
    <h3 class="mb-2 font-bold">🎮 Navigation Debug</h3>
    <div class="space-y-1">
      <div>Actif: {{ isActive ? '✅' : '❌' }}</div>
      <div>Éléments: {{ totalElements }}</div>
      <div>Index: {{ activeElementIndex }}</div>
      <div>Élément: {{ activeElement?.title || 'Aucun' }}</div>
      <div>Type: {{ activeElement?.type || 'N/A' }}</div>
      <div>Focus: {{ activeElement?.getFocusedIndex?.() || 0 }}</div>
      <div class="mt-1 text-xs text-slate-400">
        Navbar: {{ navbar ? '✅' : '❌' }} | Listes: {{ totalLists }}
      </div>
    </div>
    <div class="mt-2 border-t border-slate-600/50 pt-2">
      <div class="text-xs text-slate-400">
        ⬆️⬇️ Navigation verticale | ⬅️➡️ Navigation horizontale | ⏎ Sélection
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNavigationStore } from '@/stores/navigation';

const navigationStore = useNavigationStore();

const isActive = computed(() => navigationStore.isNavigationActive);
const totalElements = computed(() => navigationStore.totalElements);
const activeElementIndex = computed(() => navigationStore.activeElementIndex);
const activeElement = computed(() => navigationStore.activeElement);
const navbar = computed(() => navigationStore.navbar);
const totalLists = computed(() => navigationStore.totalLists);
</script>
