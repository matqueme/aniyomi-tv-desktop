<template>
  <div
    class="fixed bottom-4 right-4 z-50 select-all rounded-lg border border-slate-600/40 bg-slate-900/90 p-4 font-mono text-sm text-white shadow-lg backdrop-blur-md"
  >
    <h3 class="mb-2 font-bold">🎮 Navigation Debug</h3>
    <div class="space-y-1">
      <div>Navigation Spatiale: ✅ Activée</div>
      <div>Système: vue-spatial-nav</div>
      <div class="mt-1 text-xs text-slate-400">
        Navigation automatique par directives
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
        ⬆️⬇️⬅️➡️ Navigation spatiale | ⏎ Sélection | ESC Retour
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const lastKeyPressed = ref<string>('');

// Gestionnaire d'événements pour les touches
const handleKeyDown = (event: KeyboardEvent) => {
  const keyName = getKeyName(event);
  lastKeyPressed.value = keyName;

  // Effacer après 2 secondes
  setTimeout(() => {
    if (lastKeyPressed.value === keyName) {
      lastKeyPressed.value = '';
    }
  }, 2000);
};

// Convertir les codes de touches en noms lisibles
const getKeyName = (event: KeyboardEvent): string => {
  switch (event.keyCode) {
    case 37:
      return '⬅️ LEFT';
    case 38:
      return '⬆️ UP';
    case 39:
      return '➡️ RIGHT';
    case 40:
      return '⬇️ DOWN';
    case 13:
      return '⏎ ENTER';
    case 27:
      return '⎋ ESC';
    case 10009:
      return '🔙 BACK (Tizen)';
    default:
      return `${event.key || event.keyCode}`;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
