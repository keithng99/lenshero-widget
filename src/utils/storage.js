/**
 * Storage utility functions for the LensHero widget
 */

const STORAGE_KEYS = {
  LENS_HERO_ORDER_KEY: "lensHeroOrderKey",
  PRICING_CACHE: "lensheroPricingCache",
};

/**
 * Get item from session storage
 * @param {string} key - Storage key
 * @returns {string|null} The stored value or null
 */
export function getSessionItem(key) {
  return sessionStorage.getItem(key);
}

/**
 * Set item in session storage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 */
export function setSessionItem(key, value) {
  sessionStorage.setItem(key, value);
}

/**
 * Remove item from session storage
 * @param {string} key - Storage key
 */
export function removeSessionItem(key) {
  sessionStorage.removeItem(key);
}

/**
 * Get cached pricing data
 * @returns {Object|null} Cached pricing data or null
 */
export function getCachedPricing() {
  const cachedData = getSessionItem(STORAGE_KEYS.PRICING_CACHE);
  if (!cachedData) return null;

  try {
    const parsed = JSON.parse(cachedData);
    const now = Date.now();

    // Check if cache is still valid (24 hours)
    if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
      return parsed.data;
    }
  } catch (error) {
    console.warn("Failed to parse cached pricing data:", error);
  }

  return null;
}

/**
 * Cache pricing data
 * @param {Object} data - Pricing data to cache
 */
export function cachePricing(data) {
  const cacheData = {
    data,
    timestamp: Date.now(),
  };
  setSessionItem(STORAGE_KEYS.PRICING_CACHE, JSON.stringify(cacheData));
}

/**
 * Get lens hero order key
 * @returns {string|null} The order key or null
 */
export function getLensHeroOrderKey() {
  return getSessionItem(STORAGE_KEYS.LENS_HERO_ORDER_KEY);
}

/**
 * Set lens hero order key
 * @param {string} orderKey - The order key
 */
export function setLensHeroOrderKey(orderKey) {
  setSessionItem(STORAGE_KEYS.LENS_HERO_ORDER_KEY, orderKey);
}

export { STORAGE_KEYS };
