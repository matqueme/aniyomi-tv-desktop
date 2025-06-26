import { ref, nextTick } from 'vue';
import { useNavigationStore, type NavigableElement } from '@/stores/navigation';

interface SearchElement {
  id: string;
  ref: HTMLElement | null;
  focus: () => void;
  onClick?: () => void;
}

export function useSearchNavigation() {
  const navigationStore = useNavigationStore();

  const isActive = ref(false);
  const currentFocusIndex = ref(1); // Commencer sur la barre de recherche
  const elements = ref<SearchElement[]>([]);
  const isInSearchResults = ref(false);

  // Ajouter des éléments navigables
  const addElement = (
    id: string,
    elementRef: HTMLElement | null,
    focusFunction: () => void,
    clickFunction?: () => void
  ) => {
    const existingIndex = elements.value.findIndex((el) => el.id === id);
    if (existingIndex >= 0) {
      elements.value[existingIndex] = {
        id,
        ref: elementRef,
        focus: focusFunction,
        onClick: clickFunction,
      };
    } else {
      elements.value.push({
        id,
        ref: elementRef,
        focus: focusFunction,
        onClick: clickFunction,
      });
    }

    // Maintenir l'ordre : back-button, search-input, clear-button
    elements.value.sort((a, b) => {
      const order = ['back-button', 'search-input', 'clear-button'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
  };

  // Supprimer un élément
  const removeElement = (id: string) => {
    const index = elements.value.findIndex((el) => el.id === id);
    if (index >= 0) {
      elements.value.splice(index, 1);
      // Ajuster l'index de focus si nécessaire
      if (currentFocusIndex.value >= elements.value.length) {
        currentFocusIndex.value = Math.max(0, elements.value.length - 1);
      }
    }
  };

  // Mettre à jour le focus
  const updateFocus = () => {
    if (!isActive.value || elements.value.length === 0) return;

    const currentElement = elements.value[currentFocusIndex.value];
    if (currentElement) {
      currentElement.focus();
    }
  };

  // Gérer la sélection
  const handleSelect = () => {
    if (!isActive.value || elements.value.length === 0) return;

    const currentElement = elements.value[currentFocusIndex.value];
    if (currentElement?.onClick) {
      currentElement.onClick();
    } else if (currentElement?.ref) {
      currentElement.ref.click();
    }
  };

  // Créer l'élément navigable pour la navigation (bouton retour)
  const createNavigationElement = (): NavigableElement => ({
    id: 'search-navigation',
    title: 'Navigation page',
    type: 'list',
    activate: () => {
      isActive.value = true;
      isInSearchResults.value = false;
      currentFocusIndex.value = 0; // Focus sur le bouton retour
      updateFocus();
    },
    deactivate: () => {
      isActive.value = false;
      elements.value.forEach((el) => el.ref?.blur());
    },
    getFocusedIndex: () => 0,
    navigateLeft: () => {},
    navigateRight: () => {},
    navigateUp: () => {},
    navigateDown: () => {},
    handleSelect,
    scrollToSection: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  // Créer l'élément navigable pour la recherche
  const createSearchElement = (
    onNavigateDown?: () => void
  ): NavigableElement => ({
    id: 'search-input',
    title: 'Barre de recherche',
    type: 'list',
    activate: (startIndex = 0) => {
      isActive.value = true;
      isInSearchResults.value = false;
      // Ajuster l'index selon les éléments disponibles
      currentFocusIndex.value = Math.min(
        startIndex + 1,
        elements.value.length - 1
      );
      updateFocus();
    },
    deactivate: () => {
      isActive.value = false;
      elements.value.forEach((el) => el.ref?.blur());
    },
    getFocusedIndex: () => {
      // Retourner l'index relatif à cette section
      return Math.max(0, currentFocusIndex.value - 1);
    },
    navigateLeft: () => {
      if (currentFocusIndex.value > 1) {
        currentFocusIndex.value--;
        updateFocus();
      }
    },
    navigateRight: () => {
      if (currentFocusIndex.value < elements.value.length - 1) {
        currentFocusIndex.value++;
        updateFocus();
      }
    },
    navigateUp: () => {},
    navigateDown: () => {
      if (onNavigateDown) {
        isInSearchResults.value = true;
        onNavigateDown();
      }
    },
    handleSelect,
    scrollToSection: () => {
      const searchSection = document.querySelector('.max-w-2xl');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  });

  // Initialiser la navigation
  const initializeNavigation = async (onNavigateDown?: () => void) => {
    await nextTick();

    const navigationElement = createNavigationElement();
    const searchElement = createSearchElement(onNavigateDown);

    // Enregistrer les éléments dans le store
    navigationStore.registerElement(navigationElement);
    navigationStore.registerElement(searchElement);

    // Activer la navigation globale
    if (!navigationStore.isNavigationActive) {
      navigationStore.activateNavigation();
    }
  };

  // Fonction pour focuser la barre de recherche après ajout des éléments
  const focusSearchInput = async () => {
    await nextTick();

    // Trouver l'index de la barre de recherche
    const searchInputIndex = elements.value.findIndex(
      (el) => el.id === 'search-input'
    );

    if (searchInputIndex >= 0) {
      isActive.value = true;
      isInSearchResults.value = false;
      currentFocusIndex.value = searchInputIndex;
      updateFocus();
    }
  };

  // Nettoyage
  const cleanup = () => {
    navigationStore.unregisterElement('search-navigation');
    navigationStore.unregisterElement('search-input');
  };

  // États calculés pour les éléments focusés
  const isElementFocused = (elementId: string) => {
    if (!isActive.value) return false;

    const elementIndex = elements.value.findIndex((el) => el.id === elementId);
    return elementIndex >= 0 && currentFocusIndex.value === elementIndex;
  };

  return {
    // État
    isActive,
    currentFocusIndex,
    elements,
    isInSearchResults,

    // Méthodes
    addElement,
    removeElement,
    updateFocus,
    handleSelect,
    initializeNavigation,
    cleanup,
    focusSearchInput,

    // Helpers
    isElementFocused,

    // États pour les composants (compatibilité avec l'ancien code)
    isBackButtonFocused: () => isElementFocused('back-button'),
    isSearchFocused: () => isElementFocused('search-input'),
    isClearButtonFocused: () => isElementFocused('clear-button'),
  };
}
