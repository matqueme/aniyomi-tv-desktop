<template>
  <div
    class="fixed bottom-4 right-4 z-50 max-h-[80vh] w-80 select-all overflow-y-auto rounded-lg border border-slate-600/40 bg-slate-900/95 p-4 font-mono text-sm text-white shadow-lg backdrop-blur-md"
  >
    <h3
      class="mb-3 border-b border-slate-600/50 pb-2 text-lg font-bold text-white"
    >
      🎮 Navigation Debug
    </h3>

    <!-- Éléments focusables -->
    <div class="space-y-1">
      <h4 class="mb-1 text-xs font-semibold text-blue-300">
        🎯 Éléments focusables ({{ focusableElements.length }})
      </h4>
      <div class="max-h-32 space-y-1 overflow-y-auto">
        <div
          v-if="focusableElements.length === 0"
          class="text-xs text-slate-500"
        >
          Aucun élément focusable détecté
        </div>
        <div
          v-for="(element, index) in focusableElements"
          :key="index"
          class="text-xs"
          :class="{
            'font-semibold text-yellow-300': element.isFocused,
            'text-slate-300': !element.isFocused,
          }"
        >
          {{ element.tagName }}
          <span v-if="element.id" class="text-blue-400">#{{ element.id }}</span>
          <span v-if="element.classes" class="text-green-400"
            >.{{ element.classes }}</span
          >
          <span v-if="element.isFocused" class="text-yellow-400">← focus</span>
        </div>
      </div>
    </div>

    <!-- Élément actuellement focusé -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-purple-300">
        🔍 Focus actuel
      </h4>
      <div v-if="currentFocus" class="text-xs text-green-300">
        {{ currentFocus.tagName }}
        <span v-if="currentFocus.id" class="text-blue-400"
          >#{{ currentFocus.id }}</span
        >
        <span v-if="currentFocus.classes" class="text-green-400"
          >.{{ currentFocus.classes }}</span
        >
      </div>
      <div v-else class="text-xs text-slate-500">Aucun élément focusé</div>
    </div>

    <!-- Indicateur visuel des touches pressées -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-orange-300">
        ⌨️ Dernière action
      </h4>
      <div v-if="lastKeyPressed" class="text-xs text-green-300">
        {{ lastKeyPressed }}
      </div>
      <div v-else class="text-xs text-slate-500">Appuyez sur une touche...</div>
    </div>

    <!-- Aide -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <div class="text-xs text-slate-400">
        ⬆️⬇️⬅️➡️ Navigation | ⏎ Sélection | ESC Retour
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { normalizeKeyboardEvent, getKeyDisplayName } from '@/utils/keyboardUtils';

// Types pour les données de navigation
interface FocusableElement {
  tagName: string;
  id?: string;
  classes?: string;
  isFocused: boolean;
}

// État réactif
const lastKeyPressed = ref<string>('');
const focusableElements = ref<FocusableElement[]>([]);
const currentFocus = ref<FocusableElement | null>(null);

// Injection de l'instance SpatialNavigation (pour usage futur)
// const spatialNavigation = inject('spatialNavigation');

// Détection des éléments focusables
const detectFocusableElements = (): FocusableElement[] => {
  // Sélecteurs pour détecter les éléments focusables
  const selectors = [
    // Directives vue-spatial-nav
    '[v-focus]',
    '[data-v-focus]',
    '[data-sn-focusable]',

    // Éléments HTML natifs focusables
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',

    // Éléments spécifiques à l'application
    'swiper-container',
    '.anime-card',
    '.focusable',
    '.sn-focusable',
  ];

  const focusableElements = document.querySelectorAll(selectors.join(', '));
  const activeElement = document.activeElement;

  return Array.from(focusableElements)
    .filter((element) => {
      // Filtrer les éléments invisibles ou désactivés
      const computedStyle = window.getComputedStyle(element);
      return (
        computedStyle.display !== 'none' &&
        computedStyle.visibility !== 'hidden' &&
        !(element as HTMLElement).hasAttribute('disabled')
      );
    })
    .map((element) => {
      const tagName = element.tagName.toLowerCase();
      const id = element.id;

      // Améliorer l'affichage des classes (prendre les 2 premières classes significatives)
      let classes = '';
      if (element.className) {
        const classList = element.className
          .split(' ')
          .filter((cls) => cls.length > 0 && !cls.startsWith('data-v-'))
          .slice(0, 3);
        classes = classList.join(' ');
      }

      const isFocused = element === activeElement;

      return {
        tagName,
        id: id || undefined,
        classes: classes || undefined,
        isFocused,
      };
    });
};

// Mise à jour de l'élément actuellement focusé
const updateCurrentFocus = () => {
  const activeElement = document.activeElement;

  if (activeElement && activeElement !== document.body) {
    const tagName = activeElement.tagName.toLowerCase();
    const id = activeElement.id;
    const classes = activeElement.className
      ? activeElement.className.split(' ').slice(0, 2).join(' ')
      : undefined;

    currentFocus.value = {
      tagName,
      id: id || undefined,
      classes: classes || undefined,
      isFocused: true,
    };
  } else {
    currentFocus.value = null;
  }
};

// Mise à jour de toutes les données de navigation
const updateNavigationData = () => {
  focusableElements.value = detectFocusableElements();
  updateCurrentFocus();
};

// Gestionnaire d'événements pour les touches
const handleKeyUp = (event: KeyboardEvent) => {
  // Normaliser l'événement clavier pour la compatibilité TV
  const keyData = normalizeKeyboardEvent(event);
  const keyName = getKeyDisplayName(keyData.code, keyData.keyCode);
  
  lastKeyPressed.value = keyName;

  // Mettre à jour les données de navigation après un délai pour permettre à la navigation de se faire
  setTimeout(() => {
    updateNavigationData();
  }, 50);

  // Effacer après 2 secondes
  setTimeout(() => {
    if (lastKeyPressed.value === keyName) {
      lastKeyPressed.value = '';
    }
  }, 2000);
};

// Gestionnaire d'événements pour les changements de focus
const handleFocusChange = () => {
  updateNavigationData();
};

// Observateur pour détecter les changements dans le DOM
let observer: MutationObserver;

onMounted(() => {
  // Mise à jour initiale
  updateNavigationData();

  // Écoute des événements
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('focusin', handleFocusChange);
  document.addEventListener('focusout', handleFocusChange);

  // Observateur de mutations pour détecter les changements dans le DOM
  observer = new MutationObserver(() => {
    // Délai pour permettre au DOM de se stabiliser
    setTimeout(updateNavigationData, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-sn-focusable', 'v-focus', 'data-v-focus'],
  });

  // Mise à jour périodique pour s'assurer que les données sont à jour
  const interval = setInterval(updateNavigationData, 1000);

  // Nettoyage de l'intervalle lors du démontage
  onUnmounted(() => {
    clearInterval(interval);
  });
});

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('focusin', handleFocusChange);
  document.removeEventListener('focusout', handleFocusChange);

  if (observer) {
    observer.disconnect();
  }
});
</script>
