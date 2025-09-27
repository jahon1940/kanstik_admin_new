"use client";

import i18next, { i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

let initialized = false;

export const supportedLanguages = ["uz", "ru"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export function getI18n(): I18nInstance {
  if (!initialized) {
    i18next
      .use(HttpBackend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: "uz",
        supportedLngs: supportedLanguages as unknown as string[],
        ns: ["common"],
        defaultNS: "common",
        load: "languageOnly",
        interpolation: { escapeValue: false },
        detection: {
          order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
          caches: ["cookie", "localStorage"],
          lookupQuerystring: "lng",
          cookieMinutes: 365 * 24 * 60,
        },
        backend: {
          loadPath: "/language/{{lng}}/{{ns}}.json",
        },
        react: {
          useSuspense: false,
        },
      });
    initialized = true;
  }
  return i18next;
}



