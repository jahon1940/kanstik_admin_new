"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { BASE_URL } from "@/lib/api";
import { getDeviceToken } from "@/lib/token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { log } from "node:console";
import Link from "next/link";

// Pose (kassa) type
type Pose = {
  id: number;
  name: string;
};

// Stock (obyekt) type
type Stock = {
  id: number;
  name: string;
  organization?: string;
  region?: string;
  poses: Pose[];
  app_version?: string; // ✅ yangi qo'shildi
  gnk_id?: string; // agar shu ham bo'lsa
  status: boolean;
  enable_delay: boolean;
  order_from_site: boolean;
};

// Receipt type
type Receipt = {
  id: number;
  receipt_seq: string;
  received_cash: number;
  payments: Array<{
    payment_type: {
      name: string;
    };
  }>;
  sent_to_1c: boolean;
  close_time: string;
  qr_code_url?: string;
};

export default function Pos() {
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const params = useParams();
  const router = useRouter();

  const getOrganization = () => {
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

    fetch(`${BASE_URL}/v1/admins/pos/${params.id}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setData(result ?? null);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  const getReceipts = (date: string) => {
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
      `${BASE_URL}/v1/admins/pos/${params.id}/receipts/${date}?page=1&page_size=200`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setReceipts(result.results ?? null);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  const downloadReport = async (date: string) => {
    if (!date) {
      toast.error("Iltimos, sanani tanlang");
      return;
    }

    try {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const response = await fetch(
        `${BASE_URL}/v1/admins/pos/${params.id}/reports/download-excel/${date}`,
        {
          method: "POST",
          headers: myHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from response headers or create a default one
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `report_${date}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Hisobot muvaffaqiyatli yuklab olindi");
    } catch (error: any) {
      const msg = error?.message || "Hisobotni yuklab olishda xatolik";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const downloadReceipts = async (date: string) => {
    if (!date) {
      toast.error("Iltimos, sanani tanlang");
      return;
    }

    try {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const response = await fetch(
        `${BASE_URL}/v1/admins/pos/${params.id}/receipts/download-excel/${date}`,
        {
          method: "POST",
          headers: myHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from response headers or create a default one
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `receipts_${date}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Cheklar muvaffaqiyatli yuklab olindi");
    } catch (error: any) {
      const msg = error?.message || "Cheklarni yuklab olishda xatolik";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrganization();
  }, []);

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<string | undefined>(undefined);

  const [open2, setOpen2] = React.useState(false);
  const [date2, setDate2] = React.useState<string | undefined>(undefined);

  // Modal state for receipt details
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(
    null
  );

  console.log(receipts);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year},${hours}:${minutes}`;
  };

  return (
    <Tabs defaultValue="info" className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-semibold">
            {t("app.pos.title")}({data?.name})
          </h1>
        </div>
        <TabsList className="flex w-full mx-auto xl:mx-0 gap-2 ">
          <TabsTrigger value="info">{t("app.pos.info")}</TabsTrigger>
          <TabsTrigger value="cashiers">{t("app.pos.cashiers")}</TabsTrigger>
          <TabsTrigger value="receipts">{t("app.pos.receipts")}</TabsTrigger>
          <TabsTrigger value="payments">{t("app.pos.payments")}</TabsTrigger>
          <TabsTrigger value="orders">{t("app.pos.orders")}</TabsTrigger>
          <TabsTrigger value="discounts">{t("app.pos.discounts")}</TabsTrigger>
        </TabsList>
      </div>
      <div className="">
        <div className="overflow-auto max-h-[75vh] col-span-6 md:col-span-4 border rounded-2xl p-4 pt-0 bg-secondary ">
          {/* content */}
          <div className="min-h-[70vh] w-full pt-4">
            {/* info */}
            <TabsContent value="info" className="w-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.info")}{" "}
              </h1>
              <div className="overflow-auto col-span-6 md:col-span-2 border rounded-2xl p-4 flex flex-col gap-2 max-h-[75vh] text-sm">
                <h1 className="text-xl border-b-2 border-secondary py-2 mb-2 font-extrabold">
                  {t("app.pos.shop")}
                </h1>

                <h1>
                  {t("app.stock.name")} : {data?.name}{" "}
                </h1>
                <h1>
                  {t("app.pos.app_version")} : {data?.app_version}{" "}
                </h1>
                <h1>gnk_id : {data?.gnk_id} </h1>
                <h1>
                  {t("app.pos.status")} :{" "}
                  {data?.status ? (
                    <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.active")}
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.inactive")}
                    </span>
                  )}
                </h1>
                <h1>
                  {t("app.pos.work_without_module")} :{" "}
                  {data?.enable_delay ? (
                    <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.active")}
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.inactive")}
                    </span>
                  )}
                </h1>
                <h1>
                  {t("app.pos.orders_from_site")} :{" "}
                  {data?.order_from_site ? (
                    <span className="bg-green-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.active")}
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-[13px] p-1.5 rounded-sm">
                      {t("app.pos.inactive")}
                    </span>
                  )}
                </h1>
                <h1>{t("app.pos.last_activity")} :</h1>
                <h1 className="border-b-2 border-secondary py-2 mb-2">
                  {t("app.pos.last_sync")} :
                </h1>
              </div>
            </TabsContent>
            {/* cashiers */}
            <TabsContent value="cashiers" className="w-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.cashiers")}{" "}
              </h1>
              <Button className="mb-2">{t("app.pos.add_cashier")}</Button>
              <table className="w-full border-t text-sm">
                <thead className="sticky -top-[1px] z-10 bg-bgColor">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                      {t("app.company.name")}
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                      {t("app.company.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={2}>
                        <Loading />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="px-4 py-6 text-red-600" colSpan={2}>
                        {error}
                      </td>
                    </tr>
                  ) : !data?.poses?.length ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground"
                        colSpan={2}
                      >
                        {t("app.company.not_found")}
                      </td>
                    </tr>
                  ) : (
                    data.poses.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-accent/50 cursor-pointer"
                      >
                        <td>
                          <Link
                            className="px-4 py-3 block"
                            href={`/pos/${org.id}`}
                          >
                            {org.name}
                          </Link>
                        </td>
                        <td>
                          <Link
                            className="px-4 py-3 block"
                            href={`/company/${org.id}`}
                          >
                            <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                              {t("app.company.active")}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabsContent>
            {/* receipts */}
            <TabsContent value="receipts" className="w-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.receipts")}{" "}
              </h1>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {date ? date : t("app.pos.select_date")}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date ? new Date(date) : undefined}
                        captionLayout="dropdown"
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            const formatted = `${selectedDate.getFullYear()}-${String(
                              selectedDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              selectedDate.getDate()
                            ).padStart(2, "0")}`;

                            setDate(formatted); // ✅ endi 2025-09-26 shaklida ketadi
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
                        className="w-48 justify-between font-normal"
                      >
                        {date2 ? date2 : t("app.pos.select_date")}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date2 ? new Date(date2) : undefined}
                        captionLayout="dropdown"
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            const formatted = `${selectedDate.getFullYear()}-${String(
                              selectedDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              selectedDate.getDate()
                            ).padStart(2, "0")}`;

                            setDate2(formatted); // ✅ endi 2025-09-26 shaklida ketadi
                            setOpen2(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={() => {
                      if (date) getReceipts(date);
                    }}
                    className="mb-2 cursor-pointer"
                  >
                    {t("app.pos.generate_receipts")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (date) downloadReport(date);
                    }}
                    className="mb-2 cursor-pointer"
                  >
                    {t("app.pos.download_report")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (date) downloadReceipts(date);
                    }}
                    className="mb-2 cursor-pointer"
                  >
                    {t("app.pos.download_receipts")}
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
              ) : receipts?.length == 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                    Ma&apos;lumot topilmadi
                  </td>
                </tr>
              ) : (
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="sticky -top-[1px] z-10 bg-bgColor">
                    <tr>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Nomi
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-gray-300">
                        Holati
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-gray-300">
                        Holati
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {receipts?.map((org, index) => (
                      <tr
                        key={org?.id}
                        className="hover:bg-accent/50 cursor-pointer border-b border-gray-300"
                        onClick={() => {
                          setSelectedReceipt(org);
                          setIsModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2 className="text-green-500">Тип: Продажа</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2 className="mb-2">{org?.receipt_seq}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2> {formatDate(org?.close_time)}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {" "}
                          <h2 className="mb-2">
                            {org?.received_cash.toLocaleString("ru-RU")} сум
                          </h2>
                          <h2>{org?.payments[0]?.payment_type?.name}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2 className="mb-2">Обмен 1с:</h2>
                          {org?.sent_to_1c ? (
                            <span className="text-green-500">Отправлено</span>
                          ) : (
                            <span className="text-red-500">Не Отправлено</span>
                          )}
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {" "}
                          <h2 className="mb-2">ID : {org?.id} сум</h2>
                        </td>
                        <td className="px-4 py-4">
                          {" "}
                          {org?.qr_code_url && (
                            <Link target="_blank" href={org.qr_code_url}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="lucide lucide-link-icon lucide-link"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TabsContent>
            {/* payments */}
            <TabsContent value="payments" className="w-full h-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.payments")}{" "}
              </h1>

              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Выберите Платеж" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Выберите 1</SelectLabel>
                      <SelectItem value="est">humo</SelectItem>
                      <SelectItem value="cst">Uzcard</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Выберите 2</SelectLabel>
                      <SelectItem value="gmt">humo</SelectItem>
                      <SelectItem value="cet">Uzcard</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button className="mb-2">{t("app.pos.add_payment")}</Button>
              </div>

              <table className="w-full border-t text-sm">
                <thead className="sticky -top-[1px] z-10 bg-bgColor">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                      Nomi
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={2}>
                        <Loading />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="px-4 py-6 text-red-600" colSpan={2}>
                        {error}
                      </td>
                    </tr>
                  ) : !data?.poses?.length ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground"
                        colSpan={2}
                      >
                        {t("app.company.not_found")}
                      </td>
                    </tr>
                  ) : (
                    data.poses.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-accent/50 cursor-pointer"
                        onClick={() => router.push(`/pos/${org.id}`)}
                      >
                        <td className="px-4 py-3">{org.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {t("app.company.active")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabsContent>
            {/* orders */}
            <TabsContent value="orders" className="w-full h-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.orders")}{" "}
              </h1>

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {date ? date : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date ? new Date(date) : undefined}
                        captionLayout="dropdown"
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            const formatted = `${selectedDate.getFullYear()}-${String(
                              selectedDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              selectedDate.getDate()
                            ).padStart(2, "0")}`;
                            setDate(formatted);
                            setOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button className="mb-2 cursor-pointer">
                    {t("app.pos.generate_orders")}
                  </Button>
                </div>
              </div>

              {/* <table className="w-full border-t text-sm">
                    <thead className="sticky -top-[1px] z-10 bg-bgColor">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                          Nomi
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                          Holati
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loading ? (
                        <tr>
                          <td colSpan={2}>
                            <Loading />
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="px-4 py-6 text-red-600" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : !data?.poses?.length ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-muted-foreground"
                            colSpan={2}
                          >
                            Ma&apos;lumot topilmadi
                          </td>
                        </tr>
                      ) : (
                        data.poses.map((org) => (
                          <tr
                            key={org.id}
                            className="hover:bg-accent/50 cursor-pointer"
                            onClick={() => router.push(`/pos/${org.id}`)}
                          >
                            <td className="px-4 py-3">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Aktiv
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table> */}
            </TabsContent>
            {/* discounts */}
            <TabsContent value="discounts" className="w-full h-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.discounts")}{" "}
              </h1>

              <table className="w-full border-t text-sm">
                <thead className="sticky -top-[1px] z-10 bg-bgColor">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                      Nomi
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={2}>
                        <Loading />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="px-4 py-6 text-red-600" colSpan={2}>
                        {error}
                      </td>
                    </tr>
                  ) : !data?.poses?.length ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground"
                        colSpan={2}
                      >
                        {t("app.company.not_found")}
                      </td>
                    </tr>
                  ) : (
                    data.poses.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-accent/50 cursor-pointer"
                        onClick={() => router.push(`/pos/${org.id}`)}
                      >
                        <td className="px-4 py-3">{org.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {t("app.company.active")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabsContent>
          </div>
        </div>
      </div>

      {/* Modal for receipt details */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Данные чека</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-500 hover:text-red-700 text-5xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {selectedReceipt && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Номер чека:
                    </label>
                    <p className="text-lg font-semibold">
                      {selectedReceipt.receipt_seq}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип:
                    </label>
                    <p className="text-green-500 font-semibold">Продажа</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Сумма:
                    </label>
                    <p className="text-lg font-semibold">
                      {selectedReceipt.received_cash?.toLocaleString("ru-RU")}{" "}
                      сум
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Способ оплаты:
                    </label>
                    <p className="font-semibold">
                      {selectedReceipt.payments?.[0]?.payment_type?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Обмен 1С:
                    </label>
                    <p
                      className={
                        selectedReceipt.sent_to_1c
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {selectedReceipt.sent_to_1c
                        ? "Отправлено"
                        : "Не Отправлено"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID:
                    </label>
                    <p className="font-semibold">{selectedReceipt.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата и время:
                    </label>
                    <p className="font-semibold">
                      {formatDate(selectedReceipt.close_time)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR код:
                    </label>
                    {selectedReceipt.qr_code_url && (
                      <a
                        href={selectedReceipt.qr_code_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline"
                      >
                        Открыть QR код
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Tabs>
  );
}
