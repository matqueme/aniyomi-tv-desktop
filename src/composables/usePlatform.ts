import { ref, readonly } from 'vue';

// Interface pour la fenêtre Tizen
interface TizenWindow extends Window {
  tizen?: object;
}

declare const window: TizenWindow;

// État global de la plateforme
const _isTizen = ref<boolean>(false);
const _isTv = ref<boolean>(false);
const _isDesktop = ref<boolean>(false);

// Fonction d'initialisation
const initializePlatform = () => {
  // Détection de Tizen (Samsung TV)
  _isTizen.value = !!window.tizen || navigator.userAgent.includes('Tizen');

  // Détection TV (basée sur Tizen ou autres indicateurs)
  _isTv.value =
    _isTizen.value ||
    // Autres détections TV possibles
    navigator.userAgent.includes('TV') ||
    navigator.userAgent.includes('SmartTV') ||
    navigator.userAgent.includes('WebOS');

  // Détection Desktop
  _isDesktop.value =
    !_isTv.value &&
    window.matchMedia('(pointer: fine)').matches &&
    !('ontouchstart' in window);
};

// Composable principal
export const usePlatform = () => {
  // Initialiser lors du premier appel
  if (!_isTizen.value && !_isTv.value && !_isDesktop.value) {
    initializePlatform();
  }

  return {
    isTizen: readonly(_isTizen),
    isTv: readonly(_isTv),
    isDesktop: readonly(_isDesktop),

    // Fonctions utilitaires
    isFullscreenAvailable: readonly(ref(!_isTv.value)),
    shouldShowFullscreenButton: readonly(ref(!_isTv.value)),

    // Réinitialiser la détection (utile pour les tests)
    reinitialize: initializePlatform,
  };
};

// Auto-initialisation
initializePlatform();
