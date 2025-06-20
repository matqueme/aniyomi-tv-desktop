<template>
  <div class="mb-2 box-border max-w-screen">
    <h2 class="mb-4 ml-4 text-2xl font-bold text-white">{{ title }}</h2>
    <div
      ref="listContainer"
      class="flex gap-6 overflow-x-visible scroll-smooth p-4 transition-transform duration-300 ease-out"
      :style="{ transform: `translateX(${scrollOffset}px)` }"
    >
      <AnimeCard
        v-for="(anime, index) in animes"
        :key="anime.id"
        :anime="anime"
        :is-focused="index === focusedIndex && isActive"
        @select="(anime) => emit('select', anime)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, readonly } from 'vue';
import type { Anime } from '../../types/anime';
import AnimeCard from './AnimeCard.vue';
import {
  useNavigationStore,
  type NavigableList,
} from '../../stores/navigation';

interface Props {
  animes: Anime[];
  title: string;
  itemsPerRow?: number;
  listId?: string;
}

interface Emits {
  (e: 'select', anime: Anime): void;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerRow: 6,
  listId: () => `list-${Math.random().toString(36).substr(2, 9)}`, // ID auto-généré
});

const emit = defineEmits<Emits>();

// Store de navigation
const navigationStore = useNavigationStore();

// État de navigation
const focusedIndex = ref(0);
const scrollOffset = ref(0);
const listContainer = ref<HTMLElement>();
const isActive = ref(false);

// Calculs réactifs (uniquement ceux utilisés)
const currentCol = computed(() => focusedIndex.value % props.itemsPerRow);
const totalRows = computed(() =>
  Math.ceil(props.animes.length / props.itemsPerRow)
);

// Calculer le nombre d'éléments visibles selon la largeur de l'écran
const visibleItemsCount = computed(() => {
  if (!listContainer.value?.parentElement) return props.itemsPerRow;

  const containerWidth = listContainer.value.parentElement.clientWidth;
  const cardWidth = getCardWidth();
  const visibleCount = Math.floor(containerWidth / cardWidth);

  return Math.max(1, Math.min(visibleCount, props.itemsPerRow));
});

// Fonction pour calculer la largeur réelle d'une carte selon la taille d'écran
const getCardWidth = () => {
  const screenHeight = window.innerHeight;
  const gap = 24; // gap entre les cartes

  if (screenHeight <= 400) {
    return 200 + gap;
  } else if (screenHeight <= 500) {
    return 240 + gap;
  } else if (screenHeight <= 720) {
    return 280 + gap;
  } else {
    return 320 + gap;
  }
};

// Gestion du défilement horizontal
const scrollToFocused = async () => {
  await nextTick();

  if (!listContainer.value) return;

  const cardWidth = getCardWidth();
  const containerWidth = listContainer.value.parentElement?.clientWidth || 0;
  const visibleCount = visibleItemsCount.value;

  // Si tous les éléments sont visibles, pas besoin de défilement
  if (props.animes.length <= visibleCount) {
    scrollOffset.value = 0;
    return;
  }

  // Centrer l'élément focalisé dans le conteneur
  const containerCenter = containerWidth / 2;
  const cardCenter = cardWidth / 2;
  const focusedCardPosition = focusedIndex.value * cardWidth + cardCenter;
  const targetOffset = containerCenter - focusedCardPosition;

  // Limiter le défilement
  const maxOffset = 0;
  const rightMargin = cardWidth;
  const minOffset = -(
    props.animes.length * cardWidth -
    containerWidth +
    rightMargin
  );

  scrollOffset.value = Math.max(minOffset, Math.min(maxOffset, targetOffset));
};

// Gestion du redimensionnement
const handleResize = () => {
  if (isActive.value) {
    scrollToFocused();
  }
};

