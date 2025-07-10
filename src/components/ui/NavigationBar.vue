<template>
  <nav
    v-focus-section:navbar="navbarConfig"
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
          v-focus="$route.name !== 'Search'"
          v-focus-events="{
            'enter-up': onSearchClick,
            focused: () => (isSearchFocused = true),
            unfocused: () => (isSearchFocused = false),
          }"
          class="relative flex w-full cursor-pointer items-center rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out focus-none"
          :class="[
            isSearchFocused
              ? 'scale-[1.01] border-indigo-500 bg-slate-800/90 shadow-lg shadow-indigo-500/20'
              : 'border-slate-600/40 bg-slate-800/60',
          ]"
          @click="onSearchClick"
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
      <div class="flex flex-shrink-0 items-center gap-2">
        <button
          ref="settingsButtonRef"
          v-focus
          v-focus-events="{
            'enter-up': onSettingsClick,
            focused: () => (isSettingsFocused = true),
            unfocused: () => (isSettingsFocused = false),
          }"
          class="flex cursor-pointer items-center justify-center rounded-lg border p-2 text-slate-400 transition-all duration-300 ease-in-out focus-none hover:text-slate-200"
          :class="[
            isSettingsFocused
              ? 'scale-[1.01] border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
              : 'border-transparent hover:border-indigo-500/40 hover:bg-indigo-500/10',
          ]"
          @click="onSettingsClick"
        >
          <ph-gear :size="24" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PhMagnifyingGlass, PhGear } from '@phosphor-icons/vue';
import { useRouter, useRoute } from 'vue-router';

interface Emits {
  (e: 'settings'): void;
}

const router = useRouter();
const route = useRoute();
const emit = defineEmits<Emits>();

// Références pour les éléments focusables
const searchButtonRef = ref<HTMLButtonElement>();
const settingsButtonRef = ref<HTMLButtonElement>();

// États des éléments focusés
const isNavbarActive = ref(false);
const isSearchFocused = ref(false);
const isSettingsFocused = ref(false);

// Configuration de la section spatiale
const navbarConfig = computed(() => ({
  enterTo: 'default-element', // Permettre l'entrée par défaut dans la navbar
  leaveFor: {
    down:
      route.name === 'Search'
        ? '@header'
        : route.name === 'VideoWatch'
          ? '@video-top-controls'
          : '@trending', // Navigation adaptée selon la page
    up: route.name === 'VideoWatch' ? '@video-top-controls' : '', // Permettre la navigation vers les contrôles vidéo
  },
}));

const disableFocus = () => {
  isNavbarActive.value = false;
  isSearchFocused.value = false;
  isSettingsFocused.value = false;
};

// Fonction pour gérer le clic sur le bouton de recherche
const onSearchClick = () => {
  disableFocus();
  router.push('/search');
};

// Fonction pour gérer le clic sur le bouton de paramètres
const onSettingsClick = () => {
  disableFocus();
  emit('settings');
};
</script>
