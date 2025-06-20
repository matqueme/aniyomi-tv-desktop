import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';

export interface NavigableList {
  id: string;
  title: string;
  itemCount: number;
  itemsPerRow: number;
  activate: (startIndex?: number) => void;
  deactivate: () => void;
  focusOnFirstRow: () => void;
  focusOnLastRow: () => void;
  getFocusedIndex: () => number;
  navigateLeft: () => void;
  navigateRight: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
  handleSelect: () => void;
  scrollToSection?: () => void;
}

export const useNavigationStore = defineStore('navigation', () => {
  // État
  const lists = ref<NavigableList[]>([]);
  const activeListIndex = ref(0);
  const isNavigationActive = ref(false);

  // Getters
  const activeList = computed(() => lists.value[activeListIndex.value]);
  const hasMultipleLists = computed(() => lists.value.length > 1);
  const totalLists = computed(() => lists.value.length);

  // Actions - Gestion des listes
  const registerList = (list: NavigableList) => {
    const existingIndex = lists.value.findIndex((l) => l.id === list.id);
    if (existingIndex >= 0) {
      lists.value[existingIndex] = list;
    } else {
      lists.value.push(list);
    }
    console.log(`Liste "${list.title}" enregistrée (ID: ${list.id})`);
  };

  const unregisterList = (listId: string) => {
    const index = lists.value.findIndex((l) => l.id === listId);
    if (index >= 0) {
      lists.value.splice(index, 1);
      console.log(`Liste supprimée (ID: ${listId})`);

      // Ajuster l'index actif si nécessaire
      if (activeListIndex.value >= lists.value.length) {
        activeListIndex.value = Math.max(0, lists.value.length - 1);
      }
    }
  };

  const clearLists = () => {
    lists.value = [];
    activeListIndex.value = 0;
    isNavigationActive.value = false;
  };

  // Actions - Navigation principale
  const initializeNavigation = async () => {
    await nextTick();

    if (lists.value.length === 0) {
      console.warn('Aucune liste disponible pour la navigation');
      return;
    }

    console.log(
      `Initialisation navigation: ${lists.value.length} listes disponibles`
    );

    // Désactiver toutes les listes
    lists.value.forEach((list) => list.deactivate());

    // Activer la première liste
    activeListIndex.value = 0;
    if (activeList.value) {
      activeList.value.activate();
      activeList.value.scrollToSection?.();
      isNavigationActive.value = true;
      console.log(`Liste "${activeList.value.title}" activée`);
    }
  };

  const navigateUp = () => {
    if (!isNavigationActive.value || !hasMultipleLists.value) return;

    const currentList = activeList.value;
    if (!currentList) return;

    // Calculer le nouvel index (avec effet carrousel)
    const newIndex =
      activeListIndex.value > 0
        ? activeListIndex.value - 1
        : lists.value.length - 1;

    const newList = lists.value[newIndex];
    if (!newList) return;

    console.log(`Navigation UP: "${currentList.title}" → "${newList.title}"`);

    // Désactiver la liste actuelle
    currentList.deactivate();

    // Activer la nouvelle liste et se positionner sur la dernière ligne
    activeListIndex.value = newIndex;
    newList.activate();
    setTimeout(() => {
      newList.focusOnLastRow();
      newList.scrollToSection?.();
    }, 50);
  };

  const navigateDown = () => {
    if (!isNavigationActive.value || !hasMultipleLists.value) return;

    const currentList = activeList.value;
    if (!currentList) return;

    // Calculer le nouvel index (avec effet carrousel)
    const newIndex =
      activeListIndex.value < lists.value.length - 1
        ? activeListIndex.value + 1
        : 0;

    const newList = lists.value[newIndex];
    if (!newList) return;

    console.log(`Navigation DOWN: "${currentList.title}" → "${newList.title}"`);

    // Désactiver la liste actuelle
    currentList.deactivate();

    // Activer la nouvelle liste et se positionner sur la première ligne
    activeListIndex.value = newIndex;
    newList.activate();
    setTimeout(() => {
      newList.focusOnFirstRow();
      newList.scrollToSection?.();
    }, 50);
  };
  // Actions - Navigation horizontale (délégation aux listes)
  const navigateLeft = () => {
    if (!isNavigationActive.value || !activeList.value) return;

    // Appeler directement la méthode de navigation de la liste active
    const currentList = activeList.value;
    if (currentList.navigateLeft) {
      currentList.navigateLeft();
    }
  };

  const navigateRight = () => {
    if (!isNavigationActive.value || !activeList.value) return;

    // Appeler directement la méthode de navigation de la liste active
    const currentList = activeList.value;
    if (currentList.navigateRight) {
      currentList.navigateRight();
    }
  };
  // Actions - Sélection
  const handleSelect = () => {
    if (!isNavigationActive.value || !activeList.value) return;

    // Appeler directement la méthode de sélection de la liste active
    const currentList = activeList.value;
    currentList.handleSelect();
  };

  // Actions - État
  const activateNavigation = () => {
    isNavigationActive.value = true;
    console.log('Navigation activée');
  };

  const deactivateNavigation = () => {
    isNavigationActive.value = false;
    lists.value.forEach((list) => list.deactivate());
    console.log('Navigation désactivée');
  };

  // Actions - Débogage et diagnostics
  const getNavigationState = () => {
    return {
      isActive: isNavigationActive.value,
      totalLists: lists.value.length,
      activeListIndex: activeListIndex.value,
      activeListTitle: activeList.value?.title || 'Aucune',
      lists: lists.value.map((list) => ({
        id: list.id,
        title: list.title,
        itemCount: list.itemCount,
        focusedIndex: list.getFocusedIndex(),
      })),
    };
  };

  const logNavigationState = () => {
    console.log('État de la navigation:', getNavigationState());
  };

  return {
    // État (readonly pour l'extérieur)
    lists: computed(() => lists.value),
    activeListIndex: computed(() => activeListIndex.value),
    activeList,
    isNavigationActive: computed(() => isNavigationActive.value),
    hasMultipleLists,
    totalLists,

    // Actions - Gestion des listes
    registerList,
    unregisterList,
    clearLists,

    // Actions - Navigation
    initializeNavigation,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    handleSelect,

    // Actions - État
    activateNavigation,
    deactivateNavigation,

    // Actions - Diagnostics
    getNavigationState,
    logNavigationState,
  };
});
