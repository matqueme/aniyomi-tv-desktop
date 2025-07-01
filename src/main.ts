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
  straightOnly: false,
  straightOverlapThreshold: 0.5,
  rememberSource: true,
  disabled: false,
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
app.mount('#app');
