import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extensionManager } from '@/extensions/manager/ExtensionManager';
import { initializeExtensions as initExtensions } from '@/extensions/index';
import type { ExtensionMetadata } from '@/extensions/base/BaseExtension';

export const useExtensionsStore = defineStore('extensions', () => {
  // État
  const initialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters computed
  const availableExtensions = computed((): ExtensionMetadata[] => {
    return extensionManager.getExtensionMetadata();
  });

  const enabledExtensions = computed((): ExtensionMetadata[] => {
    return availableExtensions.value; // Toutes les extensions sont activées par défaut
  });

  const extensionCount = computed((): number => {
    return availableExtensions.value.length;
  });

  // Actions
  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null): void => {
    error.value = errorMessage;
  };

  const initializeExtensions = async (): Promise<void> => {
    if (initialized.value) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await initExtensions();
      initialized.value = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'initialisation des extensions";
      setError(errorMessage);
      console.error("Erreur lors de l'initialisation des extensions:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // État
    initialized: computed(() => initialized.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Getters
    availableExtensions,
    enabledExtensions,
    extensionCount,

    // Actions
    setLoading,
    setError,
    initializeExtensions,
  };
});
