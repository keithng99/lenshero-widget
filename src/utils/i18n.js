/**
 * Internationalization (i18n) utility for the LensHero widget
 */

import { ref, reactive } from 'vue';
import { detectLanguage, setCurrentLanguage, SUPPORTED_LANGUAGES } from './language.js';

// Global state for current language and translations
const currentLanguage = ref(detectLanguage());
const translations = reactive({});

// Cache for loaded translations
const translationCache = new Map();

// Embedded translations - all languages bundled
const EMBEDDED_TRANSLATIONS = {
  en: {
    "widget": {
      "heading": "Prescription Glasses",
      "description": "Add prescription glasses by uploading your prescription and choosing glasses",
      "button": "Upload"
    },
    "modal": {
      "close": "Close",
      "loading": "Uploading your prescription"
    },
    "upload": {
      "title": "Upload Prescription",
      "description": "Upload your prescription to get personalized lens recommendations",
      "drag_drop": "Drag and drop your prescription here, or click to select",
      "supported_formats": "Supported formats: JPG, PNG, PDF, HEIC",
      "upload_button": "Upload Prescription",
      "next_button": "Next",
      "remove_button": "Remove",
      "preview_title": "Prescription Preview",
      "manual_entry": "Enter prescription manually",
      "manual_entry_button": "Manual Entry",
      "back_to_upload": "Back to Upload",
      "file_size_error": "File is too large. Please choose a smaller file.",
      "file_type_error": "Invalid file format. Please upload a valid prescription.",
      "heic_conversion_error": "Failed to convert HEIC file. Please try a different format.",
      "upload_error": "Failed to upload prescription. Please try again.",
      "processing_error": "Failed to process prescription. Please try again.",
      "pdf_document": "PDF Document"
    },
    "lens_type": {
      "title": "Lens Type",
      "description_with_file": "Based on your prescription, choose the type of lenses you need.",
      "description_without_file": "Choose the type of lenses you need.",
      "standard": {
        "title": "Standard Lenses",
        "description": "Single vision lenses for distance or reading",
        "features": [
          "Clear vision at one distance",
          "Most affordable option",
          "Perfect for distance or reading"
        ]
      },
      "progressive": {
        "title": "Progressive Lenses",
        "description": "Multifocal lenses for all distances",
        "price": "+500 SEK",
        "features": [
          "Clear vision at all distances",
          "No visible line between zones",
          "Ideal for presbyopia"
        ]
      },
      "back_button": "Back",
      "next_button": "Next"
    },
    "features": {
      "title": "Lens Features",
      "description": "Choose the types of lens features you want",
      "back_button": "Back",
      "submit_button": "Submit",
      "terms_notice": "By submitting, I confirm that I've read and understand the",
      "terms_link": "Terms and Conditions",
      "tooltip_text": "Ensure to upload a clear prescription image before you submit",
      "submit_error": "Failed to submit order. Please try again."
    },
    "errors": {
      "upload_failed": "Failed to upload prescription. Please try again.",
      "invalid_format": "Invalid file format. Please upload a valid prescription.",
      "file_too_large": "File is too large. Please choose a smaller file.",
      "network_error": "Network error. Please check your connection.",
      "generic_error": "An error occurred. Please try again."
    },
    "powered_by": {
      "text": "Powered by LensHero"
    },
    "prescription": {
      "title": "Detected Prescription Values",
      "right_eye": "Right Eye (OD)",
      "left_eye": "Left Eye (OS)",
      "sphere": "Sphere (SPH)",
      "cylinder": "Cylinder (CYL)",
      "axis": "Axis",
      "add1": "ADD1",
      "add2": "ADD2",
      "select": "Select...",
      "update_button": "Update Values"
    }
  },
  sv: {
    "widget": {
      "heading": "Receptglas",
      "description": "Lägg till receptglas genom att ladda upp ditt synrecept och välja glas",
      "button": "Ladda upp"
    },
    "modal": {
      "close": "Stäng",
      "loading": "Laddar upp ditt recept"
    },
    "upload": {
      "title": "Ladda upp recept",
      "description": "Ladda upp ditt recept för att få personliga linsrekommendationer",
      "drag_drop": "Dra och släpp ditt recept här, eller klicka för att välja",
      "supported_formats": "Stödda format: JPG, PNG, PDF, HEIC",
      "upload_button": "Ladda upp recept",
      "next_button": "Nästa",
      "remove_button": "Ta bort",
      "preview_title": "Recept förhandsvisning",
      "manual_entry": "Ange recept manuellt",
      "manual_entry_button": "Manuell inmatning",
      "back_to_upload": "Tillbaka till uppladdning",
      "file_size_error": "Filen är för stor. Välj en mindre fil.",
      "file_type_error": "Ogiltigt filformat. Ladda upp ett giltigt recept.",
      "heic_conversion_error": "Misslyckades att konvertera HEIC-fil. Försök med ett annat format.",
      "upload_error": "Misslyckades att ladda upp recept. Försök igen.",
      "processing_error": "Misslyckades att bearbeta recept. Försök igen.",
      "pdf_document": "PDF-dokument"
    },
    "lens_type": {
      "title": "Linstyp",
      "description_with_file": "Baserat på ditt recept, välj vilken typ av linser du behöver.",
      "description_without_file": "Välj vilken typ av linser du behöver.",
      "standard": {
        "title": "Standardlinser",
        "description": "Enkelsynslinser för avstånd eller läsning",
        "features": [
          "Tydlig syn på ett avstånd",
          "Mest prisvärda alternativet",
          "Perfekt för avstånd eller läsning"
        ]
      },
      "progressive": {
        "title": "Progressiva linser",
        "description": "Multifokala linser för alla avstånd",
        "price": "+500 SEK",
        "features": [
          "Tydlig syn på alla avstånd",
          "Ingen synlig linje mellan zoner",
          "Idealt för presbyopi"
        ]
      },
      "back_button": "Tillbaka",
      "next_button": "Nästa"
    },
    "features": {
      "title": "Linsfunktioner",
      "description": "Välj vilka typer av linsfunktioner du vill ha",
      "back_button": "Tillbaka",
      "submit_button": "Skicka",
      "terms_notice": "Genom att skicka bekräftar jag att jag har läst och förstår",
      "terms_link": "Villkor och bestämmelser",
      "tooltip_text": "Se till att ladda upp en tydlig receptbild innan du skickar",
      "submit_error": "Misslyckades att skicka beställning. Försök igen."
    },
    "errors": {
      "upload_failed": "Misslyckades att ladda upp recept. Försök igen.",
      "invalid_format": "Ogiltigt filformat. Ladda upp ett giltigt recept.",
      "file_too_large": "Filen är för stor. Välj en mindre fil.",
      "network_error": "Nätverksfel. Kontrollera din anslutning.",
      "generic_error": "Ett fel uppstod. Försök igen."
    },
    "powered_by": {
      "text": "Driven av LensHero"
    },
    "prescription": {
      "title": "Upptäckta receptvärden",
      "right_eye": "Höger öga (OD)",
      "left_eye": "Vänster öga (OS)",
      "sphere": "Sfär (SPH)",
      "cylinder": "Cylinder (CYL)",
      "axis": "Axel",
      "add1": "ADD1",
      "add2": "ADD2",
      "select": "Välj...",
      "update_button": "Uppdatera värden"
    }
  },
  de: {
    "widget": {
      "button": "Rezeptbrille",
      "button_short": "Brille"
    },
    "modal": {
      "close": "Schließen",
      "loading": "Ihr Rezept wird hochgeladen"
    },
    "upload": {
      "title": "Rezept hochladen",
      "description": "Laden Sie Ihr Rezept hoch, um personalisierte Linseneempfehlungen zu erhalten",
      "drag_drop": "Ziehen Sie Ihr Rezept hierher oder klicken Sie zum Auswählen",
      "supported_formats": "Unterstützte Formate: JPG, PNG, PDF, HEIC",
      "upload_button": "Rezept hochladen",
      "remove_button": "Entfernen",
      "preview_title": "Rezept-Vorschau",
      "manual_entry": "Rezept manuell eingeben",
      "manual_entry_button": "Manuelle Eingabe",
      "back_to_upload": "Zurück zum Upload"
    },
    "lens_type": {
      "title": "Linsentyp",
      "description_with_file": "Basierend auf Ihrem Rezept wählen Sie die Art der Linsen, die Sie benötigen.",
      "description_without_file": "Wählen Sie die Art der Linsen, die Sie benötigen.",
      "standard": {
        "title": "Standardlinsen",
        "description": "Einstärkenlinsen für Fern- oder Nahsicht",
        "features": [
          "Klares Sehen in einer Entfernung",
          "Günstigste Option",
          "Perfekt für Fern- oder Nahsicht"
        ]
      },
      "progressive": {
        "title": "Gleitsichtlinsen",
        "description": "Multifokale Linsen für alle Entfernungen",
        "price": "+500 SEK",
        "features": [
          "Klares Sehen in allen Entfernungen",
          "Keine sichtbare Linie zwischen den Zonen",
          "Ideal für Presbyopie"
        ]
      },
      "back_button": "Zurück",
      "next_button": "Weiter"
    },
    "features": {
      "title": "Linsenfunktionen",
      "description": "Passen Sie Ihre Linsen mit zusätzlichen Funktionen an",
      "back_button": "Zurück",
      "submit_button": "Bestellung abschicken"
    },
    "errors": {
      "upload_failed": "Rezept konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
      "invalid_format": "Ungültiges Dateiformat. Bitte laden Sie ein gültiges Rezept hoch.",
      "file_too_large": "Datei ist zu groß. Bitte wählen Sie eine kleinere Datei.",
      "network_error": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      "generic_error": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
    },
    "powered_by": {
      "text": "Unterstützt von LensHero"
    }
  },
  fr: {
    "widget": {
      "button": "Lunettes sur ordonnance",
      "button_short": "Lunettes"
    },
    "modal": {
      "close": "Fermer",
      "loading": "Téléchargement de votre ordonnance"
    },
    "upload": {
      "title": "Télécharger l'ordonnance",
      "description": "Téléchargez votre ordonnance pour obtenir des recommandations de lentilles personnalisées",
      "drag_drop": "Glissez-déposez votre ordonnance ici, ou cliquez pour sélectionner",
      "supported_formats": "Formats supportés : JPG, PNG, PDF, HEIC",
      "upload_button": "Télécharger l'ordonnance",
      "remove_button": "Supprimer",
      "preview_title": "Aperçu de l'ordonnance",
      "manual_entry": "Saisir l'ordonnance manuellement",
      "manual_entry_button": "Saisie manuelle",
      "back_to_upload": "Retour au téléchargement"
    },
    "lens_type": {
      "title": "Type de lentilles",
      "description_with_file": "Basé sur votre ordonnance, choisissez le type de lentilles dont vous avez besoin.",
      "description_without_file": "Choisissez le type de lentilles dont vous avez besoin.",
      "standard": {
        "title": "Lentilles standard",
        "description": "Lentilles unifocales pour la vision de loin ou de près",
        "features": [
          "Vision claire à une distance",
          "Option la plus abordable",
          "Parfait pour la vision de loin ou de près"
        ]
      },
      "progressive": {
        "title": "Lentilles progressives",
        "description": "Lentilles multifocales pour toutes les distances",
        "price": "+500 SEK",
        "features": [
          "Vision claire à toutes les distances",
          "Aucune ligne visible entre les zones",
          "Idéal pour la presbytie"
        ]
      },
      "back_button": "Retour",
      "next_button": "Suivant"
    },
    "features": {
      "title": "Fonctionnalités des lentilles",
      "description": "Personnalisez vos lentilles avec des fonctionnalités supplémentaires",
      "back_button": "Retour",
      "submit_button": "Soumettre la commande"
    },
    "errors": {
      "upload_failed": "Échec du téléchargement de l'ordonnance. Veuillez réessayer.",
      "invalid_format": "Format de fichier invalide. Veuillez télécharger une ordonnance valide.",
      "file_too_large": "Le fichier est trop volumineux. Veuillez choisir un fichier plus petit.",
      "network_error": "Erreur réseau. Veuillez vérifier votre connexion.",
      "generic_error": "Une erreur s'est produite. Veuillez réessayer."
    },
    "powered_by": {
      "text": "Propulsé par LensHero"
    }
  },
  es: {
    "widget": {
      "button": "Gafas con receta",
      "button_short": "Gafas"
    },
    "modal": {
      "close": "Cerrar",
      "loading": "Subiendo tu receta"
    },
    "upload": {
      "title": "Subir receta",
      "description": "Sube tu receta para obtener recomendaciones de lentes personalizadas",
      "drag_drop": "Arrastra y suelta tu receta aquí, o haz clic para seleccionar",
      "supported_formats": "Formatos soportados: JPG, PNG, PDF, HEIC",
      "upload_button": "Subir receta",
      "remove_button": "Eliminar",
      "preview_title": "Vista previa de la receta",
      "manual_entry": "Introducir receta manualmente",
      "manual_entry_button": "Entrada manual",
      "back_to_upload": "Volver a subir"
    },
    "lens_type": {
      "title": "Tipo de lentes",
      "description_with_file": "Basado en tu receta, elige el tipo de lentes que necesitas.",
      "description_without_file": "Elige el tipo de lentes que necesitas.",
      "standard": {
        "title": "Lentes estándar",
        "description": "Lentes monofocales para visión lejana o de cerca",
        "features": [
          "Visión clara a una distancia",
          "Opción más económica",
          "Perfecto para visión lejana o de cerca"
        ]
      },
      "progressive": {
        "title": "Lentes progresivas",
        "description": "Lentes multifocales para todas las distancias",
        "price": "+500 SEK",
        "features": [
          "Visión clara a todas las distancias",
          "Sin línea visible entre zonas",
          "Ideal para presbicia"
        ]
      },
      "back_button": "Atrás",
      "next_button": "Siguiente"
    },
    "features": {
      "title": "Características de las lentes",
      "description": "Personaliza tus lentes con características adicionales",
      "back_button": "Atrás",
      "submit_button": "Enviar pedido"
    },
    "errors": {
      "upload_failed": "Error al subir la receta. Por favor, inténtalo de nuevo.",
      "invalid_format": "Formato de archivo inválido. Por favor, sube una receta válida.",
      "file_too_large": "El archivo es demasiado grande. Por favor, elige un archivo más pequeño.",
      "network_error": "Error de red. Por favor, verifica tu conexión.",
      "generic_error": "Ocurrió un error. Por favor, inténtalo de nuevo."
    },
    "powered_by": {
      "text": "Desarrollado por LensHero"
    }
  }
};

