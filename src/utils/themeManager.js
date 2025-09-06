/**
 * Optimized Dynamic Theme Manager
 * Fast theme loading with multiple optimization strategies
 */

import { getStoreDomain } from './misc.js';

// Domain to theme mapping
const domainToTheme = {
  'coolframesstore.myshopify.com': 'coolframes',
  'main.d2dtve1378uo87.amplifyapp.com': 'lenshero-testing', 
  'localhost': 'localhost',
  '127.0.0.1': 'localhost'
};

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
  
  // Use link preload for true preloading (doesn't apply CSS, just fetches)
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'style';
  preloadLink.href = `/themes/${themeName}.css`;
  document.head.appendChild(preloadLink);
  
  console.log(`[OptimizedTheme] Preloaded theme: ${themeName}`);
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
  
  const promise = new Promise((resolve, reject) => {
    // Create stylesheet link (this loads and applies the CSS)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/themes/${themeName}.css`;
    
    // Handle successful load
    link.onload = () => {
      themeCache.set(themeName, true);
      loadingPromises.delete(themeName);
      console.log(`[OptimizedTheme] Loaded theme: ${themeName}`);
      resolve();
    };
    
    // Handle load error
    link.onerror = () => {
      loadingPromises.delete(themeName);
      console.error(`[OptimizedTheme] Failed to load theme: ${themeName}`);
      reject(new Error(`Failed to load theme: ${themeName}`));
    };
    
    // Add to head (non-blocking)
    document.head.appendChild(link);
    
    // Fallback timeout (5 seconds)
    setTimeout(() => {
      if (!themeCache.has(themeName)) {
        loadingPromises.delete(themeName);
        reject(new Error(`Theme load timeout: ${themeName}`));
      }
    }, 5000);
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
      console.log(`[OptimizedTheme] No theme found for domain: ${targetDomain}`);
      return 'default';
    }
    
    const themeClass = `theme-${themeName}`;
    
    // Check if theme is already applied to avoid redundant work
    const widgetElement = document.querySelector('.lenshero-widget');
    if (widgetElement && widgetElement.classList.contains(themeClass)) {
      console.log(`[OptimizedTheme] Theme ${themeClass} already applied`);
      return themeClass;
    }
    
    // Load theme CSS (cached if already loaded)
    await loadThemeCSS(themeName);
    
    // Apply theme class
    document.querySelectorAll('.lenshero-widget').forEach(element => {
      element.className = element.className.replace(/theme-\w+/g, '');
      element.classList.add(themeClass);
    });
    
    console.log(`[OptimizedTheme] Applied theme: ${themeClass} for domain: ${targetDomain}`);
    return themeClass;
    
  } catch (error) {
    console.error('[OptimizedTheme] Failed to apply theme:', error);
    return 'default';
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
  document.querySelectorAll('.lenshero-widget').forEach(element => {
    element.className = element.className.replace(/theme-\w+/g, '');
  });
  console.log('[OptimizedTheme] Theme reset to default');
}

export function getCurrentTheme() {
  const widgetElement = document.querySelector('.lenshero-widget');
  if (!widgetElement) return 'default';
  
  const themeMatch = widgetElement.className.match(/theme-(\w+)/);
  return themeMatch ? `theme-${themeMatch[1]}` : 'default';
}

export default {
  applyStoreTheme,
  resetTheme,
  getCurrentTheme,
  initializeTheme,
  preloadTheme
};
