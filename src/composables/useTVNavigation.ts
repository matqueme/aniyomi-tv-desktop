import { onMounted, onUnmounted } from 'vue';
import { useNavigationStore } from '../stores/navigation';

/**
 * Codes de touches pour les télécommandes TV et applications Tizen
 */
export const TV_KEYS = {
  // Touches directionnelles
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  // Touches de sélection
  ENTER: 13,
  OK: 13,

  // Touches de retour
  BACK: 10009,
  RETURN: 10009,

  // Touches colorées (télécommandes TV)
  RED: 427,
  GREEN: 428,
  YELLOW: 429,
  BLUE: 430,

  // Touches multimédias
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  REWIND: 412,
  FAST_FORWARD: 417,

  // Touches numériques
  NUM_0: 48,
  NUM_1: 49,
  NUM_2: 50,
  NUM_3: 51,
  NUM_4: 52,
  NUM_5: 53,
  NUM_6: 54,
  NUM_7: 55,
  NUM_8: 56,
  NUM_9: 57,
} as const;

/**
 * Interface pour les handlers d'événements personnalisés
 */
export interface TVEventHandlers {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onSelect?: () => void;
  onBack?: () => void;
  onRed?: () => void;
  onGreen?: () => void;
  onYellow?: () => void;
  onBlue?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  onNumber?: (number: number) => void;
}

/**
 * Composable pour gérer les événements de navigation TV
 * Utilise le store de navigation pour la gestion globale
 */
export function useTVNavigation(customHandlers: TVEventHandlers = {}) {
  const navigationStore = useNavigationStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    const keyCode = event.keyCode;

    // Log pour le débogage
    console.log(`Touche pressée: ${keyCode}`);
    // Empêcher le comportement par défaut pour toutes les touches de navigation
    const tvKeyValues = Object.values(TV_KEYS) as number[];
    if (tvKeyValues.includes(keyCode)) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (keyCode) {
      case TV_KEYS.LEFT:
        if (customHandlers.onLeft) {
          customHandlers.onLeft();
        } else {
          navigationStore.navigateLeft();
        }
        break;

      case TV_KEYS.RIGHT:
        if (customHandlers.onRight) {
          customHandlers.onRight();
        } else {
          navigationStore.navigateRight();
        }
        break;

      case TV_KEYS.UP:
        if (customHandlers.onUp) {
          customHandlers.onUp();
        } else {
          navigationStore.navigateUp();
        }
        break;

      case TV_KEYS.DOWN:
        if (customHandlers.onDown) {
          customHandlers.onDown();
        } else {
          navigationStore.navigateDown();
        }
        break;

      case TV_KEYS.ENTER:
        if (customHandlers.onSelect) {
          customHandlers.onSelect();
        } else {
          navigationStore.handleSelect();
        }
        break;

      case TV_KEYS.BACK:
        if (customHandlers.onBack) {
          customHandlers.onBack();
        } else {
          console.log('Retour pressé - pas de handler défini');
        }
        break;

      case TV_KEYS.RED:
        customHandlers.onRed?.();
        break;

      case TV_KEYS.GREEN:
        customHandlers.onGreen?.();
        break;

      case TV_KEYS.YELLOW:
        customHandlers.onYellow?.();
        break;

      case TV_KEYS.BLUE:
        customHandlers.onBlue?.();
        break;

      case TV_KEYS.PLAY:
        customHandlers.onPlay?.();
        break;

      case TV_KEYS.PAUSE:
        customHandlers.onPause?.();
        break;

      case TV_KEYS.STOP:
        customHandlers.onStop?.();
        break;

      case TV_KEYS.REWIND:
        customHandlers.onRewind?.();
        break;

      case TV_KEYS.FAST_FORWARD:
        customHandlers.onFastForward?.();
        break; // Touches numériques
      case TV_KEYS.NUM_0:
      case TV_KEYS.NUM_1:
      case TV_KEYS.NUM_2:
      case TV_KEYS.NUM_3:
      case TV_KEYS.NUM_4:
      case TV_KEYS.NUM_5:
      case TV_KEYS.NUM_6:
      case TV_KEYS.NUM_7:
      case TV_KEYS.NUM_8:
      case TV_KEYS.NUM_9: {
        const number = keyCode - TV_KEYS.NUM_0;
        customHandlers.onNumber?.(number);
        break;
      }

      default:
        // Laisser passer les autres touches
        break;
    }
  };

  // Méthodes utilitaires
  const startListening = () => {
    document.addEventListener('keydown', handleKeyDown, true);
    console.log('Écoute des événements TV activée');
  };

  const stopListening = () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    console.log('Écoute des événements TV désactivée');
  };

  // Auto-gestion du cycle de vie
  onMounted(() => {
    startListening();
  });

  onUnmounted(() => {
    stopListening();
  });

  return {
    startListening,
    stopListening,
    navigationStore,
  };
}

/**
 * Composable simplifié pour les pages qui n'ont besoin que de la navigation de base
 */
export function useBasicTVNavigation() {
  return useTVNavigation();
}
