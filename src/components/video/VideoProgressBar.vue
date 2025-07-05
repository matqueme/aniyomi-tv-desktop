<template>
  <div
    v-focus-section:video-progress-bar="controlsNavigationConfig"
    class="progress-container mb-6"
  >
    <!-- Temps et infos -->
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center space-x-4 text-sm font-medium">
        <span class="text-white">{{ formatTime(currentTime) }}</span>
        <span class="text-slate-400">/</span>
        <span class="text-slate-300">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Barre de progression -->
    <div
      ref="progressBarRef"
      v-focus
      v-focus-events="{
        'enter-up': () => emit('togglePlayPause'),
        focused: () => emit('controlFocus', 'progress'),
      }"
      class="progress-bar group relative h-1.5 cursor-pointer rounded-full bg-slate-600/60 backdrop-blur-sm transition-all duration-200 hover:h-2"
      :class="{
        'h-2 ring-2 ring-indigo-400 ring-offset-2 ring-offset-black/50':
          focusedControl === 'progress',
        'h-2': focusedControl === 'progress',
      }"
      @click="seekToPosition"
    >
      <!-- Buffer (optionnel) -->
      <div
        class="absolute inset-y-0 left-0 rounded-full bg-slate-500/40"
        style="width: 85%"
      ></div>

      <!-- Progress actuel -->
      <div
        class="progress-fill relative h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-lg transition-all duration-150"
        :style="{ width: progressPercentage + '%' }"
      >
        <!-- Thumb -->
        <div
          class="progress-thumb absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white shadow-lg transition-all duration-200 group-hover:scale-110"
          :class="{
            'scale-125 shadow-indigo-500/50': focusedControl === 'progress',
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  currentTime: number;
  duration: number;
  focusedControl: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  seek: [time: number];
  controlFocus: [control: string];
  togglePlayPause: [];
}>();

// Configuration pour la navigation spatiale
const controlsNavigationConfig = computed(() => ({
  enterTo: 'default-element',
  leaveFor: {
    up: '@video-back-button',
    down: '@video-controls',
    left: '',
    right: '',
  },
}));

const progressBarRef = ref<HTMLDivElement>();

const progressPercentage = computed(() => {
  return props.duration > 0 ? (props.currentTime / props.duration) * 100 : 0;
});

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const seekToPosition = (event: MouseEvent) => {
  if (!progressBarRef.value) return;

  const rect = progressBarRef.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * props.duration;
  emit('seek', newTime);
};

defineExpose({
  progressBarRef,
});
</script>

<style scoped>
/* Barre de progression */
.progress-bar {
  outline: none;
  transition: height 0.2s ease-out;
}

.progress-bar:hover .progress-thumb {
  transform: translateY(-50%) translateX(50%) scale(1.2);
}

.progress-fill {
  position: relative;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.progress-thumb {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(99, 102, 241, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.9);
}
</style>
