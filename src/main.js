import { createApp, h } from "vue";
import LensheroWidget from "./components/LensheroWidget.vue";
import App from "./App.vue";
import "./style.css";
import { initI18n } from "./utils/i18n.js";

// Create a function to initialize the widget
async function initWidget(containerId = "lenshero-widget") {
  // Initialize i18n system first
  await initI18n();
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Create and mount the app
  const app = createApp({
    render() {
      return h(LensheroWidget);
    },
  });

  const instance = app.mount(`#${containerId}`);

  // Make the widget available globally with methods
  window.LensheroWidget = {
    init: initWidget,
    setProductOrderKey: (key) => {
      instance.setProductOrderKey(key);
    },
  };
}

// Check if we're in development mode (has #app element)
if (document.getElementById("app")) {
  // Development mode - mount the full app
  createApp(App).mount("#app");
} else {
  // Widget mode - initialize the widget
  if (typeof window !== "undefined") {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => initWidget());
    } else {
      initWidget();
    }
  }

  // Make the widget available globally
  window.LensheroWidget = {
    init: initWidget,
  };
}
