/**
 * Utilitaires pour la gestion des événements clavier avec compatibilité TV
 * 
 * Sur certaines TV (notamment Tizen), event.key peut être undefined
 * Cette utility fournit un fallback sur keyCode pour assurer la compatibilité
 */

export interface KeyboardEventData {
  key: string;
  code: string;
  keyCode: number;
  isArrowKey: boolean;
  isEnterKey: boolean;
  isEscapeKey: boolean;
  isSpaceKey: boolean;
  isBackspaceKey: boolean;
  isDigitKey: boolean;
  isLetterKey: boolean;
}

/**
 * Mapping des keyCodes vers les codes de touches standard
 */
const KEY_CODE_MAP: Record<number, string> = {
  // Touches de navigation
  37: 'ArrowLeft',
  38: 'ArrowUp', 
  39: 'ArrowRight',
  40: 'ArrowDown',
  
  // Touches d'action
  13: 'Enter',
  27: 'Escape',
  32: 'Space',
  8: 'Backspace',
  
  // Chiffres
  48: 'Digit0', 49: 'Digit1', 50: 'Digit2', 51: 'Digit3', 52: 'Digit4',
  53: 'Digit5', 54: 'Digit6', 55: 'Digit7', 56: 'Digit8', 57: 'Digit9',
  
  // Pavé numérique
  96: 'Numpad0', 97: 'Numpad1', 98: 'Numpad2', 99: 'Numpad3', 100: 'Numpad4',
  101: 'Numpad5', 102: 'Numpad6', 103: 'Numpad7', 104: 'Numpad8', 105: 'Numpad9',
  
  // Lettres
  65: 'KeyA', 66: 'KeyB', 67: 'KeyC', 68: 'KeyD', 69: 'KeyE', 70: 'KeyF',
  71: 'KeyG', 72: 'KeyH', 73: 'KeyI', 74: 'KeyJ', 75: 'KeyK', 76: 'KeyL',
  77: 'KeyM', 78: 'KeyN', 79: 'KeyO', 80: 'KeyP', 81: 'KeyQ', 82: 'KeyR',
  83: 'KeyS', 84: 'KeyT', 85: 'KeyU', 86: 'KeyV', 87: 'KeyW', 88: 'KeyX',
  89: 'KeyY', 90: 'KeyZ',
  
  // Touches spéciales TV/télécommande
  10009: 'BrowserBack', // Tizen Back
  461: 'BrowserBack',   // Autre code back TV
  462: 'GoBack',        // Autre variante
};

/**
 * Mapping des keyCodes vers les valeurs key
 */
const KEY_VALUE_MAP: Record<number, string> = {
  // Touches de navigation
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight', 
  40: 'ArrowDown',
  
  // Touches d'action
  13: 'Enter',
  27: 'Escape',
  32: ' ',
  8: 'Backspace',
  
  // Chiffres
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4',
  53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
  
  // Pavé numérique
  96: '0', 97: '1', 98: '2', 99: '3', 100: '4',
  101: '5', 102: '6', 103: '7', 104: '8', 105: '9',
  
  // Lettres (minuscules par défaut)
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f',
  71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l',
  77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r',
  83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x',
  89: 'y', 90: 'z',
  
  // Touches spéciales
  10009: 'BrowserBack',
  461: 'BrowserBack',
  462: 'GoBack',
};

/**
 * Normalise un événement clavier pour assurer la compatibilité cross-platform
 * Utilise keyCode comme fallback si key ou code sont undefined
 */
export function normalizeKeyboardEvent(event: KeyboardEvent): KeyboardEventData {
  // Utiliser les valeurs de l'événement ou les fallbacks depuis keyCode
  const key = event.key || KEY_VALUE_MAP[event.keyCode] || String.fromCharCode(event.keyCode) || '';
  const code = event.code || KEY_CODE_MAP[event.keyCode] || '';
  const keyCode = event.keyCode;
  
  return {
    key,
    code,
    keyCode,
    isArrowKey: isArrowKey(code, keyCode),
    isEnterKey: isEnterKey(code, keyCode),
    isEscapeKey: isEscapeKey(code, keyCode),
    isSpaceKey: isSpaceKey(code, keyCode),
    isBackspaceKey: isBackspaceKey(code, keyCode),
    isDigitKey: isDigitKey(code, keyCode),
    isLetterKey: isLetterKey(code, keyCode),
  };
}

