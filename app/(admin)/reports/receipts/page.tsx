"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ChevronDownIcon, ChevronLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import StockReport from "@/components/StockReport";

export default function ReportsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
    const router = useRouter();

  const [ordersSite, setOrdersSite] = useState<any>(null);

  const [open, setOpen] = React.useState(false);

  const [open2, setOpen2] = React.useState(false);
  const [date2, setDate2] = React.useState<string | undefined>(undefined);
  const [ordersDate, setOrdersDate] = React.useState<string | undefined>(
    undefined
  );
  const [ordersDate2, setOrdersDate2] = React.useState<string | undefined>(
    undefined
  );

  const getOrders = (date: string, date2: string) => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/receipts/info?from_date=${date}&to_date=${date2}&page=1&page_size=200`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setOrdersSite(result.results ?? null);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || t("toast.network_error");
        if (!cancelled) setError(msg);
        toast.error(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  const downloadReport = async (date: string, date2: string) => {
    if (!date || !date2) {
      toast.error(t("app.pos.please_select_date"));
      return;
    }

    try {
      const myHeaders = new Headers();
      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const response = await fetch(
        `${BASE_URL}/v1/admins/receipts/info/download-excel?from_date=${date}&to_date=${date2}`,
        {
          method: "POST",
          headers: myHeaders,
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error(t("toast.network_error"));
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipts_report_${date}_${date2}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("app.pos.report_downloaded"));
    } catch (error: any) {
      const msg = error?.message || t("toast.network_error");
      toast.error(msg);
    }
  };

  console.log(ordersSite);
  

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold">
          {t("app.reports.title2")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="space-y-4">
          {/* Date filters - responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-[49%] sm:w-46 justify-between font-normal text-sm"
                  >
                    {ordersDate ? ordersDate : t("app.pos.from")}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={ordersDate ? new Date(ordersDate) : undefined}
                    captionLayout="dropdown"
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        const formatted = `${selectedDate.getFullYear()}-${String(
                          selectedDate.getMonth() + 1
                        ).padStart(2, "0")}-${String(
                          selectedDate.getDate()
                        ).padStart(2, "0")}`;
                        setOrdersDate(formatted);
                        setOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Popover open={open2} onOpenChange={setOpen2}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-[49%] sm:w-46 justify-between font-normal text-sm"
                  >
                    {ordersDate2 ? ordersDate2 : t("app.pos.to")}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={ordersDate2 ? new Date(ordersDate2) : undefined}
                    captionLayout="dropdown"
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        const formatted = `${selectedDate.getFullYear()}-${String(
                          selectedDate.getMonth() + 1
                        ).padStart(2, "0")}-${String(
                          selectedDate.getDate()
                        ).padStart(2, "0")}`;
                        setOrdersDate2(formatted);
                        setOpen2(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Generate button - responsive */}
            <div className="flex">
              <Button
                onClick={() => {
                  if (ordersDate && ordersDate2)
                    getOrders(ordersDate, ordersDate2);
                }}
                className="cursor-pointer text-sm px-3 py-2 w-full"
              >
                {t("app.reports.generate_orders")}
              </Button>
            </div>
            {/* download button */}
            <div className="flex">
              <Button
                onClick={() => {
                  if (ordersDate && ordersDate2)
                    downloadReport(ordersDate, ordersDate2);
                }}
                className="cursor-pointer text-sm px-3 py-2 w-full"
              >
                {t("app.reports.download_reports")}
              </Button>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <tr>
              <td className="px-4 py-6 text-red-600" colSpan={2}>
                {error}
              </td>
            </tr>
          ) : ordersSite?.length == 0 ? (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                {t("toast.no_data")}
              </td>
            </tr>
          ) : (
            <div className="space-y-4">
              {ordersSite?.map((org: any, index: number) => (
                <StockReport key={org?.id} data={org} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