// Implémentation de l'interface NavigableList pour le store
const createNavigableListInterface = (): NavigableList => ({
  id: props.listId,
  title: props.title,
  itemCount: props.animes.length,
  itemsPerRow: props.itemsPerRow,
  activate: (startIndex = 0) => {
    isActive.value = true;
    focusedIndex.value = startIndex;
    scrollToFocused();

    // Pas d'écouteurs d'événements ici - le store s'en charge
    window.addEventListener('resize', handleResize);
  },
  deactivate: () => {
    isActive.value = false;

    // Arrêter d'écouter les événements
    window.removeEventListener('resize', handleResize);
  },
  focusOnFirstRow: () => {
    focusedIndex.value = Math.min(currentCol.value, props.animes.length - 1);
    scrollToFocused();
  },
  focusOnLastRow: () => {
    const lastRowStart = (totalRows.value - 1) * props.itemsPerRow;
    const targetIndex = Math.min(
      lastRowStart + currentCol.value,
      props.animes.length - 1
    );
    focusedIndex.value = targetIndex;
    scrollToFocused();
  },
  getFocusedIndex: () => focusedIndex.value,
  navigateLeft: () => {
    if (!isActive.value) return;

    if (focusedIndex.value > 0) {
      focusedIndex.value--;
    } else {
      // Effet carrousel - aller à la fin
      focusedIndex.value = props.animes.length - 1;
    }
    scrollToFocused();
  },
  navigateRight: () => {
    if (!isActive.value) return;

    if (focusedIndex.value < props.animes.length - 1) {
      focusedIndex.value++;
    } else {
      // Effet carrousel - revenir au début
      focusedIndex.value = 0;
    }
    scrollToFocused();
  },
  navigateUp: () => {
    if (!isActive.value) return;

    // Calculer la ligne actuelle
    const currentRow = Math.floor(focusedIndex.value / props.itemsPerRow);

    // Si on est sur la première ligne, laisser le store gérer la navigation verticale
    if (currentRow === 0) {
      navigationStore.navigateUp();
      return;
    }

    // Sinon, naviguer dans la liste actuelle
    const newIndex = focusedIndex.value - props.itemsPerRow;
    if (newIndex >= 0) {
      focusedIndex.value = newIndex;
    } else {
      // Aller à la dernière ligne, même colonne
      const lastRowStart = (totalRows.value - 1) * props.itemsPerRow;
      focusedIndex.value = Math.min(
        lastRowStart + currentCol.value,
        props.animes.length - 1
      );
    }
    scrollToFocused();
  },
  navigateDown: () => {
    if (!isActive.value) return;

    // Calculer la ligne actuelle
    const currentRow = Math.floor(focusedIndex.value / props.itemsPerRow);
    const newIndex = focusedIndex.value + props.itemsPerRow;

    // Si on dépasse la fin ou qu'on est sur la dernière ligne
    if (newIndex >= props.animes.length || currentRow === totalRows.value - 1) {
      navigationStore.navigateDown();
      return;
    }

    focusedIndex.value = newIndex;
    scrollToFocused();
  },
  handleSelect: () => {
    if (!isActive.value || !props.animes[focusedIndex.value]) return;
    emit('select', props.animes[focusedIndex.value]);
  },
  scrollToSection: () => {
    // Cette fonction sera définie par le composant parent si nécessaire
  },
});

// Méthodes publiques (pour compatibilité avec l'ancienne API)
const activate = (startIndex: number = 0) => {
  const navInterface = createNavigableListInterface();
  navInterface.activate(startIndex);
};

const deactivate = () => {
  const navInterface = createNavigableListInterface();
  navInterface.deactivate();
};

const focusOnLastRow = () => {
  const navInterface = createNavigableListInterface();
  navInterface.focusOnLastRow();
};

const focusOnFirstRow = () => {
  const navInterface = createNavigableListInterface();
  navInterface.focusOnFirstRow();
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
  // Enregistrer cette liste dans le store de navigation
  const navInterface = createNavigableListInterface();
  navigationStore.registerList(navInterface);
});

onUnmounted(() => {
  // Nettoyer les événements et désenregistrer du store
  window.removeEventListener('resize', handleResize);
  navigationStore.unregisterList(props.listId);
});
</script>

<style scoped>
.grid {
  transition: transform 0.3s ease-in-out;
}
</style>
