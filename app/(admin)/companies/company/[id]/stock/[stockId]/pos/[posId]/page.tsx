"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslation } from "react-i18next";
import Link from "next/link";

import AboutPosContent from "./aboutpos/AboutPosContent";
import CashiersContent from "./cashiers/CashiersContent";
import ReceiptsContent from "./receipts/ReceiptsContent";
import PaymentsContent from "./payments/PaymentsContent";
import OrdersContent from "./orders/OrdersContent";
import DiscountContent from "./discount/DiscountContent";

export default function Pos() {
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const params = useParams();
  const router = useRouter();

  return (
    <Tabs defaultValue="info" className="space-y-3">
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
            {t("app.pos.title")}({name})
          </h1>
        </div>

        {/* Tabs - responsive */}
        <div className="hidden md:block w-full md:w-auto overflow-x-auto">
          <TabsList className="flex w-max md:w-full gap-1 md:gap-2 border-none bg-transparent p-0">
            <TabsTrigger
              value="info"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.info")}
            </TabsTrigger>
            <TabsTrigger
              value="cashiers"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.cashiers")}
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.receipts")}
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.payments")}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.orders")}
            </TabsTrigger>
            <TabsTrigger
              value="discounts"
              className="text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap"
            >
              {t("app.pos.discounts")}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      {/* Main content - responsive */}
      <div className="rounded-lg bg-card shadow-lg">
        <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4 ">
          {/* content - only visible on desktop/larger screens */}
          <div className="hidden md:block w-full">
            {/* info */}
            <TabsContent value="info" className="w-full">
              <AboutPosContent />
            </TabsContent>
            {/* cashiers */}
            <TabsContent value="cashiers" className="w-full">
              <CashiersContent />
            </TabsContent>
            {/* Receipts Tab */}
            <TabsContent value="receipts" className="w-full mt-0">
              <ReceiptsContent />
            </TabsContent>
            {/* Payments Tab */}
            <TabsContent value="payments" className="w-full mt-0">
              <PaymentsContent />
            </TabsContent>
            {/* Orders Tab */}
            <TabsContent value="orders" className="w-full mt-0">
              <OrdersContent />
            </TabsContent>
            {/* Discounts Tab */}
            <TabsContent value="discounts" className="w-full mt-0">
              <DiscountContent />
            </TabsContent>
          </div>
          {/* Mobile navigation - only visible on small screens */}
          <div className="md:hidden mb-6">
            <div className="flex flex-col gap-3">
              <Link
                href={{
                  pathname: `/pos/${params.posId}/aboutpos`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.info")}
              </Link>

              <Link
                href={{
                  pathname: `/pos/${params.posId}/cashiers`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.cashiers")}
              </Link>

              <Link
                href={{
                  pathname: `/pos/${params.posId}/receipts`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.receipts")}
              </Link>

              <Link
                href={{
                  pathname: `/pos/${params.posId}/payments`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.payments")}
              </Link>

              <Link
                href={{
                  pathname: `/pos/${params.posId}/orders`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.orders")}
              </Link>

              <Link
                href={{
                  pathname: `/pos/${params.posId}/discount`,
                  query: { name },
                }}
                className="flex items-center justify-center px-6 py-4 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t("app.pos.discounts")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
}
