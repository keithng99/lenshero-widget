/**
 * Language detection and internationalization utilities
 */

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  fi: 'Suomi'
};

// Default language fallback
export const DEFAULT_LANGUAGE = 'en';

/**
 * Detect language from the host website
 * @returns {string} Language code
 */
export function detectLanguage() {
  try {
    // Method 1: Check document.documentElement.lang
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const langCode = htmlLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[langCode]) {
        return langCode;
      }
    }

    // Method 2: Check meta tag
    const metaLang = document.querySelector('meta[http-equiv="content-language"]')?.content ||
                    document.querySelector('meta[name="language"]')?.content;
    if (metaLang) {
      const langCode = metaLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[langCode]) {
        return langCode;
      }
    }

    // Method 3: Check navigator.language
    const browserLang = navigator.language || navigator.languages?.[0];
    if (browserLang) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES[langCode]) {
        return langCode;
      }
    }

    // Method 4: Check URL path for language indicators
    const pathname = window.location.pathname;
    const pathLangMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    if (pathLangMatch) {
      const langCode = pathLangMatch[1].toLowerCase();
      if (SUPPORTED_LANGUAGES[langCode]) {
        return langCode;
      }
    }

    // Method 5: Check for common Swedish/Nordic indicators
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    if (bodyText.includes('receptglas') || bodyText.includes('glasögon') || 
        bodyText.includes('synundersökning') || bodyText.includes('ögonoptiker')) {
      return 'sv';
    }

    // Method 6: Check for German indicators
    if (bodyText.includes('brille') || bodyText.includes('sehtest') || 
        bodyText.includes('augenoptiker') || bodyText.includes('sehkraft')) {
      return 'de';
    }

    // Method 7: Check for French indicators
    if (bodyText.includes('lunettes') || bodyText.includes('verres') || 
        bodyText.includes('opticien') || bodyText.includes('vue')) {
      return 'fr';
    }

    // Method 8: Check for Spanish indicators
    if (bodyText.includes('gafas') || bodyText.includes('lentes') || 
        bodyText.includes('óptica') || bodyText.includes('vista')) {
      return 'es';
    }

    // Method 9: Check for Italian indicators
    if (bodyText.includes('occhiali') || bodyText.includes('lenti') || 
        bodyText.includes('ottico') || bodyText.includes('vista')) {
      return 'it';
    }

    // Method 10: Check for Dutch indicators
    if (bodyText.includes('bril') || bodyText.includes('lenzen') || 
        bodyText.includes('opticien') || bodyText.includes('zicht')) {
      return 'nl';
    }

    // Method 11: Check for Norwegian indicators
    if (bodyText.includes('briller') || bodyText.includes('synundersøkelse') || 
        bodyText.includes('optiker') || bodyText.includes('syn')) {
      return 'no';
    }

    // Method 12: Check for Danish indicators
    if (bodyText.includes('briller') || bodyText.includes('synstest') || 
        bodyText.includes('optiker') || bodyText.includes('syn')) {
      return 'da';
    }

    // Method 13: Check for Finnish indicators
    if (bodyText.includes('silmälasit') || bodyText.includes('linssit') || 
        bodyText.includes('optikko') || bodyText.includes('näkö')) {
      return 'fi';
    }

  } catch (error) {
    console.warn('Language detection failed:', error);
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get current language from localStorage or detect it
 * @returns {string} Language code
 */
export function getCurrentLanguage() {
  try {
    const stored = localStorage.getItem('lenshero-language');
    if (stored && SUPPORTED_LANGUAGES[stored]) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  
  return detectLanguage();
}

/**
 * Set current language
 * @param {string} langCode - Language code
 */
export function setCurrentLanguage(langCode) {
  if (SUPPORTED_LANGUAGES[langCode]) {
    try {
      localStorage.setItem('lenshero-language', langCode);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }
}

/**
 * Get language direction (LTR/RTL)
 * @param {string} langCode - Language code
 * @returns {string} 'ltr' or 'rtl'
 */
export function getLanguageDirection(langCode) {
  // Most languages are LTR, add RTL languages here if needed
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
}
