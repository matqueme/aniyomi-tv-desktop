import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';

import './style.css';
import App from './App.vue';
import { tizenTV } from './utils/tizen';

// Initialize Tizen TV features
document.addEventListener('DOMContentLoaded', (): void => {
  tizenTV.init();
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
});
const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

const pinia = createPinia();
const app = createApp(App);

// Make Tizen utilities available globally
app.config.globalProperties.$tizen = tizenTV;

app.use(pinia);
app.use(i18n);
app.use(router);
app.mount('#app');