/**
 * Vérifie si c'est une touche de flèche directionnelle
 */
export function isArrowKey(code: string, keyCode: number): boolean {
  return ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(code) ||
         [37, 38, 39, 40].includes(keyCode);
}

/**
 * Vérifie si c'est la touche Entrée
 */
export function isEnterKey(code: string, keyCode: number): boolean {
  return code === 'Enter' || keyCode === 13;
}

/**
 * Vérifie si c'est la touche Échap
 */
export function isEscapeKey(code: string, keyCode: number): boolean {
  return code === 'Escape' || keyCode === 27;
}

/**
 * Vérifie si c'est la touche Espace
 */
export function isSpaceKey(code: string, keyCode: number): boolean {
  return code === 'Space' || keyCode === 32;
}

/**
 * Vérifie si c'est la touche Retour arrière
 */
export function isBackspaceKey(code: string, keyCode: number): boolean {
  return code === 'Backspace' || keyCode === 8;
}

/**
 * Vérifie si c'est une touche retour (pour TV/télécommande)
 */
export function isBackKey(code: string, keyCode: number): boolean {
  return ['BrowserBack', 'Backspace', 'GoBack'].includes(code) ||
         [10009, 461, 462, 8].includes(keyCode);
}

/**
 * Vérifie si c'est une touche chiffre
 */
export function isDigitKey(code: string, keyCode: number): boolean {
  return code.startsWith('Digit') || code.startsWith('Numpad') ||
         (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105);
}

/**
 * Vérifie si c'est une touche lettre
 */
export function isLetterKey(code: string, keyCode: number): boolean {
  return code.startsWith('Key') ||
         (keyCode >= 65 && keyCode <= 90);
}

/**
 * Obtient le chiffre depuis un événement clavier
 */
export function getDigitFromKey(code: string, keyCode: number): number | null {
  if (code.startsWith('Digit')) {
    return parseInt(code.replace('Digit', ''));
  }
  if (code.startsWith('Numpad')) {
    return parseInt(code.replace('Numpad', ''));
  }
  if (keyCode >= 48 && keyCode <= 57) {
    return keyCode - 48;
  }
  if (keyCode >= 96 && keyCode <= 105) {
    return keyCode - 96;
  }
  return null;
}

/**
 * Obtient la lettre depuis un événement clavier
 */
export function getLetterFromKey(code: string, keyCode: number): string | null {
  if (code.startsWith('Key')) {
    return code.replace('Key', '').toLowerCase();
  }
  if (keyCode >= 65 && keyCode <= 90) {
    return String.fromCharCode(keyCode).toLowerCase();
  }
  return null;
}

/**
 * Convertit un keyCode en nom lisible pour le debug
 */
export function getKeyDisplayName(code: string, keyCode: number): string {
  switch (keyCode) {
    case 37: return '⬅️ LEFT';
    case 38: return '⬆️ UP';
    case 39: return '➡️ RIGHT';
    case 40: return '⬇️ DOWN';
    case 13: return '⏎ ENTER';
    case 27: return '⎋ ESC';
    case 32: return '␣ SPACE';
    case 8: return '⌫ BACKSPACE';
    case 10009: return '🔙 BACK (Tizen)';
    case 461:
    case 462: return '🔙 BACK (TV)';
    default:
      if (code) return code;
      if (keyCode >= 65 && keyCode <= 90) {
        return String.fromCharCode(keyCode);
      }
      if (keyCode >= 48 && keyCode <= 57) {
        return String.fromCharCode(keyCode);
      }
      return `Key${keyCode}`;
  }
}
