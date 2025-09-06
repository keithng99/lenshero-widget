/**
 * Optimized Dynamic Theme Manager
 * Fast theme loading with multiple optimization strategies
 */

import { getStoreDomain } from "./misc.js";

// Domain to theme mapping
const domainToTheme = {
  "coolframesstore.myshopify.com": "coolframes",
  "main.d2dtve1378uo87.amplifyapp.com": "lenshero-testing",
  "localhost": "localhost",
  "127.0.0.1": "localhost",
};

// Default theme for unknown domains
const DEFAULT_THEME = "coolframes"; // Use coolframes as default

// Cache for loaded themes
const themeCache = new Map();
const loadingPromises = new Map();

/**
 * Preload theme CSS (call this early in app lifecycle)
 * @param {string} domain - Domain to preload theme for
 */
export function preloadTheme(domain) {
  const themeName = domainToTheme[domain];
  if (!themeName || themeCache.has(themeName)) return;

  // For bundled themes, preloading is not needed since CSS is already in bundle
  // Just start loading the theme
  loadThemeCSS(themeName);
  
  console.log(`Preloaded theme: ${themeName}`);
}

/**
 * Load theme CSS with optimizations
 */
function loadThemeCSS(themeName) {
  // Return cached promise if already loading
  if (loadingPromises.has(themeName)) {
    return loadingPromises.get(themeName);
  }

  // Return immediately if already loaded
  if (themeCache.has(themeName)) {
    return Promise.resolve();
  }

  const promise = new Promise(async (resolve, reject) => {
    try {
      // Import theme CSS at build time (bundled approach)
      const themeModule = await import(`../themes/${themeName}.css?inline`);
      
      // Create style element and inject CSS
      const styleElement = document.createElement('style');
      styleElement.id = `lenshero-theme-${themeName}`;
      styleElement.textContent = themeModule.default;
      document.head.appendChild(styleElement);
      
      themeCache.set(themeName, true);
      loadingPromises.delete(themeName);
      console.log(`Loaded theme: ${themeName}`);
      resolve();
      
    } catch (error) {
      loadingPromises.delete(themeName);
      console.error(`Failed to load theme: ${themeName}`, error);
      reject(new Error(`Failed to load theme: ${themeName}`));
    }
  });

  loadingPromises.set(themeName, promise);
  return promise;
}

/**
 * Apply store theme with optimizations
 */
export async function applyStoreTheme(domain = null) {
  try {
    const targetDomain = domain || getStoreDomain();
    const themeName = domainToTheme[targetDomain];

    if (!themeName) {
      console.warn(
        `No theme found for domain: ${targetDomain}`
      );
      return "default";
    }

    const themeClass = `theme-${themeName}`;

    // Check if theme is already applied to avoid redundant work
    const widgetElement = document.querySelector(".lenshero-widget");
    if (widgetElement && widgetElement.classList.contains(themeClass)) {
      return themeClass;
    }

    // Load theme CSS (cached if already loaded)
    await loadThemeCSS(themeName);

    // Apply theme class
    document.querySelectorAll(".lenshero-widget").forEach((element) => {
      element.className = element.className.replace(/theme-\w+/g, "");
      element.classList.add(themeClass);
    });

    return themeClass;
  } catch (error) {
    console.error("Failed to apply theme:", error);
    return "default";
  }
}

/**
 * Initialize theme system
 */
export async function initializeTheme(domain = null) {
  // Just apply theme (preloading is handled internally)
  return await applyStoreTheme(domain);
}

export function resetTheme() {
  // Remove bundled theme styles
  document.querySelectorAll('[id^="lenshero-theme-"]').forEach(el => el.remove());
  
  // Remove theme classes
  document.querySelectorAll(".lenshero-widget").forEach((element) => {
    element.className = element.className.replace(/theme-\w+/g, "");
  });
  
  console.log('Theme reset to default');
}

export function getCurrentTheme() {
  const widgetElement = document.querySelector(".lenshero-widget");
  if (!widgetElement) return "default";

  const themeMatch = widgetElement.className.match(/theme-(\w+)/);
  return themeMatch ? `theme-${themeMatch[1]}` : "default";
}

export default {
  applyStoreTheme,
  resetTheme,
  getCurrentTheme,
  initializeTheme,
  preloadTheme,
};
