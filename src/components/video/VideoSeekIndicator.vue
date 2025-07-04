<template>
  <div
    v-if="visible"
    class="pointer-events-none absolute inset-0 flex items-center justify-center"
  >
    <div
      class="seek-indicator flex items-center justify-center rounded-lg bg-black/50 px-4 py-3 backdrop-blur-sm transition-all duration-300 ease-out"
    >
      <component
        :is="direction === 'forward' ? PhFastForward : PhRewind"
        :size="28"
        class="text-white/90"
      />
      <span class="ml-2 text-base font-medium text-white/90">10s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhFastForward, PhRewind } from '@phosphor-icons/vue';

interface Props {
  visible: boolean;
  direction: 'forward' | 'backward';
}

defineProps<Props>();
</script>

<style scoped>
@keyframes seekFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes seekFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

.seek-indicator {
  animation: seekFadeIn 0.2s ease-out;
}
</style>
