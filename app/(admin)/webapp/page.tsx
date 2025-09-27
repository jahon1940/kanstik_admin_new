"use client";
import { useTranslation } from "react-i18next";

export default function WebAppPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("app.webapp.title")}</h1>
      <div className="rounded-lg border p-4 bg-card">Website & App content</div>
    </div>
  );
}
