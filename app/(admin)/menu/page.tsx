"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import {  usePathname } from "next/navigation";

import Link from "next/link";



export default function ReportsPage() {
    const pathname = usePathname();
      const { t } = useTranslation();
      
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <h1 className="text-lg md:text-xl font-semibold">
          {t("app.reports.title")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="space-y-4">
          <Link
            href={{
              pathname: `${pathname}/clients`,
              // query: { name: data?.name },
            }}
            className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
          >
            {t("menu.link1")}
          </Link>
          <Link
            href={{
              pathname: `${pathname}/clients`,
              // query: { name: data?.name },
            }}
            className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
          >
            {t("menu.link2")}
          </Link>
        </div>
      </div>
    </div>
  );
}
