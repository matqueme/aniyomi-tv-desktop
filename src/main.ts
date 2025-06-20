import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import router from '@/router';

import './style.css';
import App from '@/App.vue';

// Initialize Tizen TV features
document.addEventListener('DOMContentLoaded', (): void => {});

const i18n = createI18n({
  legacy: false,
  locale: 'fr', // Changé en français
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(i18n);
app.use(router);
app.mount('#app');
