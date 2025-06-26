<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 h-16 border-b shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out"
    :class="[
      isNavbarActive
        ? 'border-indigo-400/40 bg-slate-900/98 shadow-lg'
        : 'border-slate-600/30 bg-slate-900/95 shadow-md',
    ]"
    :data-navbar-id="navbarId"
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
          class="relative flex w-full cursor-pointer items-center rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out focus:outline-none"
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
      <div class="flex flex-shrink-0 items-center">
        <button
          ref="settingsButtonRef"
          class="flex cursor-pointer items-center justify-center rounded-lg border p-2 text-slate-400 transition-all duration-300 ease-in-out hover:text-slate-200 focus:outline-none"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { PhMagnifyingGlass, PhGear } from '@phosphor-icons/vue';
import { useRouter } from 'vue-router';
import { useNavbarNavigation } from '@/composables/useNavbarNavigation';

interface Emits {
  (e: 'settings'): void;
}

const router = useRouter();
const emit = defineEmits<Emits>();

const navbarId = 'main-navbar';

// Références pour les éléments focusables
const searchButtonRef = ref<HTMLButtonElement>();
const settingsButtonRef = ref<HTMLButtonElement>();

// Navigation navbar
const {
  isActive: isNavbarActive,
  isElementFocused,
  addElement,
  clearElements,
} = useNavbarNavigation(navbarId);

// Computed properties pour déterminer l'état de la page
const isOnSearchPage = computed(
  () => router.currentRoute.value.name === 'Search'
);
const searchIndex = computed(() => (isOnSearchPage.value ? -1 : 0));
const settingsIndex = computed(() => (isOnSearchPage.value ? 0 : 1));

// États des éléments focusés
const isSearchFocused = computed(
  () => isNavbarActive.value && isElementFocused(searchIndex.value)
);

const isSettingsFocused = computed(
  () => isNavbarActive.value && isElementFocused(settingsIndex.value)
);

// Fonction pour gérer le clic sur le bouton de recherche
const onSearchClick = () => {
  router.push('/search');
};

// Fonction pour gérer le clic sur le bouton de paramètres
const onSettingsClick = () => {
  emit('settings');
};

// Fonction pour gérer les éléments navigables
const updateNavigation = async () => {
  // Nettoyer les éléments existants
  clearElements();

  await nextTick();

  // Ajouter les éléments selon la page
  if (!isOnSearchPage.value && searchButtonRef.value) {
    addElement('search', searchButtonRef.value, () =>
      searchButtonRef.value?.focus()
    );
  }

  if (settingsButtonRef.value) {
    addElement('settings', settingsButtonRef.value, () =>
      settingsButtonRef.value?.focus()
    );
  }
};

// Initialisation et gestion des changements de route
onMounted(() => {
  updateNavigation();
});

watch(
  () => router.currentRoute.value.name,
  async () => {
    await updateNavigation();
  }
);
</script>
