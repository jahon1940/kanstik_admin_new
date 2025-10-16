"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";

import { ChevronLeft } from "lucide-react";
import ReceiptsContent from "./ReceiptsContent";

export default function ReceiptsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg shadow-black/10 dark:shadow-black/30">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <h1 className="text-base md:text-xl font-semibold truncate">
            {t("app.pos.title")}({name})
          </h1>
        </div>
      </div>
      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4">
          {/* Receipts Tab */}
          <ReceiptsContent />
        </div>
      </div>
    </div>
  );
}
