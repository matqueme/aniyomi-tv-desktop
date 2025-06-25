<template>
  <nav
    class="navbar"
    :class="{ 'navbar-active': isNavbarActive }"
    :data-navbar-id="navbarId"
  >
    <div class="navbar-content">
      <!-- Logo à gauche -->
      <div class="navbar-logo">
        <img src="/icon.png" alt="Aniyomi" class="logo-image" />
        <span class="logo-text">Aniyomi</span>
      </div>

      <!-- Barre de recherche au centre -->
      <div class="search-container">
        <div class="search-wrapper" :class="{ 'tv-focused': isSearchFocused }">
          <ph-magnifying-glass class="search-icon" :size="20" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des animes..."
            class="search-input"
            @input="onSearchInput"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
          <button v-if="searchQuery" class="clear-button" @click="clearSearch">
            <ph-x :size="16" />
          </button>
        </div>
      </div>

      <!-- Icône paramètres à droite -->
      <div class="navbar-actions">
        <button
          ref="settingsButtonRef"
          class="settings-button"
          :class="{
            focused: isSettingsFocused,
            'tv-focused': isSettingsFocused,
          }"
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

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-active {
  background: rgba(15, 23, 42, 0.98);
  border-bottom-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo-image {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.025em;
}

/* Search */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  padding: 0 1rem;
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: rgba(30, 41, 59, 0.8);
}

.search-wrapper.tv-focused {
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  background: rgba(30, 41, 59, 0.9);
  transform: scale(1.02);
}

.search-icon {
  color: #94a3b8;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 0.875rem;
  padding: 0.75rem 0;
}

.search-input::placeholder {
  color: #64748b;
}

.clear-button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
}

.clear-button:hover {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.1);
}

/* Settings */
.navbar-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.settings-button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-button:hover {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.1);
}

.settings-button.focused {
  background: rgba(99, 102, 241, 0.2);
  transform: scale(0.95);
}

.settings-button.tv-focused {
  background: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  transform: scale(1.05);
  border: 2px solid #6366f1;
}

/* Navigation TV et Focus */
.search-input:focus {
  outline: none;
}

.settings-button:focus {
  outline: none;
}

/* Indicateurs visuels pour la navigation TV */
.tv-focused {
  animation: focusPulse 2s infinite;
}

@keyframes focusPulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 1rem;
  }

  .search-container {
    margin: 0 1rem;
    max-width: none;
  }

  .logo-text {
    display: none;
  }

  .search-input {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .search-container {
    margin: 0 0.5rem;
  }

  .navbar-content {
    padding: 0 0.75rem;
  }
}
</style>
