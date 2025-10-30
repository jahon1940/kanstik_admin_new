"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import SiteIcon from "@/components/icons/site";

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

      <div className="rounded-lg bg-card shadow-lg">
        <div className="overflow-auto h-[calc(100vh-9.5rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <SiteIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">
              {t("common.coming_soon")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
