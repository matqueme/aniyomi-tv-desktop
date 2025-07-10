import { extensionManager } from './manager/ExtensionManager';
import { AnimeSamaExtension } from './sources/AnimeSamaExtension';

/**
 * Initialisation des extensions
 * Enregistre toutes les extensions disponibles
 */
export function initializeExtensions(): void {
  // Enregistrement des extensions
  extensionManager.registerExtension(new AnimeSamaExtension());

  console.log('Extensions initialized');
  console.log('Available extensions:', extensionManager.getAllExtensions());
}

// Export du gestionnaire pour l'utilisation dans l'application
export { extensionManager } from './manager/ExtensionManager';
export * from './types/extension';
