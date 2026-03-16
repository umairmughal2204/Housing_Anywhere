export type SupportedLanguageCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "nl"
  | "pt"
  | "pl"
  | "tr"
  | "ar"
  | "hi"
  | "ur"
  | "bn"
  | "ru"
  | "id"
  | "fa"
  | "uk"
  | "vi"
  | "th"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko";

export interface LanguageOption {
  label: string;
  code: SupportedLanguageCode;
}

const SOURCE_LANGUAGE = "en";
const STORAGE_KEY = "siteLanguage";
const APPLY_RETRY_COUNT = 20;
const APPLY_RETRY_INTERVAL_MS = 100;
const RTL_LANGUAGES = new Set<SupportedLanguageCode>(["ar", "fa", "ur"]);

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { label: "English", code: "en" },
  { label: "Español", code: "es" },
  { label: "Français", code: "fr" },
  { label: "Deutsch", code: "de" },
  { label: "Italiano", code: "it" },
  { label: "Nederlands", code: "nl" },
  { label: "Português", code: "pt" },
  { label: "Polski", code: "pl" },
  { label: "Türkçe", code: "tr" },
  { label: "العربية", code: "ar" },
  { label: "हिन्दी", code: "hi" },
  { label: "اردو", code: "ur" },
  { label: "বাংলা", code: "bn" },
  { label: "Русский", code: "ru" },
  { label: "Bahasa Indonesia", code: "id" },
  { label: "فارسی", code: "fa" },
  { label: "Українська", code: "uk" },
  { label: "Tiếng Việt", code: "vi" },
  { label: "ไทย", code: "th" },
  { label: "中文", code: "zh-CN" },
  { label: "繁體中文", code: "zh-TW" },
  { label: "日本語", code: "ja" },
  { label: "한국어", code: "ko" },
];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (options: unknown, elementId: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function setGoogleTranslateCookie(targetLanguage: SupportedLanguageCode) {
  const cookieValue = `/${SOURCE_LANGUAGE}/${targetLanguage}`;
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; max-age=31536000`;
}

function setDocumentLanguage(targetLanguage: SupportedLanguageCode) {
  document.documentElement.lang = targetLanguage;
  document.documentElement.dir = RTL_LANGUAGES.has(targetLanguage) ? "rtl" : "ltr";
}

function ensureTranslateMount() {
  if (document.getElementById("google_translate_element")) {
    return;
  }

  const mount = document.createElement("div");
  mount.id = "google_translate_element";
  mount.style.display = "none";
  document.body.appendChild(mount);
}

function loadGoogleTranslateScript() {
  if (document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

function getTranslateCombo() {
  return document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
}

function dispatchNativeChange(select: HTMLSelectElement) {
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function findComboOptionValue(select: HTMLSelectElement, code: SupportedLanguageCode) {
  const direct = [...select.options].find((option) => option.value === code)?.value;
  if (direct) {
    return direct;
  }

  const normalized = code.toLowerCase();
  const caseInsensitive = [...select.options].find((option) => option.value.toLowerCase() === normalized)?.value;
  if (caseInsensitive) {
    return caseInsensitive;
  }

  return null;
}

function applyLanguageToWidget(code: SupportedLanguageCode) {
  const combo = getTranslateCombo();
  if (!combo) {
    return false;
  }

  const optionValue = findComboOptionValue(combo, code);
  if (!optionValue) {
    return false;
  }

  if (combo.value !== optionValue) {
    combo.value = optionValue;
    dispatchNativeChange(combo);
  }

  return true;
}

function applyLanguageWithRetry(code: SupportedLanguageCode) {
  if (applyLanguageToWidget(code)) {
    return;
  }

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;

    if (applyLanguageToWidget(code)) {
      window.clearInterval(interval);
      return;
    }

    if (attempts >= APPLY_RETRY_COUNT) {
      window.clearInterval(interval);

      // Fallback for environments where the hidden Google widget is blocked/delayed.
      window.location.reload();
    }
  }, APPLY_RETRY_INTERVAL_MS);
}

export function getSavedLanguage(): SupportedLanguageCode {
  const value = localStorage.getItem(STORAGE_KEY) as SupportedLanguageCode | null;
  if (!value) {
    return "en";
  }

  return SUPPORTED_LANGUAGES.some((language) => language.code === value) ? value : "en";
}

export function getSavedLanguageLabel() {
  const code = getSavedLanguage();
  return SUPPORTED_LANGUAGES.find((language) => language.code === code)?.label ?? "English";
}

export function initAutoTranslate() {
  const savedLanguage = getSavedLanguage();
  setGoogleTranslateCookie(savedLanguage);
  setDocumentLanguage(savedLanguage);

  ensureTranslateMount();

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) {
      return;
    }

    // Keep Google's translator available, but hidden from the default UI.
    new window.google.translate.TranslateElement(
      {
        pageLanguage: SOURCE_LANGUAGE,
        autoDisplay: false,
        includedLanguages: SUPPORTED_LANGUAGES.map((language) => language.code).join(","),
      },
      "google_translate_element"
    );
  };

  loadGoogleTranslateScript();

  // Apply preferred language without forcing full-page reload when widget becomes available.
  if (savedLanguage !== SOURCE_LANGUAGE) {
    applyLanguageWithRetry(savedLanguage);
  }
}

export function changeSiteLanguage(code: SupportedLanguageCode) {
  const currentLanguage = getSavedLanguage();
  if (currentLanguage === code) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, code);
  setGoogleTranslateCookie(code);
  setDocumentLanguage(code);

  applyLanguageWithRetry(code);
}
