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

      <!-- Barre de recherche au centre -->
      <div class="mx-8 max-w-md flex-1">
        <div
          class="relative flex items-center rounded-xl border px-4 transition-all duration-300 ease-in-out"
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
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des animes..."
            class="flex-1 border-none bg-transparent py-3 text-sm text-slate-200 placeholder-slate-500 outline-none"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            ref="clearSearchButtonRef"
            class="ml-2 cursor-pointer rounded p-1 text-slate-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-slate-200 focus:outline-none"
            :class="[
              isClearSearchFocused
                ? 'scale-[1.05] bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
                : '',
            ]"
            @click="clearSearch"
          >
            <ph-x :size="16" />
          </button>
        </div>
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
import { PhMagnifyingGlass, PhX, PhGear } from '@phosphor-icons/vue';
import { useNavbarNavigation } from '@/composables/useNavbarNavigation';

interface Props {
  modelValue?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'search', query: string): void;
  (e: 'settings'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<Emits>();

const navbarId = 'main-navbar';
const searchQuery = ref(props.modelValue);

// Références pour les éléments focusables
const searchInputRef = ref<HTMLInputElement>();
const clearSearchButtonRef = ref<HTMLButtonElement>();
const settingsButtonRef = ref<HTMLButtonElement>();

// Navigation navbar
const {
  isActive: isNavbarActive,
  currentFocusIndex,
  addElement,
  removeElement,
  isElementFocused,
  updateFocus,
} = useNavbarNavigation(navbarId);

// Computed properties pour les indices des éléments
const elementIndices = computed(() => {
  const searchIndex = 0;
  const clearSearchIndex = searchQuery.value ? 1 : -1;
  const settingsIndex = searchQuery.value ? 2 : 1;

  return { searchIndex, clearSearchIndex, settingsIndex };
});

// États des éléments focusés (computed properties)
const isSearchFocused = computed(
  () =>
    isNavbarActive.value && isElementFocused(elementIndices.value.searchIndex)
);

const isClearSearchFocused = computed(
  () =>
    isNavbarActive.value &&
    elementIndices.value.clearSearchIndex >= 0 &&
    isElementFocused(elementIndices.value.clearSearchIndex)
);

const isSettingsFocused = computed(
  () =>
    isNavbarActive.value && isElementFocused(elementIndices.value.settingsIndex)
);

// Configuration des éléments navigables
onMounted(() => {
  // Ajouter la barre de recherche
  addElement('search', searchInputRef.value || null, () => {
    searchInputRef.value?.focus();
  });

  // Ajouter le bouton paramètres
  addElement('settings', settingsButtonRef.value || null, () => {
    settingsButtonRef.value?.focus();
  });
});

// Gérer l'ajout/suppression dynamique du bouton de croix
watch(
  [searchQuery, clearSearchButtonRef],
  ([newQuery, newRef]) => {
    if (newQuery && newRef) {
      // Ajouter le bouton de croix s'il y a du texte et une référence
      addElement('clear-search', newRef, () => {
        clearSearchButtonRef.value?.focus();
      });
    } else {
      // Supprimer le bouton de croix s'il n'y a pas de texte
      removeElement('clear-search');
    }
  },
  { immediate: true }
);

// Surveiller les changements de props
watch(
  () => props.modelValue,
  (newValue) => {
    searchQuery.value = newValue;
  }
);

const onSearchInput = () => {
  emit('update:modelValue', searchQuery.value);
  emit('search', searchQuery.value);
};

const clearSearch = async () => {
  searchQuery.value = '';
  onSearchInput();

  // Attendre que Vue mette à jour le DOM et les watchers
  if (isNavbarActive.value) {
    await nextTick();
    currentFocusIndex.value = 0;
    updateFocus();
  }
};

const onSettingsClick = () => {
  emit('settings');
};
</script>
