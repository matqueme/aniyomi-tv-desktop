import { extensionManager } from './manager/ExtensionManager';
import { AnimeSamaExtension } from './sources/AnimeSamaExtension';

/**
 * Initialisation des extensions
 * Enregistre toutes les extensions disponibles
 */
export function initializeExtensions(): void {
  extensionManager.registerExtension(new AnimeSamaExtension());
}

export { extensionManager } from './manager/ExtensionManager';
export * from '../types/extension';
