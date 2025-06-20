import { ref, onMounted, onUnmounted, readonly } from 'vue';

interface NavigationItem {
  id: string;
  activate: () => void;
  deactivate: () => void;
  focusedIndex: number;
  isActive: boolean;
}

export function useRemoteNavigation() {
  const items = ref<NavigationItem[]>([]);
  const activeItemIndex = ref(0);

  // Enregistrer un élément navigable
  const registerItem = (item: NavigationItem) => {
    items.value.push(item);

    // Activer le premier élément par défaut
    if (items.value.length === 1) {
      item.activate();
    }

    return () => {
      const index = items.value.findIndex((i) => i.id === item.id);
      if (index > -1) {
        items.value.splice(index, 1);
      }
    };
  };

  // Navigation entre les éléments
  const switchToNextItem = () => {
    if (items.value.length <= 1) return;

    // Désactiver l'élément actuel
    items.value[activeItemIndex.value]?.deactivate();

    // Passer au suivant
    activeItemIndex.value = (activeItemIndex.value + 1) % items.value.length;

    // Activer le nouveau
    items.value[activeItemIndex.value]?.activate();
  };

  const switchToPreviousItem = () => {
    if (items.value.length <= 1) return;

    // Désactiver l'élément actuel
    items.value[activeItemIndex.value]?.deactivate();

    // Passer au précédent
    activeItemIndex.value =
      activeItemIndex.value === 0
        ? items.value.length - 1
        : activeItemIndex.value - 1;

    // Activer le nouveau
    items.value[activeItemIndex.value]?.activate();
  };

  // Gestion des événements globaux (pour la navigation entre listes)
  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    // Navigation verticale entre les listes avec Page Up/Page Down
    switch (event.keyCode) {
      case 33: // Page Up
        event.preventDefault();
        switchToPreviousItem();
        break;
      case 34: // Page Down
        event.preventDefault();
        switchToNextItem();
        break;
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown);
  });

  return {
    registerItem,
    activeItemIndex: readonly(activeItemIndex),
    switchToNextItem,
    switchToPreviousItem,
  };
}
