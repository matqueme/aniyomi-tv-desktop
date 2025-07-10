import type { BaseExtension } from './base/BaseExtension';

/**
 * Registre des extensions
 */
class ExtensionRegistry {
  private extensions = new Map<string, BaseExtension>();

  /**
   * Enregistre une extension
   */
  register(extension: BaseExtension): void {
    this.extensions.set(extension.metadata.id, extension);
  }

  /**
   * Récupère une extension par son ID
   */
  getExtension(id: string): BaseExtension | undefined {
    return this.extensions.get(id);
  }

  /**
   * Récupère toutes les extensions
   */
  getAllExtensions(): BaseExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Récupère les extensions qui supportent la recherche
   */
  getSearchableExtensions(): BaseExtension[] {
    return this.getAllExtensions().filter((ext) => ext.metadata.supportsSearch);
  }

  /**
   * Récupère les extensions qui supportent les animes populaires
   */
  getPopularExtensions(): BaseExtension[] {
    return this.getAllExtensions().filter(
      (ext) => ext.metadata.supportsPopular
    );
  }

  /**
   * Récupère les extensions qui supportent les dernières mises à jour
   */
  getLatestExtensions(): BaseExtension[] {
    return this.getAllExtensions().filter((ext) => ext.metadata.supportsLatest);
  }

  /**
   * Récupère les métadonnées de toutes les extensions
   */
  getExtensionMetadata() {
    return this.getAllExtensions().map((ext) => ext.metadata);
  }
}

// Instance singleton
export const extensionRegistry = new ExtensionRegistry();

// Fonction pour initialiser les extensions
export async function initializeExtensions() {
  // Import dynamique des extensions
  const { AnimeSamaExtension } = await import('./sites/animesama.ts');

  // Enregistrement des extensions
  const animeSamaExtension = new AnimeSamaExtension();
  extensionRegistry.register(animeSamaExtension);
}
