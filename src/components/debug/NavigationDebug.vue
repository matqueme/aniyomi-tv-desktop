<template>
  <div
    class="fixed right-4 bottom-4 rounded-lg border border-slate-600/40 bg-slate-900/90 p-4 font-mono text-sm text-white shadow-lg backdrop-blur-md select-all"
  >
    <h3 class="mb-2 font-bold">🎮 Navigation Debug</h3>
    <div class="space-y-1">
      <div>Actif: {{ isActive ? '✅' : '❌' }}</div>
      <div>Éléments: {{ totalElements }}</div>
      <div class="font-bold">
        Élément: {{ activeElement?.title || 'Aucun' }}
        <span v-if="activeElement" class="text-indigo-400">
          ({{ activeElement.type }})
        </span>
      </div>
      <div class="flex gap-4">
        <span class="text-yellow-400">Zone: {{ activeElementIndex }}</span>
        <span class="text-green-400"
          >Item: {{ activeElement?.getFocusedIndex?.() || 0 }}</span
        >
      </div>
      <div class="mt-1 text-xs text-slate-400">
        Navbar: {{ navbar ? '✅' : '❌' }} | Listes: {{ totalLists }}
      </div>

      <!-- Indicateur visuel des touches pressées -->
      <div class="mt-2 border-t border-slate-600/50 pt-2">
        <div v-if="lastKeyPressed" class="text-xs text-green-300">
          Dernière touche: {{ lastKeyPressed }}
        </div>
        <div v-else class="text-xs text-slate-500">
          Appuyez sur une touche...
        </div>
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useNavigationStore } from '@/stores/navigation';

const navigationStore = useNavigationStore();

const isActive = computed(() => navigationStore.isNavigationActive);
const totalElements = computed(() => navigationStore.totalElements);
const activeElementIndex = computed(() => navigationStore.activeElementIndex);
const activeElement = computed(() => navigationStore.activeElement);
const navbar = computed(() => navigationStore.navbar);
const totalLists = computed(() => navigationStore.totalLists);

// Tracking des touches pressées
const lastKeyPressed = ref('');

const handleKeyDown = (event: KeyboardEvent) => {
  lastKeyPressed.value = `${event.key} (${event.keyCode})`;

  // Clear après 2 secondes
  setTimeout(() => {
    if (lastKeyPressed.value === `${event.key} (${event.keyCode})`) {
      lastKeyPressed.value = '';
    }
  }, 2000);
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
