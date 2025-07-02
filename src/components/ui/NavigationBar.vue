<template>
  <nav
    v-focus-section:navbar="navbarConfig"
    :data-navbar-id="navbarId"
    data-sn-section="navbar"
    class="fixed left-0 right-0 top-0 z-50 h-16 border-b shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out"
    :class="[
      isNavbarActive
        ? 'bg-slate-900/98 border-indigo-400/40 shadow-lg'
        : 'border-slate-600/30 bg-slate-900/95 shadow-md',
    ]"
  >
    <div
      class="mx-auto flex h-full max-w-7xl items-center justify-between px-8"
    >
      <!-- Logo à gauche -->
      <div class="flex flex-shrink-0 items-center gap-3">
        <img
          src="/icon.png"
          alt="Aniyomi"
          class="h-8 w-8 rounded-md object-cover"
        />
        <span
          class="hidden text-xl font-bold tracking-tight text-slate-200 sm:block"
          >Aniyomi</span
        >
      </div>

      <!-- Bouton de recherche au centre -->
      <div v-if="$route.name !== 'Search'" class="mx-8 max-w-md flex-1">
        <button
          ref="searchButtonRef"
          v-focus
          v-focus-events="{
            'enter-up': onSearchClick,
            focused: () => (isSearchFocused = true),
            unfocused: () => (isSearchFocused = false),
          }"
          class="relative flex w-full cursor-pointer items-center rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out focus:outline-none"
          :class="[
            isSearchFocused
              ? 'scale-[1.01] border-indigo-500 bg-slate-800/90 shadow-lg shadow-indigo-500/20'
              : 'border-slate-600/40 bg-slate-800/60',
          ]"
        >
          <ph-magnifying-glass
            class="mr-3 flex-shrink-0 text-slate-400"
            :size="20"
          />
          <span class="flex-1 text-left text-sm text-slate-500">
            Rechercher des animes...
          </span>
        </button>
      </div>

      <!-- Icône paramètres à droite -->
      <div class="flex flex-shrink-0 items-center">
        <button
          ref="settingsButtonRef"
          v-focus
          v-focus-events="{
            'enter-up': onSettingsClick,
            focused: () => (isSettingsFocused = true),
            unfocused: () => (isSettingsFocused = false),
          }"
          class="flex cursor-pointer items-center justify-center rounded-lg border p-2 text-slate-400 transition-all duration-300 ease-in-out hover:text-slate-200 focus:outline-none"
          :class="[
            isSettingsFocused
              ? 'scale-[1.01] border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
              : 'border-transparent hover:border-indigo-500/40 hover:bg-indigo-500/10',
          ]"
        >
          <ph-gear :size="24" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PhMagnifyingGlass, PhGear } from '@phosphor-icons/vue';
import { useRouter } from 'vue-router';

interface Emits {
  (e: 'settings'): void;
}

const router = useRouter();
const emit = defineEmits<Emits>();

const navbarId = 'main-navbar';

// Références pour les éléments focusables
const searchButtonRef = ref<HTMLButtonElement>();
const settingsButtonRef = ref<HTMLButtonElement>();

// États des éléments focusés
const isNavbarActive = ref(false);
const isSearchFocused = ref(false);
const isSettingsFocused = ref(false);

// Configuration de la section spatiale
const navbarConfig = ref({
  enterTo: 'default-element',
  leaveFor: {
    down: 'trending', // Permettre la navigation vers la section trending en bas
  },
  restrict: 'self-first',
});

// Fonction pour gérer le clic sur le bouton de recherche
const onSearchClick = () => {
  router.push('/search');
};

// Fonction pour gérer le clic sur le bouton de paramètres
const onSettingsClick = () => {
  emit('settings');
};
</script>
