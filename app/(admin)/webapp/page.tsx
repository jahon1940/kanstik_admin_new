"use client";
import { useTranslation } from "react-i18next";

export default function WebAppPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg">
        <h1 className="text-lg md:text-xl font-semibold">
          {t("app.webapp.title")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6">
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground text-sm md:text-base">Скоро...</p>
        </div>
      </div>
    </div>
  );
}
