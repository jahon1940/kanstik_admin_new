"use client";
import LanguageSelect from "@/components/LanguageSelect";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg shadow-black/10 dark:shadow-black/30">
        <h1 className="text-lg md:text-xl font-semibold">{t("nav.setting")}</h1>
      </div>

      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30 p-4 md:p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-base md:text-lg font-medium mb-3">
              {t("settings.language")}
            </h2>
            <LanguageSelect />
          </div>

          {/* Additional settings can be added here */}
          <div className="border-t pt-6">
            <h2 className="text-base md:text-lg font-medium mb-3">
              {t("settings.appearance")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("settings.appearance_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
