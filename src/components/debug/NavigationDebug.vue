<template>
  <div
    class="fixed bottom-4 right-4 z-50 max-h-[80vh] w-80 select-all overflow-y-auto rounded-lg border border-slate-600/40 bg-slate-900/95 p-4 font-mono text-sm text-white shadow-lg backdrop-blur-md"
  >
    <h3 class="mb-2 font-bold">🎮 Navigation Debug</h3>
    
    <!-- État général -->
    <div class="space-y-1">
      <div>Navigation Spatiale: ✅ Activée</div>
      <div>Système: vue-spatial-nav</div>
      <div class="mt-1 text-xs text-slate-400">
        Navigation automatique par directives
      </div>
    </div>

    <!-- Sections de navigation -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-yellow-300">📋 Sections ({{ sections.length }})</h4>
      <div class="space-y-1">
        <div v-if="sections.length === 0" class="text-xs text-slate-500">
          Aucune section détectée
        </div>
        <div
          v-for="section in sections"
          :key="section.id"
          class="text-xs"
          :class="{
            'text-green-300': section.isDefault,
            'text-blue-300': !section.isDefault && section.isEnabled,
            'text-red-300': !section.isEnabled
          }"
        >
          {{ section.id }} 
          <span v-if="section.isDefault" class="text-yellow-300">(défaut)</span>
          <span v-if="!section.isEnabled" class="text-red-400">(désactivée)</span>
          - {{ section.focusableCount }} éléments
        </div>
      </div>
    </div>

    <!-- Éléments focusables -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-blue-300">🎯 Éléments focusables ({{ focusableElements.length }})</h4>
      <div class="max-h-32 space-y-1 overflow-y-auto">
        <div v-if="focusableElements.length === 0" class="text-xs text-slate-500">
          Aucun élément focusable détecté
        </div>
        <div
          v-for="(element, index) in focusableElements"
          :key="index"
          class="text-xs"
          :class="{
            'text-yellow-300 font-semibold': element.isFocused,
            'text-slate-300': !element.isFocused
          }"
        >
          {{ element.tagName }}
          <span v-if="element.id" class="text-blue-400">#{{ element.id }}</span>
          <span v-if="element.classes" class="text-green-400">.{{ element.classes }}</span>
          <span v-if="element.isFocused" class="text-yellow-400">← focus</span>
        </div>
      </div>
    </div>

    <!-- Élément actuellement focusé -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-purple-300">🔍 Focus actuel</h4>
      <div v-if="currentFocus" class="text-xs text-green-300">
        {{ currentFocus.tagName }}
        <span v-if="currentFocus.id" class="text-blue-400">#{{ currentFocus.id }}</span>
        <span v-if="currentFocus.classes" class="text-green-400">.{{ currentFocus.classes }}</span>
      </div>
      <div v-else class="text-xs text-slate-500">
        Aucun élément focusé
      </div>
    </div>

    <!-- Indicateur visuel des touches pressées -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
      <h4 class="mb-1 text-xs font-semibold text-orange-300">⌨️ Dernière action</h4>
      <div v-if="lastKeyPressed" class="text-xs text-green-300">
        {{ lastKeyPressed }}
      </div>
      <div v-else class="text-xs text-slate-500">
        Appuyez sur une touche...
      </div>
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

// Types pour les données de navigation
interface SectionInfo {
  id: string;
  isDefault: boolean;
  isEnabled: boolean;
  focusableCount: number;
}

interface FocusableElement {
  tagName: string;
  id?: string;
  classes?: string;
  isFocused: boolean;
}

// État réactif
const lastKeyPressed = ref<string>('');
const sections = ref<SectionInfo[]>([]);
const focusableElements = ref<FocusableElement[]>([]);
const currentFocus = ref<FocusableElement | null>(null);

// Injection de l'instance SpatialNavigation (pour usage futur)
// const spatialNavigation = inject('spatialNavigation');

