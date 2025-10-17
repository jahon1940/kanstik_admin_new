"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import ReceiptsContent from "../pos/[posId]/receipts/ReceiptsContent";



export default function Pos() {
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const params = useParams();
  const router = useRouter();

  return (
    <div defaultValue="info" className="space-y-3">
      {/* Header - responsive */}
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 md:gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)] justify-between">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <h1 className="text-base md:text-xl font-semibold truncate">
            {t("app.stock.account_receipts")} ({name})
          </h1>
        </div>
      </div>
      {/* Main content - responsive */}
      <div className="rounded-lg bg-card shadow-lg">
        <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4 ">
          {/* content - only visible on desktop/larger screens */}
          <div className=" w-full">
            <ReceiptsContent />
          </div>
        </div>
      </div>
    </div>
  );
}
