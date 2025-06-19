import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';

import './assets/style.css';
import App from './App.vue';
import { tizenTV } from './utils/tizen';

// Initialize Tizen TV features
document.addEventListener('DOMContentLoaded', (): void => {
  tizenTV.init();
});

// Create and mount Vue app
const pinia = createPinia();
const i18n = createI18n({
  legacy: false,
  locale: 'en',
});
const router = createRouter({
  history: createWebHistory(),
  routes: [],
});
const app = createApp(App);

// Make Tizen utilities available globally
app.config.globalProperties.$tizen = tizenTV;

app.use(pinia);
app.use(i18n);
app.use(router);
app.mount('#app');
