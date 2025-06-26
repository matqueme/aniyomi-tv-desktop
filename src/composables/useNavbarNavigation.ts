import { ref, onMounted, onUnmounted } from 'vue';
import { useNavigationStore, type NavigableNavbar } from '@/stores/navigation';

interface NavbarElement {
  id: string;
  ref: HTMLElement | null;
  focus: () => void;
}

export function useNavbarNavigation(navbarId: string = 'main-navbar') {
  const navigationStore = useNavigationStore();

  const isActive = ref(false);
  const currentFocusIndex = ref(0);
  const elements = ref<NavbarElement[]>([]);

  // Ajouter des éléments navigables
  const addElement = (
    id: string,
    elementRef: HTMLElement | null,
    focusFunction: () => void
  ) => {
    // Éviter les doublons
    const existingIndex = elements.value.findIndex((el) => el.id === id);
    if (existingIndex >= 0) {
      elements.value[existingIndex] = {
        id,
        ref: elementRef,
        focus: focusFunction,
      };
    } else {
      elements.value.push({
        id,
        ref: elementRef,
        focus: focusFunction,
      });
    }

    // Trier les éléments pour maintenir un ordre cohérent
    elements.value.sort((a, b) => {
      const order = ['search', 'clear-search', 'settings'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
  };

  // Supprimer tous les éléments
  const clearElements = () => {
    elements.value = [];
    currentFocusIndex.value = 0;
    isActive.value = false;
  };

  // Mettre à jour le focus
  const updateFocus = () => {
    if (!isActive.value || elements.value.length === 0) return;

    const currentElement = elements.value[currentFocusIndex.value];
    if (currentElement) {
      currentElement.focus();
    }
  };

  // Implémentation de NavigableNavbar
  const navbarController: NavigableNavbar = {
    id: navbarId,
    title: 'Navigation Bar',
    type: 'navbar',

    activate: (startIndex = 0) => {
      isActive.value = true;
      currentFocusIndex.value = Math.min(startIndex, elements.value.length - 1);
      updateFocus();
    },

    deactivate: () => {
      isActive.value = false;
      // Enlever le focus des éléments HTML
      elements.value.forEach((el) => {
        if (el.ref) {
          el.ref.blur();
        }
      });
    },

    getFocusedIndex: () => currentFocusIndex.value,

    navigateLeft: () => {
      if (!isActive.value || elements.value.length === 0) return;

      if (currentFocusIndex.value > 0) {
        currentFocusIndex.value--;
        updateFocus();
      }
    },

    navigateRight: () => {
      if (!isActive.value || elements.value.length === 0) return;

      if (currentFocusIndex.value < elements.value.length - 1) {
        currentFocusIndex.value++;
        updateFocus();
      }
    },

    navigateUp: () => {
      // Cette méthode est gérée par le store global
    },

    navigateDown: () => {
      // Cette méthode est gérée par le store global
    },

    handleSelect: () => {
      if (!isActive.value || elements.value.length === 0) return;

      const currentElement = elements.value[currentFocusIndex.value];
      if (currentElement && currentElement.ref) {
        // Simuler un clic sur l'élément
        currentElement.ref.click();
      }
    },

    focusOnFirstElement: () => {
      currentFocusIndex.value = 0;
      updateFocus();
    },

    scrollToSection: () => {
      // La navbar est généralement toujours visible
      const navbarElement = document.querySelector(
        `[data-navbar-id="${navbarId}"]`
      );
      if (navbarElement) {
        navbarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  };

  // Lifecycle
  onMounted(() => {
    navigationStore.registerElement(navbarController);
  });

  onUnmounted(() => {
    navigationStore.unregisterElement(navbarId);
  });

  return {
    isActive,
    currentFocusIndex,
    elements,
    addElement,
    clearElements,
    updateFocus,

    // État pour les composants
    isElementFocused: (index: number) =>
      isActive.value && currentFocusIndex.value === index,
  };
}
