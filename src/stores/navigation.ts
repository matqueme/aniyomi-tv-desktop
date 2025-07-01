import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';

export interface NavigableElement {
  id: string;
  title: string;
  type: 'navbar' | 'list';
  activate: (startIndex?: number) => void;
  deactivate: () => void;
  getFocusedIndex: () => number;
  navigateLeft: () => void;
  navigateRight: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
  handleSelect: () => void;
  scrollToSection?: () => void;
}

export interface NavigableList extends NavigableElement {
  type: 'list';
  itemCount: number;
  itemsPerRow: number;
  focusOnFirstRow: () => void;
  focusOnLastRow: () => void;
}

export interface NavigableNavbar extends NavigableElement {
  type: 'navbar';
  focusOnFirstElement: () => void;
}

export const useNavigationStore = defineStore('navigation', () => {
  // État
  const elements = ref<NavigableElement[]>([]);
  const activeElementIndex = ref(0);
  const isNavigationActive = ref(false);

  // Getters
  const activeElement = computed(
    () => elements.value[activeElementIndex.value]
  );
  const hasMultipleElements = computed(() => elements.value.length > 1);
  const totalElements = computed(() => elements.value.length);
  const navbar = computed(() =>
    elements.value.find((el) => el.type === 'navbar')
  );
  const lists = computed(
    () => elements.value.filter((el) => el.type === 'list') as NavigableList[]
  );

  // Actions - Gestion des éléments
  const registerElement = (element: NavigableElement) => {
    const existingIndex = elements.value.findIndex(
      (el) => el.id === element.id
    );
    if (existingIndex >= 0) {
      elements.value[existingIndex] = element;
    } else {
      // Navbar toujours en premier, puis les listes
      if (element.type === 'navbar') {
        elements.value.unshift(element);
      } else {
        elements.value.push(element);
      }
    }
  };

  const unregisterElement = (elementId: string) => {
    const index = elements.value.findIndex((el) => el.id === elementId);
    if (index >= 0) {
      elements.value.splice(index, 1);

      // Ajuster l'index actif si nécessaire
      if (activeElementIndex.value >= elements.value.length) {
        activeElementIndex.value = Math.max(0, elements.value.length - 1);
      }
    }
  };

  const clearElements = () => {
    elements.value = [];
    activeElementIndex.value = 0;
    isNavigationActive.value = false;
  };

  // Méthodes de compatibilité pour les listes
  const registerList = (list: NavigableList) => registerElement(list);
  const unregisterList = (listId: string) => unregisterElement(listId);
  const clearLists = () => clearElements();

  // Actions - Navigation principale
  const initializeNavigation = async (startIndex?: number) => {
    await nextTick();

    if (elements.value.length === 0) {
      console.warn('Aucun élément disponible pour la navigation');
      return;
    }

    // Désactiver tous les éléments
    elements.value.forEach((element) => element.deactivate());

    // Déterminer l'index de départ
    let targetIndex: number;

    if (startIndex !== undefined) {
      // Utiliser l'index fourni
      targetIndex = Math.max(
        0,
        Math.min(startIndex, elements.value.length - 1)
      );
    } else {
      // Logique par défaut : activer le deuxième élément s'il existe, sinon le premier
      targetIndex = elements.value.length > 1 ? 1 : 0;
    }

    activeElementIndex.value = targetIndex;
    if (activeElement.value) {
      activeElement.value.activate();
      activeElement.value.scrollToSection?.();
      isNavigationActive.value = true;
    }
  };

  const navigateUp = () => {
    if (!isNavigationActive.value || !hasMultipleElements.value) return;

    const currentElement = activeElement.value;
    if (!currentElement) return;

    // Calculer le nouvel index (sans effet carrousel)
    if (activeElementIndex.value <= 0) {
      // Si on est déjà au premier élément, ne rien faire
      return;
    }

    const newIndex = activeElementIndex.value - 1;
    const newElement = elements.value[newIndex];
    if (!newElement) return;

    // Désactiver l'élément actuel
    currentElement.deactivate();

    // Activer le nouvel élément
    activeElementIndex.value = newIndex;
    newElement.activate();
    setTimeout(() => {
      // Pour les listes, se positionner sur la dernière ligne
      if (newElement.type === 'list') {
        const listElement = newElement as NavigableList;
        if (listElement.focusOnLastRow) {
          listElement.focusOnLastRow();
        }
      } else if (newElement.type === 'navbar') {
        const navbarElement = newElement as NavigableNavbar;
        if (navbarElement.focusOnFirstElement) {
          navbarElement.focusOnFirstElement();
        }
      }
      newElement.scrollToSection?.();
    }, 50);
  };

  const navigateDown = () => {
    if (!isNavigationActive.value || !hasMultipleElements.value) return;

    const currentElement = activeElement.value;
    if (!currentElement) return;

    // Calculer le nouvel index (sans effet carrousel)
    if (activeElementIndex.value >= elements.value.length - 1) {
      // Si on est déjà au dernier élément, ne rien faire
      return;
    }

    const newIndex = activeElementIndex.value + 1;
    const newElement = elements.value[newIndex];
    if (!newElement) return;

    // Désactiver l'élément actuel
    currentElement.deactivate();

    // Activer le nouvel élément
    activeElementIndex.value = newIndex;
    newElement.activate();
    setTimeout(() => {
      // Pour les listes, se positionner sur la première ligne
      if (newElement.type === 'list') {
        const listElement = newElement as NavigableList;
        if (listElement.focusOnFirstRow) {
          listElement.focusOnFirstRow();
        }
      } else if (newElement.type === 'navbar') {
        const navbarElement = newElement as NavigableNavbar;
        if (navbarElement.focusOnFirstElement) {
          navbarElement.focusOnFirstElement();
        }
      }
      newElement.scrollToSection?.();
    }, 50);
  };
  // Actions - Navigation horizontale (délégation aux éléments)
  const navigateLeft = () => {
    if (!isNavigationActive.value || !activeElement.value) return;

    // Appeler directement la méthode de navigation de l'élément actif
    const currentElement = activeElement.value;
    if (currentElement.navigateLeft) {
      currentElement.navigateLeft();
    }
  };

  const navigateRight = () => {
    if (!isNavigationActive.value || !activeElement.value) return;

    // Appeler directement la méthode de navigation de l'élément actif
    const currentElement = activeElement.value;
    if (currentElement.navigateRight) {
      currentElement.navigateRight();
    }
  };
  // Actions - Sélection
  const handleSelect = () => {
    if (!isNavigationActive.value || !activeElement.value) return;

    // Appeler directement la méthode de sélection de l'élément actif
    const currentElement = activeElement.value;
    currentElement.handleSelect();
  };

  // Actions - État
  const activateNavigation = () => {
    isNavigationActive.value = true;
  };

  const deactivateNavigation = () => {
    isNavigationActive.value = false;
    elements.value.forEach((element) => element.deactivate());
  };

  // Actions - Débogage et diagnostics
  const getNavigationState = () => {
    return {
      isActive: isNavigationActive.value,
      totalElements: elements.value.length,
      activeElementIndex: activeElementIndex.value,
      activeElementTitle: activeElement.value?.title || 'Aucun',
      elements: elements.value.map((element, index) => ({
        id: element.id,
        title: element.title,
        type: element.type,
        focusedIndex: element.getFocusedIndex(),
        isActive: index === activeElementIndex.value,
      })),
    };
  };

  return {
    // État (readonly pour l'extérieur)
    elements: computed(() => elements.value),
    activeElementIndex: computed(() => activeElementIndex.value),
    activeElement,
    isNavigationActive: computed(() => isNavigationActive.value),
    hasMultipleElements,
    totalElements,
    navbar,
    lists,

    // Compatibilité avec l'ancien API
    activeList: computed(() => {
      const element = activeElement.value;
      return element?.type === 'list' ? (element as NavigableList) : undefined;
    }),
    hasMultipleLists: computed(() => lists.value.length > 1),
    totalLists: computed(() => lists.value.length),
    activeListIndex: computed(() => {
      const element = activeElement.value;
      if (element?.type === 'list') {
        return lists.value.findIndex((list) => list.id === element.id);
      }
      return -1;
    }),

    // Actions - Gestion des éléments
    registerElement,
    unregisterElement,
    clearElements,

    // Actions - Gestion des listes (compatibilité)
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
  };
});
