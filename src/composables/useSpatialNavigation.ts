import { onMounted, onUnmounted, inject } from 'vue';

/**
 * Interface pour SpatialNavigation
 */
interface ISpatialNavigation {
  init: () => void;
  uninit: () => void;
  resume: () => void;
  pause: () => void;
  focus: (selector?: string) => void;
  move: (direction: 'left' | 'right' | 'up' | 'down') => void;
  add: (sectionId: string, config?: Record<string, unknown>) => void;
  remove: (sectionId: string) => void;
  enable: (sectionId: string) => void;
  disable: (sectionId: string) => void;
  setDefaultSection: (sectionId: string) => void;
}

/**
 * Composable pour utiliser la navigation spatiale avec vue-spatial-nav
 */
export function useSpatialNavigation() {
  // Injection de l'instance SpatialNavigation
  const spatialNavigation = inject('spatialNavigation') as ISpatialNavigation;

  /**
   * Initialise la navigation spatiale
   */
  const initNavigation = () => {
    spatialNavigation.init();
    spatialNavigation.resume();
  };

  /**
   * Met en pause la navigation spatiale
   */
  const pauseNavigation = () => {
    spatialNavigation.pause();
  };

  /**
   * Reprend la navigation spatiale
   */
  const resumeNavigation = () => {
    spatialNavigation.resume();
  };

  /**
   * Désactive la navigation spatiale
   */
  const uninitNavigation = () => {
    spatialNavigation.uninit();
  };

  /**
   * Focus sur un élément spécifique
   */
  const focusElement = (selector: string) => {
    spatialNavigation.focus(selector);
  };

  /**
   * Focus sur la première section disponible
   */
  const focusFirstSection = () => {
    // Essayer d'abord de focus sur le premier élément focusable
    const firstFocusable = document.querySelector('[data-v-focus]');
    if (firstFocusable) {
      (firstFocusable as HTMLElement).focus();
    } else {
      spatialNavigation.focus();
    }
  };

  /**
   * Déplace le focus vers une direction spécifique
   */
  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    spatialNavigation.move(direction);
  };

  /**
   * Ajoute une section de navigation
   */
  const addSection = (sectionId: string, config?: Record<string, unknown>) => {
    spatialNavigation.add(sectionId, config);
  };

  /**
   * Supprime une section de navigation
   */
  const removeSection = (sectionId: string) => {
    spatialNavigation.remove(sectionId);
  };

  /**
   * Active/désactive une section
   */
  const setSection = (sectionId: string, enabled: boolean = true) => {
    if (enabled) {
      spatialNavigation.enable(sectionId);
    } else {
      spatialNavigation.disable(sectionId);
    }
  };

  /**
   * Définit une section comme par défaut
   */
  const setDefaultSection = (sectionId: string) => {
    spatialNavigation.setDefaultSection(sectionId);
  };

  /**
   * Gère les événements clavier pour la navigation TV
   */
  const handleTVKeyEvents = (event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement;
    const isInSwiper = activeElement?.closest('swiper-container') !== null;

    // Si on est dans un Swiper, laisser le swiper gérer toutes ses touches
    if (isInSwiper) {
      switch (event.keyCode || event.which) {
        case 37: // LEFT ARROW
        case 39: // RIGHT ARROW
        case 13: // ENTER
        case 32: // SPACE
          // Laisser le composant Swiper gérer ces touches
          return;
        case 38: // UP ARROW
        case 40: // DOWN ARROW
          // Navigation spatiale pour changer de section uniquement
          // si pas d'autres éléments focusables dans la direction
          break;
        case 10009: // BACK/RETURN sur Tizen
          event.preventDefault();
          // Logique de retour personnalisée si nécessaire
          break;
        default:
          // Laisser vue-spatial-nav gérer les autres touches
          break;
      }
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    initNavigation();
    document.addEventListener('keydown', handleTVKeyEvents);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleTVKeyEvents);
    uninitNavigation();
  });

  return {
    spatialNavigation,
    initNavigation,
    pauseNavigation,
    resumeNavigation,
    uninitNavigation,
    focusElement,
    focusFirstSection,
    move,
    addSection,
    removeSection,
    setSection,
    setDefaultSection,
  };
}