// Détection des sections de navigation spatiale
const detectSections = (): SectionInfo[] => {
  // Chercher tous les éléments avec v-focus-section
  const sectionElements = document.querySelectorAll('[data-sn-section]');
  const sectionsMap = new Map<string, SectionInfo>();

  sectionElements.forEach((element) => {
    // Extraire l'ID de section
    const sectionId = element.getAttribute('data-sn-section') || 'default';
    
    // Compter les éléments focusables dans cette section
    const focusableInSection = element.querySelectorAll('[data-sn-focusable]').length;
    
    // Vérifier si c'est la section par défaut
    const isDefault = element.hasAttribute('data-sn-default-section') || sectionId === 'default';
    
    // Vérifier si la section est désactivée
    const isEnabled = !element.hasAttribute('data-sn-disabled');

    sectionsMap.set(sectionId, {
      id: sectionId,
      isDefault,
      isEnabled,
      focusableCount: focusableInSection,
    });
  });

  // Si aucune section détectée avec les attributs vue-spatial-nav, essayer avec les sélecteurs CSS
  if (sectionsMap.size === 0) {
    const cssBasedSections = document.querySelectorAll('[v-focus-section], [data-v-focus-section]');
    cssBasedSections.forEach((element, index) => {
      const sectionId = `section-${index + 1}`;
      const focusableInSection = element.querySelectorAll('[v-focus], [data-v-focus]').length;
      
      sectionsMap.set(sectionId, {
        id: sectionId,
        isDefault: index === 0,
        isEnabled: true,
        focusableCount: focusableInSection,
      });
    });
  }

  return Array.from(sectionsMap.values());
};

// Détection des éléments focusables
const detectFocusableElements = (): FocusableElement[] => {
  // Chercher les éléments focusables avec différents sélecteurs
  const selectors = [
    '[data-sn-focusable]',
    '[v-focus]',
    '[data-v-focus]',
    '.sn-focusable',
    'button',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  const focusableElements = document.querySelectorAll(selectors.join(', '));
  const activeElement = document.activeElement;

  return Array.from(focusableElements).map((element) => {
    const tagName = element.tagName.toLowerCase();
    const id = element.id;
    const classes = element.className ? element.className.split(' ').slice(0, 2).join(' ') : undefined;
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
    const classes = activeElement.className ? activeElement.className.split(' ').slice(0, 2).join(' ') : undefined;

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
  sections.value = detectSections();
  focusableElements.value = detectFocusableElements();
  updateCurrentFocus();
};

// Gestionnaire d'événements pour les touches
const handleKeyDown = (event: KeyboardEvent) => {
  const keyName = getKeyName(event);
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

// Convertir les codes de touches en noms lisibles
const getKeyName = (event: KeyboardEvent): string => {
  switch (event.keyCode) {
    case 37:
      return '⬅️ LEFT';
    case 38:
      return '⬆️ UP';
    case 39:
      return '➡️ RIGHT';
    case 40:
      return '⬇️ DOWN';
    case 13:
      return '⏎ ENTER';
    case 27:
      return '⎋ ESC';
    case 10009:
      return '🔙 BACK (Tizen)';
    default:
      return `${event.key || event.keyCode}`;
  }
};

// Observateur pour détecter les changements dans le DOM
let observer: MutationObserver;

onMounted(() => {
  // Mise à jour initiale
  updateNavigationData();

  // Écoute des événements
  document.addEventListener('keydown', handleKeyDown);
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
    attributeFilter: ['data-sn-focusable', 'data-sn-section', 'v-focus', 'data-v-focus', 'v-focus-section', 'data-v-focus-section'],
  });

  // Mise à jour périodique pour s'assurer que les données sont à jour
  const interval = setInterval(updateNavigationData, 1000);

  // Nettoyage de l'intervalle lors du démontage
  onUnmounted(() => {
    clearInterval(interval);
  });
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('focusin', handleFocusChange);
  document.removeEventListener('focusout', handleFocusChange);
  
  if (observer) {
    observer.disconnect();
  }
});
</script>
