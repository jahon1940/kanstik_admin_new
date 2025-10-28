"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import Link from "next/link";
import ArrowIcon from "@/components/icons/arrow";

export default function ReportsPage() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg">
        <h1 className="text-base md:text-xl font-semibold truncate">
          {t("app.reports.title")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="space-y-4 w-full md:w-1/2">
          <Link
            href={{
              pathname: `${pathname}/receipts`,
              // query: { name: data?.name },
            }}
            className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
          >
            {t("app.reports.link_name")}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
