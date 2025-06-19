import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { tizenTV } from "./utils/tizen";

// Initialize Tizen TV features
document.addEventListener("DOMContentLoaded", (): void => {
  tizenTV.init();
});

// Create and mount Vue app
const pinia = createPinia();
const app = createApp(App);

// Make Tizen utilities available globally
app.config.globalProperties.$tizen = tizenTV;

app.use(pinia);
app.mount("#app");
