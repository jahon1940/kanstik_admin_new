"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function WebAppPage() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0 md:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base md:text-xl font-semibold truncate">
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
