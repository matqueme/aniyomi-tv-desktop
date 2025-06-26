import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useNavigationStore, type NavigableList } from '@/stores/navigation';
import type { Anime } from '@/types/anime';

interface AnimeListNavigationOptions {
  animes: Anime[];
  title: string;
  itemsPerRow?: number;
  listId?: string;
  onSelect?: (anime: Anime) => void;
}

export function useAnimeListNavigation(options: AnimeListNavigationOptions) {
  const navigationStore = useNavigationStore();

  // Valeurs par défaut
  const itemsPerRow = options.itemsPerRow ?? 6;
  const listId =
    options.listId ?? `list-${Math.random().toString(36).substr(2, 9)}`;

  // État de navigation
  const focusedIndex = ref(0);
  const scrollOffset = ref(0);
  const listContainer = ref<HTMLElement>();
  const isActive = ref(false);

  // Calculs réactifs
  const currentCol = computed(() => focusedIndex.value % itemsPerRow);
  const totalRows = computed(() =>
    Math.ceil(options.animes.length / itemsPerRow)
  );

  // Calculer le nombre d'éléments visibles selon la largeur de l'écran
  const visibleItemsCount = computed(() => {
    if (!listContainer.value?.parentElement) return itemsPerRow;

    const containerWidth = listContainer.value.parentElement.clientWidth;
    const cardWidth = getCardWidth();
    const visibleCount = Math.floor(containerWidth / cardWidth);

    return Math.max(1, Math.min(visibleCount, itemsPerRow));
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
    if (options.animes.length <= visibleCount) {
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
      options.animes.length * cardWidth -
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
    id: listId,
    title: options.title,
    itemCount: options.animes.length,
    itemsPerRow: itemsPerRow,
    type: 'list',

    activate: (startIndex = 0) => {
      isActive.value = true;
      focusedIndex.value = startIndex;
      scrollToFocused();
      window.addEventListener('resize', handleResize);
    },

    deactivate: () => {
      isActive.value = false;
      window.removeEventListener('resize', handleResize);
    },

    focusOnFirstRow: () => {
      focusedIndex.value = Math.min(
        currentCol.value,
        options.animes.length - 1
      );
      scrollToFocused();
    },

    focusOnLastRow: () => {
      const lastRowStart = (totalRows.value - 1) * itemsPerRow;
      const targetIndex = Math.min(
        lastRowStart + currentCol.value,
        options.animes.length - 1
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
        focusedIndex.value = options.animes.length - 1;
      }
      scrollToFocused();
    },

    navigateRight: () => {
      if (!isActive.value) return;

      if (focusedIndex.value < options.animes.length - 1) {
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
      const currentRow = Math.floor(focusedIndex.value / itemsPerRow);

      // Si on est sur la première ligne, laisser le store gérer la navigation verticale
      if (currentRow === 0) {
        navigationStore.navigateUp();
        return;
      }

      // Sinon, naviguer dans la liste actuelle
      const newIndex = focusedIndex.value - itemsPerRow;
      if (newIndex >= 0) {
        focusedIndex.value = newIndex;
      } else {
        // Aller à la dernière ligne, même colonne
        const lastRowStart = (totalRows.value - 1) * itemsPerRow;
        focusedIndex.value = Math.min(
          lastRowStart + currentCol.value,
          options.animes.length - 1
        );
      }
      scrollToFocused();
    },

    navigateDown: () => {
      if (!isActive.value) return;

      // Calculer la ligne actuelle
      const currentRow = Math.floor(focusedIndex.value / itemsPerRow);
      const newIndex = focusedIndex.value + itemsPerRow;

      // Si on dépasse la fin ou qu'on est sur la dernière ligne
      if (
        newIndex >= options.animes.length ||
        currentRow === totalRows.value - 1
      ) {
        navigationStore.navigateDown();
        return;
      }

      focusedIndex.value = newIndex;
      scrollToFocused();
    },

    handleSelect: () => {
      if (!isActive.value || !options.animes[focusedIndex.value]) return;

      if (options.onSelect) {
        options.onSelect(options.animes[focusedIndex.value]);
      }
    },

    scrollToSection: () => {
      // Peut être personnalisé par le composant parent si nécessaire
      if (listContainer.value) {
        listContainer.value.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    },
  });

  // Interface de navigation
  const navInterface = createNavigableListInterface();

  // Méthodes publiques
  const activate = (startIndex: number = 0) => {
    navInterface.activate(startIndex);
  };

  const deactivate = () => {
    navInterface.deactivate();
  };

  const focusOnLastRow = () => {
    navInterface.focusOnLastRow();
  };

  const focusOnFirstRow = () => {
    navInterface.focusOnFirstRow();
  };

  // Lifecycle
  onMounted(() => {
    navigationStore.registerList(navInterface);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    navigationStore.unregisterList(listId);
  });

  return {
    // État
    focusedIndex,
    scrollOffset,
    listContainer,
    isActive,

    // Computed
    currentCol,
    totalRows,
    visibleItemsCount,

    // Méthodes
    activate,
    deactivate,
    focusOnLastRow,
    focusOnFirstRow,
    scrollToFocused,

    // Helpers
    getCardWidth,

    // Navigation interface (pour les cas avancés)
    navInterface,
  };
}
