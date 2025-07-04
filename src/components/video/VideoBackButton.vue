<template>
  <div
    v-if="visible"
    v-focus-section:video-back-button="topControlsConfig"
    class="absolute left-0 right-0 top-0 z-20"
  >
    <button
      ref="backButtonRef"
      v-focus
      v-focus-events="{
        'enter-up': () => emit('goBack'),
        focused: () => emit('controlFocus', 'back'),
        unfocused: () => emit('controlUnfocus'),
      }"
      class="absolute left-4 top-4 flex items-center justify-center rounded-lg border border-slate-600/30 bg-slate-800/60 p-3 font-medium text-slate-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-red-400/40 hover:bg-slate-700/80 hover:text-white focus:scale-105 focus:border-red-400/80 focus:bg-red-400/70 focus:text-white focus:shadow-[0_0_0_2px_rgba(248,113,113,0.3),0_8px_20px_rgba(248,113,113,0.25)] focus:outline-none"
      :class="{
        'opacity-0': !controlsVisible && isPlaying,
        'opacity-100': controlsVisible || !isPlaying,
        'scale-105 border-red-400/80 bg-red-400/70 text-white shadow-[0_0_0_2px_rgba(248,113,113,0.3),0_8px_20px_rgba(248,113,113,0.25)]':
          focusedControl === 'back',
      }"
      @click="() => emit('goBack')"
    >
      <PhArrowLeft :size="24" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PhArrowLeft } from '@phosphor-icons/vue';

interface Props {
  visible: boolean;
  controlsVisible: boolean;
  isPlaying: boolean;
  focusedControl: string;
}

defineProps<Props>();

const emit = defineEmits<{
  goBack: [];
  controlFocus: [control: string];
  controlUnfocus: [];
}>();

const backButtonRef = ref<HTMLButtonElement>();

// Configuration pour la navigation spatiale
const topControlsConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    down: '@video-progress-bar',
  },
}));

defineExpose({
  backButtonRef,
});
</script>
