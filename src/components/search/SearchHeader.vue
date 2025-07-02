<template>
  <div
    v-focus-section:header.default="headerSectionConfig"
    class="flex items-center gap-4"
  >
    <!-- Bouton retour -->
    <button
      ref="backButtonRef"
      v-focus
      v-focus-events="{
        'enter-up': goBack,
        focused: () => (isBackButtonFocused = true),
        unfocused: () => (isBackButtonFocused = false),
      }"
      class="flex items-center justify-center rounded-lg border p-3 text-slate-400 transition-all duration-300 ease-in-out hover:text-slate-200 focus:outline-none"
      :class="[
        isBackButtonFocused
          ? 'scale-[1.05] border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
          : 'border-slate-600/40 hover:border-indigo-500/40 hover:bg-indigo-500/10',
      ]"
    >
      <ph-arrow-left :size="24" />
    </button>

    <!-- Affichage du texte de recherche -->
    <div class="flex-1">
      <div
        class="flex items-center rounded-xl border px-6 py-4 transition-all duration-300 ease-in-out"
        :class="[
          searchText
            ? 'border-indigo-500/60 bg-slate-800/90'
            : 'border-slate-600/40 bg-slate-800/60',
        ]"
      >
        <ph-magnifying-glass
          class="mr-4 flex-shrink-0 text-slate-400"
          :size="24"
        />
        <div class="flex-1">
          <span v-if="searchText" class="text-lg text-slate-200">
            {{ searchText }}
          </span>
          <span v-else class="text-lg text-slate-500">
            Utilisez le clavier virtuel pour rechercher...
          </span>
          <span
            class="ml-1 animate-pulse text-lg text-indigo-400"
            :class="{ 'opacity-0': !showCursor }"
          >
            |
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { PhArrowLeft, PhMagnifyingGlass } from '@phosphor-icons/vue';

// Props
interface Props {
  searchText: string;
}

defineProps<Props>();

// Router
const router = useRouter();

// Refs
const backButtonRef = ref<HTMLButtonElement>();

// État
const isBackButtonFocused = ref(false);
const showCursor = ref(true);

// Configuration de la section spatiale
const headerSectionConfig = ref({
  enterTo: 'default-element',
  leaveFor: {
    down: '@keyboard',
    up: '@navbar',
  },
});

// Intervalle pour le curseur clignotant
let cursorInterval: number;

// Méthodes
const goBack = () => {
  router.back();
};

// Gestion du curseur clignotant
onMounted(() => {
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 500);
});

onUnmounted(() => {
  if (cursorInterval) {
    clearInterval(cursorInterval);
  }
});
</script>
