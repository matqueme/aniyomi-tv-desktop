import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

// Test rapide du système de navigation
import { useNavigationStore } from './stores/navigation';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Test de débogage - afficher l'état de navigation dans la console
if (import.meta.env.DEV) {
  const navigationStore = useNavigationStore();

  // Logger l'état toutes les 5 secondes en mode développement
  setInterval(() => {
    if (navigationStore.totalLists > 0) {
      console.group('🎮 État Navigation TV');
      navigationStore.logNavigationState();
      console.groupEnd();
    }
  }, 5000);
}

app.mount('#app');
