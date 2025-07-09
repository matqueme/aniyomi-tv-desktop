import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import vueSpatialNavigation from 'vue-spatial-nav';
import { register } from 'swiper/element/bundle';
import router from '@/router';

// Register Swiper custom elements
register();

import './style.css';
import App from '@/App.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
});

// Configuration pour la navigation TV
const spatialNavConfig = {
  straightOnly: true,
  straightOverlapThreshold: 0.8,
  rememberSource: false,
  disabled: false,
  defaultElement: '',
  enterTo: '',
  leaveFor: undefined,
  restrict: 'self-first' as const,
  tabIndexIgnoreList:
    'a, input, select, textarea, button, iframe, [contentEditable=true]',
  navigableFilter: undefined,
  scrollOptions: {
    behavior: 'smooth' as const,
    block: 'center' as const,
  },
};

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(i18n);
app.use(router);
app.use(vueSpatialNavigation, spatialNavConfig);

// Initialiser les extensions au démarrage
(async () => {
  try {
    const { useExtensionsStore } = await import('@/stores/extensions');
    const extensionsStore = useExtensionsStore();
    await extensionsStore.initializeExtensions();
  } catch (error) {
    console.error("Erreur lors de l'initialisation des extensions:", error);
  }
})();

app.mount('#app');
