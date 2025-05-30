import { createApp, h } from "vue";
// import Widget from "./components/Widget.vue";
import LensheroWidget from "./components/LensheroWidget.vue";
import App from "./App.vue";
import "./style.css";

// Create a function to initialize the widget
function initWidget(containerId = "lenshero-widget") {
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

  app.mount(`#${containerId}`);
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
  window.VueWidget = {
    init: initWidget,
  };
}