/**
 * Load translations for a specific language
 * @param {string} langCode - Language code
 * @returns {Promise<Object>} Translations object
 */
async function loadTranslations(langCode) {
  if (translationCache.has(langCode)) {
    return translationCache.get(langCode);
  }

  // Use embedded translations
  const translations = EMBEDDED_TRANSLATIONS[langCode] || EMBEDDED_TRANSLATIONS['en'];
  translationCache.set(langCode, translations);
  return translations;
}

/**
 * Initialize i18n system
 * @param {string} langCode - Initial language code
 */
export async function initI18n(langCode = null) {
  const targetLang = langCode || detectLanguage();
  
  if (!SUPPORTED_LANGUAGES[targetLang]) {
    console.warn(`Unsupported language: ${targetLang}, falling back to English`);
    currentLanguage.value = 'en';
  } else {
    currentLanguage.value = targetLang;
  }
  
  // Load translations for the target language
  const loadedTranslations = await loadTranslations(currentLanguage.value);
  Object.assign(translations, loadedTranslations);
}

/**
 * Change language
 * @param {string} langCode - New language code
 */
export async function changeLanguage(langCode) {
  if (!SUPPORTED_LANGUAGES[langCode]) {
    console.warn(`Unsupported language: ${langCode}`);
    return false;
  }
  
  try {
    // Load new translations
    const newTranslations = await loadTranslations(langCode);
    
    // Update state
    currentLanguage.value = langCode;
    Object.assign(translations, newTranslations);
    
    // Save to localStorage
    setCurrentLanguage(langCode);
    
    return true;
  } catch (error) {
    console.error(`Failed to change language to ${langCode}:`, error);
    return false;
  }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (dot notation supported)
 * @param {Object} params - Parameters for interpolation
 * @returns {string} Translated text
 */
export function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as fallback
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  // Simple parameter interpolation
  return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLang() {
  return currentLanguage.value;
}

/**
 * Get supported languages
 * @returns {Object} Supported languages object
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Check if a language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if supported
 */
export function isLanguageSupported(langCode) {
  return langCode in SUPPORTED_LANGUAGES;
}

// Export reactive references for Vue components
export { currentLanguage, translations };
