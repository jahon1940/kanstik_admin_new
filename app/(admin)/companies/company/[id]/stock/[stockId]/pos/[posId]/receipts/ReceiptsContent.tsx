"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { ChevronDownIcon, Info, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import Image from "next/image";

// Receipt type
type Receipt = {
  id: number;
  receipt_seq: string;
  received_cash: number;
  received_card: number;
  payments: Array<{
    id: number;
    payment_type: {
      id: number;
      name: string;
      image_url?: string;
    };
    price: number;
  }>;
  sent_to_1c: boolean;
  close_time: string;
  qr_code_url?: string;
  fiscal_sign: string;
  staff_name: string;
  products?: any[];
  terminal_id: string;
  error_1c?: string;
  card_number?: string;
};
const ReceiptsContent = () => {
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

  // Modal state for receipt details
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(
    null
  );

  // Error modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);

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
      `${BASE_URL}/v1/admins/pos/${params.posId}/receipts?from_date=${date}&to_date=${date2}&page=${page}&page_size=${pageSize}`,
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
          e?.response?.data?.message || e?.message || t("toast.network_error");
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

  // Mobile calendar states
  const [mobileCalendarOpen, setMobileCalendarOpen] = React.useState(false);
  const [mobileCalendarOpen2, setMobileCalendarOpen2] = React.useState(false);
  const downloadReport = async (date: string) => {
    if (!date) {
      toast.error(t("app.pos.please_select_date"));
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
        `${BASE_URL}/v1/admins/pos/${params.posId}/reports/download-excel/${date}`,
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

      toast.success(t("app.pos.report_downloaded_success"));
    } catch (error: any) {
      const msg = error?.message || t("app.pos.report_download_error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const downloadReceipts = async (date: string) => {
    if (!date) {
      toast.error(t("app.pos.please_select_date"));
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
        `${BASE_URL}/v1/admins/pos/${params.posId}/receipts/download-excel/${date}`,
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

      toast.success(t("app.pos.receipts_downloaded_success"));
    } catch (error: any) {
      const msg = error?.message || t("app.pos.receipts_download_error");
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
    <div className="w-full mt-0 ">
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
            {/* Desktop Calendar */}
            <div className="hidden md:contents">
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
                  className="w-auto overflow-hidden p-0 z-[9999]"
                  align="center"
                  side="bottom"
                  sideOffset={5}
                  avoidCollisions={true}
                  collisionPadding={10}
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
                  className="w-auto overflow-hidden p-0 z-[9999]"
                  align="center"
                  side="bottom"
                  sideOffset={5}
                  avoidCollisions={true}
                  collisionPadding={10}
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

            {/* Mobile Calendar Buttons */}
            <div className="md:hidden flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setMobileCalendarOpen(true)}
                className="w-[49%] justify-between font-normal text-sm"
              >
                {date ? date : t("app.pos.from")}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setMobileCalendarOpen2(true)}
                className="w-[49%] justify-between font-normal text-sm"
              >
                {date2 ? date2 : t("app.pos.to")}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </div>
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

        <div className="relative">
          {loading ? (
            <Loading />
          ) : error ? (
            <div>
              <div className="px-4 py-6 text-red-600">{error}</div>
            </div>
          ) : receipts?.length == 0 ? (
            <div>
              <div className="px-4 py-6 text-muted-foreground">
                {t("toast.no_data")}
              </div>
            </div>
          ) : (
            <table className="w-full text-sm relative border-separate border-spacing-y-2 ">
              <thead className="sticky -top-[16px] z-10 bg-bgColor">
                <tr>
                  <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 rounded-l-lg">
                    №
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.operation")}
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.receipt_number")}
                  </th>
                  <th className="hidden md:table-cell text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.date_time")}
                  </th>
                  <th className="hidden md:table-cell text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.payment_type")}
                  </th>
                  <th className="hidden md:table-cell text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.cash")}
                  </th>
                  <th className="hidden md:table-cell text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                    {t("app.pos.card")}
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0 md:border-r-1 rounded-r-lg md:rounded-r-none">
                    {t("app.pos.amount")}
                  </th>
                  <th className="hidden md:table-cell text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                    {t("app.pos.status_1c")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipts?.map((org: any, index: number) => (
                  <tr
                    key={org?.id}
                    className="hover:bg-accent/50 cursor-pointer"
                    onClick={() => {
                      setSelectedReceipt(org);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="border border-border border-r-0 rounded-l-lg p-4">
                      <h2>
                        {(receiptsPagination.currentPage - 1) *
                          receiptsPagination.pageSize +
                          index +
                          1}
                      </h2>
                    </td>
                    <td className="border border-border px-4 py-2">
                      {org.receipt_type == "sale" ? (
                        <h2 className="text-green-500 mb-1">
                          {" "}
                          {t(`app.pos.sale`)}
                        </h2>
                      ) : (
                        <h2 className="text-red-500 mb-1">
                          {t(`app.pos.refund`)}
                        </h2>
                      )}

                      {org?.qr_code_url && (
                        <Link
                          onClick={(e) => {
                            e.stopPropagation(); // parent onClick ishlashini to‘xtatadi
                          }}
                          className="bg-primary text-white rounded-sm text-[12px] p-1 px-3"
                          target="_blank"
                          href={org.qr_code_url}
                        >
                          {t("app.pos.qr_code")}
                        </Link>
                      )}
                    </td>
                    <td className="border border-border p-4">
                      <h2>{org?.receipt_seq || org?.id}</h2>
                    </td>
                    <td className="hidden md:table-cell border border-border p-4 ">
                      <h2> {formatDate(org?.close_time)}</h2>
                    </td>
                    <td className="hidden md:table-cell border border-border p-4">
                      {" "}
                      <h2>
                        {org?.payments?.map((type: any, index: number) => {
                          if (index > 0) {
                            return (
                              <div className="flex flex-wrap gap-2 items-center">
                                {" "}
                                <Image
                                  src={
                                    type.payment_type.image_url
                                      ? `${BASE_URL}${type.payment_type.image_url}`
                                      : "/images/nophoto.png"
                                  }
                                  width={28}
                                  height={28}
                                  alt={type.payment_type.name || "image"}
                                  className="w-8 h-8 object-contain"
                                />
                                <span>{type.payment_type.name}</span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex gap-2 items-center">
                                {" "}
                                <Image
                                  src={
                                    type.payment_type.image_url
                                      ? `${BASE_URL}${type.payment_type.image_url}`
                                      : "/images/nophoto.png"
                                  }
                                  width={28}
                                  height={28}
                                  alt={type.payment_type.name || "image"}
                                  className="w-8 h-8 object-contain"
                                />
                                <span>{type.payment_type.name}</span>
                              </div>
                            );
                          }
                        })}
                      </h2>
                    </td>
                    <td className="hidden md:table-cell border border-border p-4">
                      <h2>
                        {Number(
                          org?.received_cash.toString().slice(0, -2)
                        ).toLocaleString("ru-RU")}{" "}
                        {t("app.pos.sum")}
                      </h2>
                    </td>
                    <td className="hidden md:table-cell border border-border p-4">
                      <h2>
                        {(() => {
                          // Bonus payment type ni topish
                          const bonusPayment = org?.payments?.find(
                            (payment: any) =>
                              payment.payment_type?.name === "Бонусы"
                          );

                          // Agar bonus payment mavjud bo'lsa, uning price ini ko'rsatish
                          if (bonusPayment) {
                            return bonusPayment.price?.toLocaleString("ru-RU");
                          }

                          // Aks holda eski holatda qolish
                          return Number(
                            org?.received_card.toString().slice(0, -2)
                          ).toLocaleString("ru-RU");
                        })()}{" "}
                        {t("app.pos.sum")}
                      </h2>
                    </td>
                    <td className="border border-border p-4 border-l-0 md:border-l rounded-r-lg md:rounded-r-none">
                      <h2>
                        {(
                          Number(org?.received_cash.toString().slice(0, -2)) +
                          Number(org?.received_card.toString().slice(0, -2))
                        ).toLocaleString("ru-RU")}{" "}
                        {t("app.pos.sum")}
                      </h2>
                    </td>
                    <td className="hidden md:table-cell border border-border border-l-0 rounded-r-lg p-4">
                      {org?.sent_to_1c ? (
                        <span className="text-green-500">
                          {t("app.pos.sent")}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          {t("app.pos.not_sent")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading &&
          receipts?.length > 0 &&
          receiptsPagination.totalPages > 1 && (
            <Pagination
              currentPage={receiptsPagination.currentPage}
              totalPages={receiptsPagination.totalPages}
              onPageChange={(page) => {
                if (date && date2) {
                  getReceipts(date, date2, page, receiptsPagination.pageSize);
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
      {/* Receipt Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-end z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setSelectedReceipt(null);
            }
          }}
        >
          <div className="bg-bgColor rounded-lg shadow-2xl  max-w-[80%] sm:max-w-md w-full h-full  overflow-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-1  flex justify-between items-center">
              <h2
                className={`font-semibold flex items-center gap-2 text-sm ${
                  selectedReceipt?.sent_to_1c
                    ? "text-green-600"
                    : "text-red-600 cursor-pointer"
                }`}
                onClick={() => {
                  if (!selectedReceipt?.sent_to_1c) {
                    setIsErrorModalOpen(true);
                  }
                }}
              >
                <Info /> {selectedReceipt?.id}
              </h2>
              {/* <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ×
              </button> */}
              {/* Status Info */}
              <div className="w-1/2 text-right">
                <span
                  className={`text-xs leading-[0px] ${
                    selectedReceipt?.sent_to_1c
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedReceipt?.sent_to_1c
                    ? t("app.pos.sent_to_1c")
                    : t("app.pos.not_synchronized")}
                </span>
              </div>
            </div>

            {/* Receipt Content */}
            <div
              className="overflow-y-auto bg-white w-[90%] mx-auto mb-4"
              style={{
                clipPath: `polygon(
      0 10px, 5% 0, 10% 10px, 15% 0, 20% 10px, 25% 0,
      30% 10px, 35% 0, 40% 10px, 45% 0, 50% 10px,
      55% 0, 60% 10px, 65% 0, 70% 10px, 75% 0,
      80% 10px, 85% 0, 90% 10px, 95% 0, 100% 10px,
      100% calc(100% - 10px), 95% 100%, 90% calc(100% - 10px),
      85% 100%, 80% 100%, 75% calc(100% - 10px), 70% 100%,
      65% calc(100% - 10px), 60% 100%, 55% calc(100% - 10px),
      50% 100%, 45% calc(100% - 10px), 40% 100%, 35% calc(100% - 10px),
      30% 100%, 25% calc(100% - 10px), 20% 100%, 15% calc(100% - 10px),
      10% 100%, 5% calc(100% - 10px), 0 100%
    )`,
              }}
            >
              {selectedReceipt && (
                <div className="p-4 font-mono text-sm">
                  {/* Store Header */}
                  <div className="text-center mb-4  pb-3">
                    <div className="text-lg font-bold">{t("app.pos.sale")}</div>
                    <div className="text-xs text-gray-600">Kanstik</div>
                  </div>

                  {/* Receipt Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>{t("app.pos.date_time")}:</span>
                      <span className="font-semibold">
                        {formatDate(selectedReceipt.close_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("app.pos.inn_pinfl")}:</span>
                      <span>{selectedReceipt.fiscal_sign}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("app.pos.cashier")}:</span>
                      <span className="text-right max-w-[200px]">
                        {selectedReceipt.staff_name}
                      </span>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className=" pt-3 mb-4">
                    <div className="text-center font-semibold mb-2">
                      {t("app.pos.products")}
                    </div>
                    <div className="space-y-2">
                      {selectedReceipt?.products?.map((item: any, index) => {
                        return (
                          <div>
                            <div
                              key={index}
                              className="flex justify-between items-start"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {item.product.classifier_title}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {item.quantity}.0 {t("app.pos.pcs")} х{" "}
                                  {item.price /
                                    item.quantity.toLocaleString("ru-RU")}
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <div className="font-semibold">
                                  {item.price?.toLocaleString("ru-RU")}
                                </div>
                              </div>
                            </div>
                            {/* Tax Info */}
                            <div className=" pt-3 mb-4">
                              <div className="flex justify-between text-xs">
                                <span>
                                  {t("app.pos.vat")}: ({item.vat_percent})
                                </span>
                                <span>{item.vat}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>{t("app.pos.ikpu")}:</span>
                                <span>{item.class_code}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className=" pt-3 mb-4">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{t("app.pos.amount")}:</span>
                        <span>
                          {(
                            Number(
                              selectedReceipt?.received_cash
                                .toString()
                                .slice(0, -2)
                            ) +
                            Number(
                              selectedReceipt?.received_card
                                .toString()
                                .slice(0, -2)
                            )
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.paid")}:</span>
                        <span>
                          {(
                            Number(
                              selectedReceipt?.received_cash
                                .toString()
                                .slice(0, -2)
                            ) +
                            Number(
                              selectedReceipt?.received_card
                                .toString()
                                .slice(0, -2)
                            )
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.cash")}:</span>
                        <span>
                          {Number(
                            selectedReceipt?.received_cash
                              .toString()
                              .slice(0, -2)
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.card")}:</span>
                        <span>
                          {Number(
                            selectedReceipt?.received_card
                              .toString()
                              .slice(0, -2)
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.bonus_card")}:</span>
                        {/* bonus price */}
                        <span>
                          {selectedReceipt?.payments
                            ?.find(
                              (payment: any) =>
                                payment.payment_type?.name === "Бонусы"
                            )
                            ?.price?.toLocaleString("ru-RU") || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.bonus_card_number")}:</span>
                        <span>{selectedReceipt?.card_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fiscal Details */}
                  <div className=" pt-3 mb-4">
                    <div className="text-center text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>{t("app.pos.fm")}:</span>{" "}
                        <span>{selectedReceipt?.terminal_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.fp")}:</span>{" "}
                        <span>414675046328</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("app.pos.receipt_number")} №:</span>
                        <span>
                          {selectedReceipt?.receipt_seq || selectedReceipt?.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>S/N:</span>{" "}
                        <span>{selectedReceipt?.terminal_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsErrorModalOpen(false);
            }
          }}
        >
          <div className="bg-white shadow-2xl max-w-md rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center relative">
              <h2 className="text-lg font-semibold text-red-600">
                {t("app.pos.sync_error")}
              </h2>
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4 " />
              </button>
            </div>

            {/* Error Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Info className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedReceipt?.error_1c || t("app.pos.sync_error_message")}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                {t("app.pos.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Calendar Modal for From Date */}
      {mobileCalendarOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t("app.pos.from")}</h3>
              <button
                onClick={() => setMobileCalendarOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              captionLayout="dropdown"
              className="w-full mobile-calendar-modal"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  const formatted = `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                    2,
                    "0"
                  )}`;

                  setDate(formatted);
                  setMobileCalendarOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile Calendar Modal for To Date */}
      {mobileCalendarOpen2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t("app.pos.to")}</h3>
              <button
                onClick={() => setMobileCalendarOpen2(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <Calendar
              mode="single"
              selected={date2 ? new Date(date2) : undefined}
              captionLayout="dropdown"
              className="w-full mobile-calendar-modal"
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  const formatted = `${selectedDate.getFullYear()}-${String(
                    selectedDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                    2,
                    "0"
                  )}`;

                  setDate2(formatted);
                  setMobileCalendarOpen2(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsContent;
