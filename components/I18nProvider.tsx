"use client";

import { useEffect } from "react";
import "@/lib/i18n";
import i18n from "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Set html lang attribute
    const current =
      i18n.language || i18n.options.fallbackLng?.toString() || "ru";
    if (typeof document !== "undefined") {
      document.documentElement.lang = current;
    }
  }, []);

  return <>{children}</>;
}
