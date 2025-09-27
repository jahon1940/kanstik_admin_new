"use client";

import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { getI18n } from "@/lib/i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
  const i18n = getI18n();

  // Ensure html lang attribute matches current language
  useEffect(() => {
    const current =
      i18n.language || i18n.options.fallbackLng?.toString() || "uz";
    if (typeof document !== "undefined") {
      document.documentElement.lang = current;
    }
  }, [i18n.language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

