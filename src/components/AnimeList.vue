<template>
  <div class="anime-list">
    <div class="mb-6">
      <h2 class="mr-4 mb-4 text-2xl font-bold text-white">{{ title }}</h2>
      <div
        ref="listContainer"
        class="flex gap-4 overflow-x-hidden scroll-smooth p-4"
        :style="{ transform: `translateX(${scrollOffset}px)` }"
      >
        <AnimeCard
          v-for="(anime, index) in animes"
          :key="anime.id"
          :anime="anime"
          :is-focused="index === focusedIndex && isActive"
          @select="handleAnimeSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, readonly } from 'vue';
import type { Anime } from '../types/anime';
import AnimeCard from './AnimeCard.vue';

interface Props {
  animes: Anime[];
  title: string;
  itemsPerRow?: number;
}

interface Emits {
  (e: 'select', anime: Anime): void;
  (e: 'focus-change', index: number): void;
  (e: 'navigate-up'): void;
  (e: 'navigate-down'): void;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerRow: 6,
});

const emit = defineEmits<Emits>();

// État de navigation
const focusedIndex = ref(0);
const scrollOffset = ref(0);
const listContainer = ref<HTMLElement>();
const isActive = ref(false);

// Calculs réactifs
const currentCol = computed(() => focusedIndex.value % props.itemsPerRow);
const currentRow = computed(() =>
  Math.floor(focusedIndex.value / props.itemsPerRow)
);
const totalRows = computed(() =>
  Math.ceil(props.animes.length / props.itemsPerRow)
);

// Gestion de la navigation
const handleLeft = () => {
  if (!isActive.value) return;

  if (focusedIndex.value > 0) {
    focusedIndex.value--;
    emit('focus-change', focusedIndex.value);
    scrollToFocused();
  }
};

const handleRight = () => {
  if (!isActive.value) return;

  if (focusedIndex.value < props.animes.length - 1) {
    focusedIndex.value++;
    emit('focus-change', focusedIndex.value);
    scrollToFocused();
  }
};

const handleUp = () => {
  if (!isActive.value) return;

  console.log(
    `handleUp - currentRow: ${currentRow.value}, focusedIndex: ${focusedIndex.value}`
  );

  // Si on est sur la première ligne, naviguer vers la liste précédente
  if (currentRow.value === 0) {
    console.log('Navigation vers la liste précédente');
    emit('navigate-up');
    return;
  }

  const newIndex = focusedIndex.value - props.itemsPerRow;
  if (newIndex >= 0) {
    focusedIndex.value = newIndex;
    emit('focus-change', focusedIndex.value);
    scrollToFocused();
  }
};

const handleDown = () => {
  if (!isActive.value) return;

  const newIndex = focusedIndex.value + props.itemsPerRow;

  console.log(
    `handleDown - newIndex: ${newIndex}, animes.length: ${props.animes.length}`
  );

  // Si on dépasse la fin de la liste, naviguer vers la liste suivante
  if (newIndex >= props.animes.length) {
    console.log('Navigation vers la liste suivante');
    emit('navigate-down');
    return;
  }

  focusedIndex.value = newIndex;
  emit('focus-change', focusedIndex.value);
  scrollToFocused();
};

const handleEnter = () => {
  if (!isActive.value || !props.animes[focusedIndex.value]) return;

  handleAnimeSelect(props.animes[focusedIndex.value]);
};

const handleBack = () => {
  // Logique de retour - peut être gérée par le composant parent
  console.log('Back pressed');
};

// Gestion des boutons colorés (optionnel)
const handleRed = () => {
  console.log('Red button pressed');
};

const handleGreen = () => {
  console.log('Green button pressed');
};

const handleYellow = () => {
  console.log('Yellow button pressed');
};

const handleBlue = () => {
  console.log('Blue button pressed');
};

// Gestion du défilement horizontal
const scrollToFocused = async () => {
  await nextTick();

  if (!listContainer.value) return;

  const cardWidth = 320 + 16; // largeur réelle de la carte + gap
  const containerWidth = listContainer.value.parentElement?.clientWidth || 0;
  const focusedX = currentCol.value * cardWidth;

  // Calcul du défilement nécessaire
  const maxVisibleCards = Math.floor(containerWidth / cardWidth);
  const scrollThreshold = maxVisibleCards - 1;

  if (currentCol.value >= scrollThreshold) {
    scrollOffset.value = -(focusedX - (scrollThreshold - 1) * cardWidth);
  } else if (currentCol.value === 0) {
    scrollOffset.value = 0;
  }
};

// Gestion de la sélection d'anime
const handleAnimeSelect = (anime: Anime) => {
  emit('select', anime);
};

// Gestion des événements clavier
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.keyCode) {
    case 37: // Left arrow
      event.preventDefault();
      handleLeft();
      break;
    case 38: // Up arrow
      event.preventDefault();
      handleUp();
      break;
    case 39: // Right arrow
      event.preventDefault();
      handleRight();
      break;
    case 40: // Down arrow
      event.preventDefault();
      handleDown();
      break;
    case 13: // Enter/OK
      event.preventDefault();
      handleEnter();
      break;
    case 10009: // Return/Back
      event.preventDefault();
      handleBack();
      break;
    case 427: // Red button
      event.preventDefault();
      handleRed();
      break;
    case 428: // Green button
      event.preventDefault();
      handleGreen();
      break;
    case 429: // Yellow button
      event.preventDefault();
      handleYellow();
      break;
    case 430: // Blue button
      event.preventDefault();
      handleBlue();
      break;
  }
};

// Activation/désactivation du composant
const activate = (startIndex: number = 0) => {
  console.log(
    `Activation de la liste "${props.title}" avec startIndex: ${startIndex}`
  );
  isActive.value = true;
  focusedIndex.value = startIndex;
  scrollToFocused();
  // Ajouter l'écouteur d'événements uniquement quand actif
  document.addEventListener('keydown', handleKeyDown);
};

const deactivate = () => {
  console.log(`Désactivation de la liste "${props.title}"`);
  isActive.value = false;
  // Retirer l'écouteur d'événements quand inactif
  document.removeEventListener('keydown', handleKeyDown);
};

// Méthodes pour positionner le focus
const focusOnLastRow = () => {
  // Se positionner sur la dernière ligne, même colonne si possible
  const lastRowStart = (totalRows.value - 1) * props.itemsPerRow;
  const targetIndex = Math.min(
    lastRowStart + currentCol.value,
    props.animes.length - 1
  );
  focusedIndex.value = targetIndex;
  scrollToFocused();
};

const focusOnFirstRow = () => {
  // Se positionner sur la première ligne, même colonne si possible
  focusedIndex.value = Math.min(currentCol.value, props.animes.length - 1);
  scrollToFocused();
};

// Méthodes exposées
defineExpose({
  activate,
  deactivate,
  focusOnLastRow,
  focusOnFirstRow,
  focusedIndex: readonly(focusedIndex),
  isActive: readonly(isActive),
});

// Lifecycle
onMounted(() => {
  // Ne pas écouter les événements par défaut - sera activé par le parent
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.anime-list {
  overflow: hidden;
}

.grid {
  transition: transform 0.3s ease-in-out;
}

/* Masquer la barre de scroll horizontale par défaut */
.flex.gap-4.overflow-x-auto {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer et Edge */
}

.flex.gap-4.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari et Opera */
}

/* Assurer que le conteneur ne dépasse pas */
.anime-list {
  max-width: 100vw;
  box-sizing: border-box;
}
</style>
