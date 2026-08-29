import { en } from './en';
import { es } from './es';

export type Language = 'en' | 'es';
export type Translations = typeof en;

const translations: Record<Language, Translations> = { en, es };

let currentLang: Language = (localStorage.getItem('sharedom_lang') as Language) || 'en';

if (typeof document !== 'undefined') {
  document.title = translations[currentLang].metaTitle;
  document.documentElement.lang = currentLang;
}

type Listener = (lang: Language, t: Translations) => void;
const listeners = new Set<Listener>();

export function getLanguage(): Language {
  return currentLang;
}

export function getT(): Translations {
  return translations[currentLang];
}

export function setLanguage(lang: Language): void {
  currentLang = lang;
  localStorage.setItem('sharedom_lang', lang);
  document.documentElement.lang = lang;
  document.title = translations[currentLang].metaTitle;
  listeners.forEach((listener) => listener(currentLang, translations[currentLang]));
}

export function onLanguageChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
