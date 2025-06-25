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
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
          <button
            v-if="searchQuery"
            class="ml-2 rounded p-1 text-slate-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-slate-200"
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
          class="flex items-center justify-center rounded-lg border p-2 text-slate-400 transition-all duration-300 ease-in-out hover:text-slate-200 focus:outline-none"
          :class="[
            isSettingsFocused
              ? 'scale-[1.01] border-indigo-500 bg-indigo-500/20 text-indigo-200'
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
import { ref, watch, onMounted } from 'vue';
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
const settingsButtonRef = ref<HTMLButtonElement>();

// Navigation navbar
const {
  isActive: isNavbarActive,
  currentFocusIndex,
  addElement,
  isElementFocused,
} = useNavbarNavigation(navbarId);

// États des éléments
const isSearchFocused = ref(false);
const isSettingsFocused = ref(false);

// Mettre à jour les états en fonction du focus
watch([currentFocusIndex, isNavbarActive], () => {
  if (isNavbarActive.value) {
    isSearchFocused.value = isElementFocused(0);
    isSettingsFocused.value = isElementFocused(1);
  } else {
    isSearchFocused.value = false;
    isSettingsFocused.value = false;
  }
});

// Réagir aux changements d'état de la navbar
watch(isNavbarActive, (active) => {
  if (!active) {
    isSearchFocused.value = false;
    isSettingsFocused.value = false;
  }
});

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

const onSearchFocus = () => {
  // Le focus sera géré par le système de navigation
};

const onSearchBlur = () => {
  // Le blur sera géré par le système de navigation
};

const clearSearch = () => {
  searchQuery.value = '';
  onSearchInput();
};

const onSettingsClick = () => {
  isSettingsFocused.value = true;
  setTimeout(() => {
    isSettingsFocused.value = false;
  }, 200);
  emit('settings');
};
</script>
