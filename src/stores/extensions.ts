import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extensionManager } from '@/extensions';
import type { ExtensionInfo } from '@/extensions/types/extension';

/**
 * Store pour gérer les extensions
 */
export const useExtensionStore = defineStore('extension', () => {
  // État
  const extensions = ref<ExtensionInfo[]>([]);
  const currentExtensionId = ref<string>('animesama');
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const currentExtension = computed(() =>
    extensions.value.find((ext) => ext.id === currentExtensionId.value)
  );

  const enabledExtensions = computed(() =>
    extensions.value.filter((ext) => ext.isEnabled)
  );

  // Actions
  const loadExtensions = () => {
    extensions.value = extensionManager.getAllExtensions();
  };

  const toggleExtension = (id: string) => {
    extensionManager.toggleExtension(id);
    loadExtensions(); // Recharger pour mettre à jour l'état
  };

  const setCurrentExtension = (id: string) => {
    const extension = extensions.value.find((ext) => ext.id === id);
    if (extension && extension.isEnabled) {
      currentExtensionId.value = id;
    }
  };

  return {
    // État
    extensions,
    currentExtensionId,
    loading,
    error,

    // Getters
    currentExtension,
    enabledExtensions,

    // Actions
    loadExtensions,
    toggleExtension,
    setCurrentExtension,
  };
});
