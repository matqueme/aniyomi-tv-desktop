import { onMounted, onUnmounted, inject } from 'vue';
import type SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';

/**
 * Composable pour utiliser la navigation spatiale avec vue-spatial-nav
 */
export function useSpatialNavigation() {
  // Injection de l'instance SpatialNavigation
  const spatialNavigation = inject('spatialNavigation') as typeof SpatialNavigation;

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
    // Utiliser la méthode focus native de SpatialNavigation
    spatialNavigation.focus();
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

  // Lifecycle hooks
  onMounted(() => {
    initNavigation();
  });

  onUnmounted(() => {
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
