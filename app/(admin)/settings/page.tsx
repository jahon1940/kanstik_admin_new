"use client";
import LanguageSelect from "@/components/LanguageSelect";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16">
        <h1 className="text-xl font-semibold">Настройки</h1>
      </div>
      <div className="rounded-lg p-4 bg-card">
        <LanguageSelect />
      </div>
    </div>
  );
}
