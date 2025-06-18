import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { tizenTV } from "./utils/tizen.js";

// Initialize Tizen TV features
document.addEventListener("DOMContentLoaded", () => {
  tizenTV.init();
});

// Create and mount Vue app
const app = createApp(App);

// Make Tizen utilities available globally
app.config.globalProperties.$tizen = tizenTV;

app.mount("#app");
