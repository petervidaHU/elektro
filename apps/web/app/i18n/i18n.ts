import { createInstance, type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@elektro/shared";
import { defaultNS, resources } from "./resources";

/**
 * Creates an i18next instance for one locale.
 *
 * A fresh instance per server request (and one per browser session) keeps
 * requests for different locales from overwriting each other's language.
 */
export function createI18n(locale: Locale = DEFAULT_LOCALE): I18n {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    defaultNS,
    ns: [defaultNS],
    resources,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  return instance;
}
