"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ChevronDownIcon, ChevronLeft, Eye, EyeOff, X } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

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
  fiscal_sign: string;
  staff_name: string;
  products?: any[];
};

export default function ReceiptsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [receipts, setReceipts] = useState<Receipt[]>([]);

     const [receiptsPagination, setReceiptsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 50,
        hasNext: false,
        hasPrevious: false,
      });

  const params = useParams();
  const router = useRouter();

 // Modal state for receipt details
   const [isModalOpen, setIsModalOpen] = React.useState(false);
   const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(
     null
   );

  const getReceipts = (
      date: string,
      date2: string,
      page: number = 1,
      pageSize: number = 50,
      append: boolean = false
    ) => {
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
        `${BASE_URL}/v1/admins/pos/${params.id}/receipts?from_date=${date}&to_date=${date2}&page=${page}&page_size=${pageSize}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          console.log("Receipts API Response:", result);
          console.log("Append mode:", append, "Page:", page);
  
          if (!cancelled) {
            if (append && page > 1) {
              // Append new results to existing ones for "Show More" functionality
              setReceipts((prevReceipts) => {
                const newReceipts = [...prevReceipts, ...(result.results ?? [])];
                console.log(
                  "Appending receipts. Previous count:",
                  prevReceipts.length,
                  "New count:",
                  newReceipts.length
                );
                return newReceipts;
              });
            } else {
              // Replace results for normal pagination
              setReceipts(result.results ?? []);
            }
  
            // Update pagination state
            const paginationData = {
              currentPage: result.current_page || result.page || page,
              totalPages:
                result.total_pages ||
                result.totalPages ||
                Math.ceil(
                  (result.total || result.count || 0) /
                    (result.page_size || result.pageSize || pageSize)
                ) ||
                1,
              totalItems: result.total_items || result.total || result.count || 0,
              pageSize: result.page_size || result.pageSize || pageSize,
              hasNext:
                result.has_next ||
                result.hasNext ||
                (result.current_page || result.page || page) <
                  (result.total_pages || result.totalPages || 1),
              hasPrevious:
                result.has_previous ||
                result.hasPrevious ||
                (result.current_page || result.page || page) > 1,
            };
            console.log("API Result:", result);
            console.log("Calculated Pagination data:", paginationData);
            setReceiptsPagination(paginationData);
          }
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

 

  // useEffect(() => {
  //   getCashiers();
  //   getAllManagers()
  // }, []);

  const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<string | undefined>(undefined);
  
    const [open2, setOpen2] = React.useState(false);
    const [date2, setDate2] = React.useState<string | undefined>(undefined);
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
    <div className="space-y-2">
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
            {t("app.pos.title")}()
          </h1>
        </div>
      </div>
      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4">
          {/* Receipts Tab */}
          <div className="w-full mt-0">
            <div className="space-y-4">
              <div className="bg-bgColor flex justify-between">
                <h2 className="text-sm md:text-base font-medium  text-black rounded-sm p-2 px-3">
                  {t("app.pos.receipts")}
                </h2>
                {/* Action buttons - responsive */}
                <div className="flex gap-2 md:hidden">
                  <Button
                    onClick={() => {
                      if (date) downloadReport(date);
                    }}
                    className="cursor-pointer text-sm px-3 py-2"
                  >
                    {t("app.pos.download_report")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (date) downloadReceipts(date);
                    }}
                    className="cursor-pointer text-sm px-3 py-2"
                  >
                    {t("app.pos.download_receipts")}
                  </Button>
                </div>
              </div>

              {/* Date filters - responsive */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start">
                <div className="flex gap-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-[49%] sm:w-46 justify-between font-normal text-sm"
                      >
                        {date ? date : t("app.pos.from")}
                        <ChevronDownIcon className="h-4 w-4" />
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

                  <Popover open={open2} onOpenChange={setOpen2}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-[49%] sm:w-46 justify-between font-normal text-sm"
                      >
                        {date2 ? date2 : t("app.pos.to")}
                        <ChevronDownIcon className="h-4 w-4" />
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

                            setDate2(formatted);
                            setOpen2(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Action buttons - responsive */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => {
                      if (date && date2) {
                        setReceipts([]);
                        getReceipts(date, date2, 1, 50);
                      }
                    }}
                    className="cursor-pointer text-sm px-3 py-2"
                  >
                    {t("app.pos.generate_receipts")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (date) downloadReport(date);
                    }}
                    className="cursor-pointer text-sm px-3 py-2 hidden md:block  "
                  >
                    {t("app.pos.download_report")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (date) downloadReceipts(date);
                    }}
                    className="cursor-pointer text-sm px-3 py-2 hidden md:block  "
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
                    {t("toast.no_data")}
                  </td>
                </tr>
              ) : (
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="sticky -top-[1px] z-10 bg-bgColor">
                    <tr>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Операция
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Номер чека
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Дата и время
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Тип оплаты
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Наличные
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Картой
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Сумма
                      </th>
                      <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                        Статус 1С
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {receipts?.map((org: any) => (
                      <tr
                        key={org?.id}
                        className="hover:bg-accent/50 cursor-pointer  border-gray-300"
                        onClick={() => {
                          setSelectedReceipt(org);
                          setIsModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-2 border-r border-gray-300">
                          <h2 className="text-green-500">Продажа</h2>{" "}
                          {org?.qr_code_url && (
                            <Link
                              onClick={(e) => {
                                e.stopPropagation(); // parent onClick ishlashini to‘xtatadi
                              }}
                              className="bg-primary text-white rounded-sm text-[12px] p-1 px-3"
                              target="_blank"
                              href={org.qr_code_url}
                            >
                              QR код
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2>{org?.receipt_seq}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2> {formatDate(org?.close_time)}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {" "}
                          <h2>
                            {org?.payments?.map((type: any) => {
                              return type.payment_type.name + " ";
                            })}
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {/* <h2>
                            {org?.payments.map((item) => {
                              if (item.payment_type.name === "Наличные") {
                                return item.price.toLocaleString("ru-RU");
                              } else {
                                return 0;
                              }
                            })}{" "}
                            сум
                          </h2> */}
                          <h2>
                            {org?.received_cash.toLocaleString("ru-RU")} сум
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {/* <h2>
                            {org?.payments.map((item) => {
                              if (
                                item.payment_type.name === "HUMO" ||
                                item.payment_type.name === "UZCARD"
                              ) {
                                return item.price.toLocaleString("ru-RU");
                              } else {
                                return 0;
                              }
                            })}{" "}
                            сум
                          </h2> */}
                          <h2>
                            {org?.received_card.toLocaleString("ru-RU")} сум
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2>
                            {(
                              Number(org?.received_cash) +
                              Number(org?.received_card)
                            ).toLocaleString("ru-RU")}{" "}
                            сум
                            {/* {org?.received_cash +
                              org?.received_card.toLocaleString("ru-RU")}
                            сум */}
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {org?.sent_to_1c ? (
                            <span className="text-green-500">Отправлено</span>
                          ) : (
                            <span className="text-red-500">Не отправлено</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              {receipts?.length > 0 && (
                <Pagination
                  currentPage={receiptsPagination.currentPage}
                  totalPages={receiptsPagination.totalPages}
                  onPageChange={(page) => {
                    if (date && date2) {
                      getReceipts(
                        date,
                        date2,
                        page,
                        receiptsPagination.pageSize
                      );
                    }
                  }}
                  showMoreItems={
                    receiptsPagination.currentPage <
                      receiptsPagination.totalPages ||
                    (receiptsPagination.totalPages === 1 &&
                      receiptsPagination.totalItems >
                        receiptsPagination.pageSize) ||
                    receiptsPagination.totalItems > receipts.length
                      ? receiptsPagination.pageSize
                      : 0
                  }
                  onShowMore={() => {
                    if (
                      date &&
                      date2 &&
                      (receiptsPagination.currentPage <
                        receiptsPagination.totalPages ||
                        (receiptsPagination.totalPages === 1 &&
                          receiptsPagination.totalItems >
                            receiptsPagination.pageSize) ||
                        receiptsPagination.totalItems > receipts.length)
                    ) {
                      getReceipts(
                        date,
                        date2,
                        receiptsPagination.currentPage + 1,
                        receiptsPagination.pageSize,
                        true // append = true for "Show More" functionality
                      );
                    }
                  }}
                  disabled={loading}
                  className="mt-4"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
