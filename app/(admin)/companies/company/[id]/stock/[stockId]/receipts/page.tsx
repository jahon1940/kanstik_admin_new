"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ChevronDownIcon, Info, Filter, ChevronLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "@/components/ui/pagination";
import { log } from "util";

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

// Product type
type Product = {
  id: number;
  title: string;
  classifier_title: string;
  price: number;
  quantity: number;
  remaining: number;
};

// Company type
type Company = {
  id: number;
  name: string;
  phone_number: string;
  card_numbers: any[];
  card_number: string;
};

// PaymentType type
type PaymentType = {
  id: number;
  name: string;
  image_url: string;
};

export default function StockReceiptsPage() {
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

  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  const params = useParams();
  const router = useRouter();

  // Modal state for receipt details
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(
    null
  );

  // Product selection states
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 50,
    hasNext: false,
    hasPrevious: false,
  });

  // Company selection states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchTimer, setSearchTimer] = React.useState<NodeJS.Timeout | null>(
    null
  );

  // Payment Type selection states
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] =
    React.useState(false);
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<PaymentType | null>(null);
  const [paymentTypes, setPaymentTypes] = React.useState<PaymentType[]>([]);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

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

    // Prepare search data
    const searchData = {
      receipt_number: null,
      from_date: date,
      to_date: date2,
      payment_type_id: selectedPaymentType ? selectedPaymentType.id : null,
      product_id: selectedProduct ? selectedProduct.id : null,
      card_number: selectedCompany ? selectedCompany.card_number : null,
      page: page,
      page_size: pageSize,
    };

    console.log(searchData);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(searchData),
      redirect: "follow",
    };
    fetch(
      `${BASE_URL}/v1/admins/receipts/search?stock_id=${params.stockId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log("Receipts API Response:", result);

        console.log(result);

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

  const getSearchProducts = async (
    searchData: any,
    page: number = 1,
    pageSize: number = 50,
    append: boolean = false
  ) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const searchDataWithPagination = {
        ...searchData,
        page: page,
        page_size: pageSize,
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(searchDataWithPagination),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/products/search`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("app.pos.search_error"));
      }

      if (append && page > 1) {
        // Append new results to existing ones for "Show More" functionality
        setProducts((prevProducts) => [
          ...prevProducts,
          ...(result.results || result || []),
        ]);
      } else {
        // Replace results for normal pagination
        setProducts(result.results || result || []);
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
      setProductsPagination(paginationData);

      return result;
    } catch (error: any) {
      const msg = error?.message || t("app.pos.product_search_error");
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearch = async (
    searchTerm: string = "",
    page: number = 1
  ) => {
    try {
      setLoading(true);
      const searchData = {
        title: searchTerm,
      };
      await getSearchProducts(searchData, page);
    } catch (error) {
      // Error handled in getSearchProducts
    } finally {
      setLoading(false);
    }
  };

  const handleProductModalOpen = () => {
    setIsProductModalOpen(true);
    // Modal ochilganda darhol bo'sh search bilan API so'rov jo'natish
    handleProductSearch("", 1);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // Set new timer for debounce (500ms delay)
    const newTimer = setTimeout(() => {
      handleProductSearch(value, 1);
    }, 500);

    setSearchTimer(newTimer);
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, [searchTimer]);

  const getCompanies = async () => {
    try {
      setLoading(true);

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

      const response = await fetch(
        `${BASE_URL}/v1/admins/companies`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("app.pos.companies_load_error"));
      }

      setCompanies(result.results || result || []);
      return result;
    } catch (error: any) {
      const msg = error?.message || t("app.pos.companies_load_error");
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypes = async () => {
    try {
      setLoading(true);

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

      const response = await fetch(
        `${BASE_URL}/v1/admins/payment-types`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || t("app.pos.payment_types_load_error")
        );
      }

      console.log(result);

      setPaymentTypes(result.results || result || []);
      return result;
    } catch (error: any) {
      const msg = error?.message || t("app.pos.payment_types_load_error");
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    if (date && date2) {
      setReceipts([]);
      getReceipts(date, date2, 1, 50);
      setIsFilterModalOpen(false);
    } else {
      toast.error(t("app.pos.select_date_range"));
    }
  };
  // useEffect(() => {
  //   // getSearchProducts funksiyasini kerakli parametr bilan chaqiring
  //   const searchData = {
  //     title: "premium",
  //   };
  //   getSearchProducts(searchData);
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
            <div className="w-full mt-0">
              <div className="space-y-4">
                <div className="bg-bgColor flex justify-between">
                  <h2 className="text-sm md:text-base font-medium  text-black rounded-sm p-2 px-3">
                    {t("app.pos.receipts")}
                  </h2>
                </div>

                {/* Mobile Filter Button */}
                <div className="md:hidden flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsFilterModalOpen(true)}
                      variant="outline"
                      className="cursor-pointer text-sm px-3 py-2 flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {t("app.pos.filter")}
                    </Button>
                  </div>
                </div>

                {/* Desktop Filters - responsive */}
                <div className="hidden md:flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start">
                  <div className="flex gap-2">
                    {/* select company */}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCompanyModalOpen(true);
                          if (companies.length === 0) {
                            getCompanies();
                          }
                        }}
                        className="w-48 justify-between font-normal text-sm overflow-hidden"
                      >
                        {selectedCompany
                          ? selectedCompany.name
                          : t("app.pos.select_company")}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* select product */}
                    <div>
                      <Button
                        variant="outline"
                        onClick={handleProductModalOpen}
                        className="w-48 justify-between font-normal text-sm overflow-hidden"
                      >
                        {selectedProduct
                          ? selectedProduct.classifier_title
                          : t("app.pos.select_product")}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* select payment Type */}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsPaymentTypeModalOpen(true);
                          if (paymentTypes.length === 0) {
                            getPaymentTypes();
                          }
                        }}
                        className="w-30 justify-between font-normal text-sm"
                      >
                        {selectedPaymentType
                          ? selectedPaymentType.name
                          : t("app.pos.select_payment_type")}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="w-[49%] sm:w-30 justify-between font-normal text-sm"
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
                          className="w-[49%] sm:w-30 justify-between font-normal text-sm"
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
                      className="cursor-pointer text-sm px-3 py-2 hidden md:block"
                    >
                      {t("app.pos.download_report")}
                    </Button>
                    <Button
                      onClick={() => {
                        if (date) downloadReceipts(date);
                      }}
                      className="cursor-pointer text-sm px-3 py-2 hidden md:block"
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
                  <table className="w-full text-sm relative border-separate border-spacing-y-2">
                    <thead className="sticky -top-[16px] z-10 bg-bgColor">
                      <tr>
                        <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                          №
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Операция
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Номер чека
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Дата и время
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Тип оплаты
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Наличные
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Картой
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          Сумма
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                          Статус 1С
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
                          <td className="border border-border border-r-0 rounded-l-lg">
                            <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                              {(receiptsPagination.currentPage - 1) *
                                receiptsPagination.pageSize +
                                index +
                                1}
                            </div>
                          </td>
                          <td className="border border-border px-4 py-2">
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
                          <td className="border border-border px-4 py-4">
                            <h2>{org?.receipt_seq}</h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            <h2> {formatDate(org?.close_time)}</h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            {" "}
                            <h2>
                              {org?.payments?.map((type: any) => {
                                return type.payment_type.name + " ";
                              })}
                            </h2>
                          </td>
                          <td className="border border-border px-4 py-4">
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
                          <td className="border border-border px-4 py-4">
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
                          <td className="border border-border px-4 py-4">
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
                          <td className="border border-border border-l-0 rounded-r-lg px-4 py-4">
                            {org?.sent_to_1c ? (
                              <span className="text-green-500">Отправлено</span>
                            ) : (
                              <span className="text-red-500">
                                Не отправлено
                              </span>
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
                        <Info /> {selectedReceipt?.receipt_seq}
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
                            <div className="text-center font-semibold mb-2">
                              Товары
                            </div>
                            <div className="space-y-2">
                              {selectedReceipt?.products?.map(
                                (item: any, index) => {
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
                                            {item.price /
                                              item.quantity.toLocaleString(
                                                "ru-RU"
                                              )}
                                          </div>
                                        </div>
                                        <div className="text-right ml-2">
                                          <div className="font-semibold">
                                            {item.price?.toLocaleString(
                                              "ru-RU"
                                            )}
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
                                }
                              )}
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

              {/* Product Selection Modal */}
              {isProductModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsProductModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl max-w-[90%] w-full h-[95vh] overflow-hidden relative">
                    <button
                      onClick={() => setIsProductModalOpen(false)}
                      className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 text-2xl cursor-pointer float-end"
                    >
                      ×
                    </button>
                    {/* Search Section */}
                    <div className="p-6 border-b">
                      <div className="flex gap-3 justify-between">
                        <input
                          type="text"
                          placeholder={t("app.pos.enter_product_name")}
                          value={searchQuery}
                          onChange={(e) =>
                            handleSearchInputChange(e.target.value)
                          }
                          className="w-[80%] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-auto max-h-120">
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loading />
                        </div>
                      ) : products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {t("app.pos.no_products_found")}
                        </div>
                      ) : (
                        <table className="w-full text-sm relative border-separate border-spacing-y-2">
                          <thead className="sticky top-[0px] z-10 bg-bgColor">
                            <tr>
                              <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                                №
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.product_name_article")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.product_classifier")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.remaining_reserve")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                                {t("app.pos.price")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product: Product, index: number) => (
                              <tr
                                key={product.id}
                                className="hover:bg-accent/50 cursor-pointer"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsProductModalOpen(false);
                                  toast.success(
                                    `${product.classifier_title} ${t(
                                      "app.pos.selected"
                                    )}`
                                  );
                                }}
                              >
                                <td className="border border-border border-r-0 rounded-l-lg">
                                  <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                                    {(productsPagination.currentPage - 1) *
                                      productsPagination.pageSize +
                                      index +
                                      1}
                                  </div>
                                </td>
                                <td className="border border-border px-4 py-3">
                                  <div>
                                    <div className="font-medium text-sm">
                                      {product.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {t("app.pos.article")}: {product.id}
                                    </div>
                                  </div>
                                </td>
                                <td className="border border-border px-4 py-3">
                                  <div className="text-sm">
                                    {product.classifier_title}
                                  </div>
                                </td>
                                <td className="border border-border px-4 py-3">
                                  <div className="text-sm">
                                    {t("app.pos.remaining_reserve")}:{" "}
                                    {product.remaining || 0}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {t("app.pos.own")}: {product.quantity || 0}
                                  </div>
                                </td>
                                <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                                  <div className="font-semibold text-sm">
                                    {product.price?.toLocaleString("ru-RU") ||
                                      0}{" "}
                                    {t("app.pos.currency")}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Product Pagination */}
                    {products.length > 0 &&
                      productsPagination.totalPages > 1 && (
                        <div className="p-4 border-t">
                          <Pagination
                            currentPage={productsPagination.currentPage}
                            totalPages={productsPagination.totalPages}
                            onPageChange={(page) => {
                              handleProductSearch(searchQuery, page);
                            }}
                            showMoreItems={
                              productsPagination.currentPage <
                                productsPagination.totalPages ||
                              (productsPagination.totalPages === 1 &&
                                productsPagination.totalItems >
                                  productsPagination.pageSize) ||
                              productsPagination.totalItems > products.length
                                ? productsPagination.pageSize
                                : 0
                            }
                            onShowMore={() => {
                              if (
                                productsPagination.currentPage <
                                  productsPagination.totalPages ||
                                (productsPagination.totalPages === 1 &&
                                  productsPagination.totalItems >
                                    productsPagination.pageSize) ||
                                productsPagination.totalItems > products.length
                              ) {
                                getSearchProducts(
                                  { title: searchQuery },
                                  productsPagination.currentPage + 1,
                                  productsPagination.pageSize,
                                  true // append = true for "Show More" functionality
                                );
                              }
                            }}
                            disabled={loading}
                            className="mt-4"
                          />
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Company Selection Modal */}
              {isCompanyModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsCompanyModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("app.pos.select_company")}
                      </h2>
                      <button
                        onClick={() => setIsCompanyModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    {/* Companies Table */}
                    <div className="overflow-auto max-h-96">
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loading />
                        </div>
                      ) : companies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {t("app.pos.no_companies_found")}
                        </div>
                      ) : (
                        <table className="w-full text-sm relative border-separate border-spacing-y-2">
                          <thead className="sticky top-[0px] z-10 bg-bgColor">
                            <tr>
                              <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                                №
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.company_name")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.phone_number")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                                {t("app.pos.card_number")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {companies.map(
                              (company: Company, index: number) => (
                                <tr
                                  key={company.id}
                                  className="hover:bg-accent/50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setIsCompanyModalOpen(false);
                                    toast.success(
                                      `${company.name} ${t("app.pos.selected")}`
                                    );
                                  }}
                                >
                                  <td className="border border-border border-r-0 rounded-l-lg">
                                    <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="border border-border px-4 py-3">
                                    <div className="font-medium text-sm">
                                      {company.name}
                                    </div>
                                  </td>
                                  <td className="border border-border px-4 py-3">
                                    <div className="text-sm">
                                      {company.phone_number || "-"}
                                    </div>
                                  </td>
                                  <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                                    <div className="text-sm">
                                      {company?.card_numbers[0]?.card_number ||
                                        "-"}
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Type Selection Modal */}
              {isPaymentTypeModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsPaymentTypeModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("app.pos.select_payment_type")}
                      </h2>
                      <button
                        onClick={() => setIsPaymentTypeModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    {/* Payment Types Table */}
                    <div className="overflow-auto max-h-96">
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loading />
                        </div>
                      ) : paymentTypes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {t("app.pos.no_payment_types_found")}
                        </div>
                      ) : (
                        <table className="w-full text-sm relative border-separate border-spacing-y-2">
                          <thead className="sticky top-[0px] z-10 bg-bgColor">
                            <tr>
                              <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                                №
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                                {t("app.pos.payment_type_image")}
                              </th>
                              <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
                                {t("app.pos.payment_type_name")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentTypes.map(
                              (paymentType: PaymentType, index: number) => (
                                <tr
                                  key={paymentType.id}
                                  className="hover:bg-accent/50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedPaymentType(paymentType);
                                    setIsPaymentTypeModalOpen(false);
                                    toast.success(
                                      `${paymentType.name} ${t(
                                        "app.pos.selected"
                                      )}`
                                    );
                                  }}
                                >
                                  <td className="border border-border border-r-0 rounded-l-lg">
                                    <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="border border-border px-4 py-3">
                                    <div className="flex items-center">
                                      {paymentType.image_url ? (
                                        <Image
                                          src={
                                            paymentType.image_url
                                              ? `${BASE_URL}${paymentType.image_url}`
                                              : "/images/nophoto.png" // yoki default rasm
                                          }
                                          width={28}
                                          height={28}
                                          alt={paymentType.name || "image"}
                                          className="w-8 h-8 object-contain"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                          <Image
                                            src={
                                              paymentType.image_url
                                                ? `${BASE_URL}${paymentType.image_url}`
                                                : "/images/nophoto.png" // yoki default rasm
                                            }
                                            width={28}
                                            height={28}
                                            alt={paymentType.name || "image"}
                                            className="w-8 h-8 object-contain"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                                    <div className="font-medium text-sm">
                                      {paymentType.name}
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Modal - Mobile Only */}
              {isFilterModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsFilterModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("app.pos.filter_receipts")}
                      </h2>
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    {/* Filter Content */}
                    <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                      <div className="space-y-6">
                        {/* Date Range */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            {t("app.pos.date_range")}
                          </h3>
                          <div className="flex gap-3">
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-[48%] sm:w-full justify-between font-normal text-sm"
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
                                  className="w-[48%] sm:w-full justify-between font-normal text-sm"
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
                        </div>

                        {/* Company Selection */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            {t("app.pos.company")}
                          </h3>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCompanyModalOpen(true);
                              if (companies.length === 0) {
                                getCompanies();
                              }
                            }}
                            className="w-full justify-between font-normal text-sm"
                          >
                            {selectedCompany
                              ? selectedCompany.name
                              : t("app.pos.select_company")}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Product Selection */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            {t("app.pos.product")}
                          </h3>
                          <Button
                            variant="outline"
                            onClick={handleProductModalOpen}
                            className="w-full justify-between font-normal text-sm"
                          >
                            {selectedProduct
                              ? selectedProduct.classifier_title
                              : t("app.pos.select_product")}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Payment Type Selection */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-3">
                            {t("app.pos.payment_type")}
                          </h3>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsPaymentTypeModalOpen(true);
                              if (paymentTypes.length === 0) {
                                getPaymentTypes();
                              }
                            }}
                            className="w-full justify-between font-normal text-sm"
                          >
                            {selectedPaymentType
                              ? selectedPaymentType.name
                              : t("app.pos.select_payment_type")}
                            <ChevronDownIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t flex flex-col gap-2">
                      <Button onClick={handleFilterApply} className="px-6">
                        {t("app.pos.generate_receipts")}
                      </Button>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
