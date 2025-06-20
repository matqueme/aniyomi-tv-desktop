import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import router from '@/router';

import './style.css';
import App from '@/App.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(i18n);
app.use(router);
app.mount('#app');
