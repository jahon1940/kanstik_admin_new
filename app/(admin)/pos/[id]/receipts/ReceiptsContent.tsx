"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { ChevronDownIcon, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

// Receipt type
type Receipt = {
  id: number;
  receipt_seq: string;
  received_cash: number;
  received_card: number;
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
  terminal_id: string;
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

  console.log(selectedReceipt);
  

  return (
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
          <table className="w-full border border-gray-300 text-sm">
            <thead className="sticky top-[0px] z-10 bg-bgColor">
              <tr>
                <th className="text-left font-semibold px-4 py-3  border-r border-gray-300">
                  №
                </th>
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
              {receipts?.map((org: any, index: number) => (
                <tr
                  key={org?.id}
                  className="hover:bg-accent/50 cursor-pointer  border-gray-300"
                  onClick={() => {
                    setSelectedReceipt(org);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-4 py-4 border-r border-gray-300">
                    <h2>
                      {(receiptsPagination.currentPage - 1) *
                        receiptsPagination.pageSize +
                        index +
                        1}
                    </h2>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-300">
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
                    <h2>
                      {Number(
                        org?.received_cash.toString().slice(0, -2)
                      ).toLocaleString("ru-RU")}{" "}
                      сум
                    </h2>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-300">
                    <h2>
                      {" "}
                      {Number(
                        org?.received_card.toString().slice(0, -2)
                      ).toLocaleString("ru-RU")}{" "}
                      сум
                    </h2>
                  </td>
                  <td className="px-4 py-4 border-r border-gray-300">
                    <h2>
                      {(
                        Number(org?.received_cash.toString().slice(0, -2)) +
                        Number(org?.received_card.toString().slice(0, -2))
                      ).toLocaleString("ru-RU")}{" "}
                      сум
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
                getReceipts(date, date2, page, receiptsPagination.pageSize);
              }
            }}
            showMoreItems={
              receiptsPagination.currentPage < receiptsPagination.totalPages ||
              (receiptsPagination.totalPages === 1 &&
                receiptsPagination.totalItems > receiptsPagination.pageSize) ||
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
            }
          }}
        >
          <div className="bg-bgColor rounded-lg shadow-2xl max-w-md w-full h-full  overflow-auto">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-1  flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2 text-green-600 text-sm">
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
                    ? " Отправлен на сервер Синхронизирован с 1С"
                    : "Не синхронизирован"}
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
                    <div className="text-lg font-bold">Продажа</div>
                    <div className="text-xs text-gray-600">Kanstik</div>
                  </div>

                  {/* Receipt Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Дата и время:</span>
                      <span className="font-semibold">
                        {formatDate(selectedReceipt.close_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ИНН/ПИНФЛ:</span>
                      <span>{selectedReceipt.fiscal_sign}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Кассир:</span>
                      <span className="text-right max-w-[200px]">
                        {selectedReceipt.staff_name}
                      </span>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className=" pt-3 mb-4">
                    <div className="text-center font-semibold mb-2">Товары</div>
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
                                  {item.quantity}.0 шт. х{" "}
                                  {item.product.price?.toLocaleString("ru-RU")}
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
                                <span>НДС: ({item.vat_percent})</span>
                                <span>{item.vat}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>ИКПУ:</span>
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
                        <span>Сумма:</span>
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
                        <span>Оплачено:</span>
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
                        <span>Наличные:</span>
                        <span>
                          {Number(
                            selectedReceipt?.received_cash
                              .toString()
                              .slice(0, -2)
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Картой:</span>
                        <span>
                          {Number(
                            selectedReceipt?.received_card
                              .toString()
                              .slice(0, -2)
                          ).toLocaleString("ru-RU")}{" "}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Бон. картой:</span>
                        <span>0</span>
                      </div>
                    </div>
                  </div>

                  {/* Fiscal Details */}
                  <div className=" pt-3 mb-4">
                    <div className="text-center text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>ФМ:</span>{" "}
                        <span>{selectedReceipt?.terminal_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ФП:</span> <span>414675046328</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Чек №:</span>{" "}
                        <span>{selectedReceipt.receipt_seq}</span>
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
    </div>
  );
};

export default ReceiptsContent;
