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
          ref="searchWrapperRef"
          class="relative flex w-full cursor-pointer items-center rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out"
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
import { ref, watch, onMounted, nextTick, computed } from 'vue';
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
const searchWrapperRef = ref<HTMLButtonElement>();
const settingsButtonRef = ref<HTMLButtonElement>();

// Navigation navbar
const {
  isActive: isNavbarActive,
  addElement,
  removeElement,
  isElementFocused,
} = useNavbarNavigation(navbarId);

// Computed properties pour les indices des éléments
const elementIndices = computed(() => {
  const isOnSearchPage = router.currentRoute.value.name === 'Search';

  if (isOnSearchPage) {
    // Sur la page de recherche, seuls les paramètres sont disponibles
    return {
      searchIndex: -1,
      settingsIndex: 0,
    };
  } else {
    return {
      searchIndex: 0,
      settingsIndex: 1,
    };
  }
});

// États des éléments focusés (computed properties)
const isSearchFocused = computed(
  () =>
    isNavbarActive.value && isElementFocused(elementIndices.value.searchIndex)
);

const isSettingsFocused = computed(
  () =>
    isNavbarActive.value && isElementFocused(elementIndices.value.settingsIndex)
);

// Configuration des éléments navigables
onMounted(() => {
  // Ajouter le bouton de recherche comme élément navigable seulement si on n'est pas sur la page de recherche
  if (router.currentRoute.value.name !== 'Search') {
    addElement('search', searchWrapperRef.value || null, () => {
      // Juste donner le focus visuel, pas naviguer
      // Le clic ou Enter navigueront
    });
  }

  // Ajouter le bouton paramètres
  addElement('settings', settingsButtonRef.value || null, () => {
    settingsButtonRef.value?.focus();
  });
});

// Surveiller les changements de route pour réajuster les éléments navigables
watch(
  () => router.currentRoute.value.name,
  (newRouteName, oldRouteName) => {
    const wasOnSearch = oldRouteName === 'Search';
    const isOnSearch = newRouteName === 'Search';

    if (!wasOnSearch && isOnSearch) {
      // On arrive sur la page de recherche, supprimer les éléments de recherche
      removeElement('search');
    } else if (wasOnSearch && !isOnSearch) {
      // On quitte la page de recherche, ajouter les éléments de recherche
      nextTick(() => {
        if (searchWrapperRef.value) {
          addElement('search', searchWrapperRef.value, () => {
            // Juste donner le focus visuel
          });
        }
      });
    }
  }
);

// Fonction pour gérer le clic sur le bouton de recherche
const onSearchClick = () => {
  router.push('/search');
};

// Fonction pour gérer le clic sur le bouton de paramètres
const onSettingsClick = () => {
  emit('settings');
};
</script>
