"use client";
import { useTranslation } from "react-i18next";

export default function ReportsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("app.reports.title")}</h1>
      <div className="rounded-lg border p-4 bg-card">Reports content</div>
    </div>
  );
}
