"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

const OrdersContent = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();

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
      `${BASE_URL}/v1/admins/pos/${params.posId}/orders?from_date=${date}&to_date=${date2}&page=1&page_size=200`,
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
      });

    return () => {
      cancelled = true;
    };
  };

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
    <div className="w-full mt-0">
      <div className="space-y-4">
        <h2 className="text-sm md:text-base font-medium bg-bgColor text-black rounded-sm p-2 px-3">
          {t("app.pos.orders")}
        </h2>

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
                  selected={ordersDate ? new Date(ordersDate) : undefined}
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
              {t("app.pos.generate_orders")}
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
          <table className="w-full text-sm relative border-separate border-spacing-y-2">
            <thead className="sticky top-[0px] z-10 bg-bgColor">
              <tr>
                <th className="text-center font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                  №
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                  {t("order.title")} ID
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                  {t("app.pos.date_time")}
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                  {t("app.pos.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ordersSite?.map((org: any, index: number) => (
                <tr key={org?.id} className="hover:bg-accent/50 cursor-pointer">
                  <td className="border border-border border-r-0 rounded-l-lg">
                    <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                      {index + 1}
                    </div>
                  </td>
                  <td className="border border-border">
                    <Link href={`/order/${org.id}`} className="block px-4 py-3">
                      <h2 className="text-green-500">#{org.id}</h2>
                    </Link>
                  </td>
                  <td className="border border-border">
                    <Link href={`/order/${org.id}`} className="block px-4 py-3">
                      <h2>{formatDate(org?.created_at)}</h2>
                    </Link>
                  </td>
                  <td className="border border-border border-l-0 rounded-r-lg">
                    <Link href={`/order/${org.id}`} className="block px-4 py-3">
                      <h2>
                        {org?.price?.toLocaleString("ru-RU")} {t("app.pos.sum")}
                      </h2>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdersContent;
