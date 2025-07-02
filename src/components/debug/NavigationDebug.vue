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
      <h4 class="mb-1 text-xs font-semibold text-yellow-300">
        📋 Sections ({{ sections.length }})
      </h4>
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
            'text-red-300': !section.isEnabled,
          }"
        >
          {{ section.id }}
          <span v-if="section.isDefault" class="text-yellow-300">(défaut)</span>
          <span v-if="!section.isEnabled" class="text-red-400"
            >(désactivée)</span
          >
          - {{ section.focusableCount }} éléments
        </div>
      </div>
    </div>

    <!-- Éléments focusables -->
    <div class="mt-3 border-t border-slate-600/50 pt-2">
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
  const sectionsMap = new Map<string, SectionInfo>();

  // 1. Chercher les éléments avec data-sn-section (attribut ajouté manuellement)
  const sectionElements = document.querySelectorAll('[data-sn-section]');
  sectionElements.forEach((element) => {
    const sectionId = element.getAttribute('data-sn-section') || 'default';
    const focusableInSection = element.querySelectorAll(
      '[v-focus], [data-v-focus], button, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ).length;
    const isDefault =
      element.hasAttribute('data-sn-default-section') ||
      sectionId === 'default';
    const isEnabled = !element.hasAttribute('data-sn-disabled');

    sectionsMap.set(sectionId, {
      id: sectionId,
      isDefault,
      isEnabled,
      focusableCount: focusableInSection,
    });
  });

  // 2. Chercher les sections par attributs data générés par Vue
  const vueGeneratedSections = document.querySelectorAll(
    '[data-v-focus-section]'
  );
  vueGeneratedSections.forEach((element) => {
    // Essayer de récupérer l'ID de section depuis différents attributs
    let sectionId = '';

    // Méthode 1: Chercher dans les attributs data-v-*
    for (const attr of element.attributes) {
      if (attr.name.includes('focus-section') && attr.name.includes(':')) {
        sectionId = attr.name.split(':')[1] || `section-${Date.now()}`;
        break;
      }
    }

    // Méthode 2: Utiliser data-navbar-id ou similar
    if (!sectionId) {
      sectionId =
        element.getAttribute('data-navbar-id') ||
        element.getAttribute('data-section-id') ||
        element.id ||
        `auto-section-${sectionsMap.size + 1}`;
    }

    // Compter les éléments focusables (plus large sélection)
    const focusableSelectors = [
      '[v-focus]',
      '[data-v-focus]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      'swiper-container',
      '.anime-card',
      '.focusable',
    ];

    const focusableInSection = element.querySelectorAll(
      focusableSelectors.join(', ')
    ).length;

    // Vérifier si c'est une section par défaut
    const isDefault =
      element.hasAttribute('data-v-focus-section-default') ||
      sectionId.includes('trending') ||
      sectionsMap.size === 0;

    const isEnabled = !element.hasAttribute('data-v-disable-focus-section');

    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        id: sectionId,
        isDefault,
        isEnabled,
        focusableCount: focusableInSection,
      });
    }
  });

  // 3. Fallback: sections basées sur la structure du DOM
  if (sectionsMap.size === 0) {
    const potentialSections = document.querySelectorAll(
      'nav, .anime-section, [class*="section"]'
    );
    potentialSections.forEach((element, index) => {
      const sectionId = element.className.includes('navbar')
        ? 'navbar'
        : element.className.includes('anime')
          ? `anime-section-${index}`
          : `section-${index + 1}`;

      const focusableInSection = element.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"]), swiper-container'
      ).length;

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
    attributeFilter: [
      'data-sn-focusable',
      'data-sn-section',
      'v-focus',
      'data-v-focus',
      'v-focus-section',
      'data-v-focus-section',
    ],
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
