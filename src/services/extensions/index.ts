/**
 * Point d'entrée principal pour le système d'extensions
 */

// Gestionnaire principal
export { ExtensionManager, extensionManager } from './manager';

// Services d'extensions
export { AnimeSamaService, animeSamaService } from './animesama';

// Système de cache
export { MemoryCache, ExtensionCache, extensionCache, cached } from './cache';

// Configuration
export {
  EXTENSION_CONFIG,
  USER_AGENTS,
  getExtensionConfig,
  isExtensionEnabled,
  getEnabledExtensions,
  getRandomUserAgent,
} from './config';

// Types réexportés pour faciliter l'utilisation
export type { ExtensionConfig, AnimeSamaConfig, ExtensionInfo } from './config';

// Imports pour utilisation interne
import { extensionManager } from './manager';
import { animeSamaService } from './animesama';
import { extensionCache } from './cache';
import { EXTENSION_CONFIG } from './config';

// Version et informations
export const EXTENSION_SYSTEM_VERSION = '2.0.0';
export const EXTENSION_SYSTEM_INFO = {
  version: EXTENSION_SYSTEM_VERSION,
  name: 'Aniyomi TV Extension System',
  description: "Système d'extensions moderne pour le streaming d'animes",
  features: [
    'Gestion multi-extensions',
    'Cache intelligent avec TTL',
    'Gestion robuste des erreurs',
    'Traitement parallèle',
    'Configuration centralisée',
    'Monitoring et statistiques',
  ],
  supportedExtensions: ['AnimeSama'],
  lastUpdated: '2025-07-08',
} as const;

/**
 * Initialise le système d'extensions
 */
export async function initializeExtensionSystem(): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    console.log("🚀 Initialisation du système d'extensions...");

    // Vérifier que le gestionnaire est correctement initialisé
    const extensions = extensionManager.getAvailableExtensions();
    console.log(
      `📦 ${extensions.length} extension(s) disponible(s):`,
      extensions
    );

    // Tester la connectivité des extensions actives
    const activeExtensions = extensions.filter((ext) => ext.isEnabled);
    if (activeExtensions.length === 0) {
      console.warn('⚠️ Aucune extension active trouvée');
    }

    // Test de connectivité pour AnimeSama si activé
    const animeSamaExt = extensions.find((ext) => ext.key === 'animesama');
    if (animeSamaExt?.isEnabled) {
      try {
        const connectionTest = await animeSamaService.testConnection();
        if (connectionTest.success) {
          console.log(
            `✅ AnimeSama connecté (${connectionTest.responseTime}ms)`
          );
        } else {
          console.warn(`❌ AnimeSama non accessible: ${connectionTest.error}`);
        }
      } catch (error) {
        console.warn(
          '❌ Erreur lors du test de connectivité AnimeSama:',
          error
        );
      }
    }

    // Initialiser le cache
    const cacheStats = extensionCache.getStats();
    console.log(`💾 Cache initialisé: ${cacheStats.maxEntries} entrées max`);

    // Nettoyage initial du cache
    extensionCache.cleanup();

    console.log("✅ Système d'extensions initialisé avec succès");

    return {
      success: true,
      message: `Système initialisé avec ${extensions.length} extension(s)`,
      details: {
        extensions,
        cacheStats,
        systemInfo: EXTENSION_SYSTEM_INFO,
      },
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation du système d'extensions:",
      error
    );

    return {
      success: false,
      message: "Échec de l'initialisation du système d'extensions",
      details: error,
    };
  }
}

/**
 * Obtient des statistiques détaillées du système
 */
export function getExtensionSystemStats(): {
  version: string;
  uptime: number;
  extensions: ReturnType<typeof extensionManager.getAvailableExtensions>;
  cache: ReturnType<typeof extensionCache.getStats>;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
} {
  const extensions = extensionManager.getAvailableExtensions();
  const cache = extensionCache.getStats();

  // Estimation approximative de l'utilisation mémoire
  const memoryInfo = {
    used: cache.memory,
    total: 50 * 1024 * 1024, // 50MB estimés pour l'app
    percentage: 0,
  };
  memoryInfo.percentage = (memoryInfo.used / memoryInfo.total) * 100;

  return {
    version: EXTENSION_SYSTEM_VERSION,
    uptime: Date.now() - (performance?.timeOrigin || 0),
    extensions,
    cache,
    memory: memoryInfo,
  };
}

/**
 * Nettoie et réinitialise le système
 */
export function resetExtensionSystem(): void {
  console.log("🔄 Réinitialisation du système d'extensions...");

  // Nettoyer le cache
  extensionCache.clear();

  // Réactiver toutes les extensions
  const extensions = extensionManager.getAvailableExtensions();
  extensions.forEach((ext) => {
    extensionManager.toggleExtension(ext.key, true);
  });

  console.log('✅ Système réinitialisé');
}

/**
 * Fonction utilitaire pour débugger le système
 */
export function debugExtensionSystem(): void {
  console.group("🔍 Debug - Système d'extensions");

  const stats = getExtensionSystemStats();
  console.log('📊 Statistiques:', stats);

  const extensions = extensionManager.getAvailableExtensions();
  console.log('📦 Extensions:', extensions);

  const cacheStats = extensionCache.getStats();
  console.log('💾 Cache:', cacheStats);

  console.log('⚙️ Configuration:', EXTENSION_CONFIG);

  console.groupEnd();
}
