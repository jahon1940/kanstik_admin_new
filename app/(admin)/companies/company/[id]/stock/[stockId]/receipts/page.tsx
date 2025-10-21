"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  ChevronDownIcon,
  Info,
  Filter,
  ChevronLeft,
  X,
  Search,
} from "lucide-react";
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
  error_1c?: string;
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

  // Error modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);

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
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  });

  // Company selection states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [companiesPagination, setCompaniesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  });
  const [companySearchQuery, setCompanySearchQuery] = React.useState("");
  const [companySearchTimer, setCompanySearchTimer] =
    React.useState<NodeJS.Timeout | null>(null);
  const [productSearchQuery, setProductSearchQuery] = React.useState("");
  const [productSearchTimer, setProductSearchTimer] =
    React.useState<NodeJS.Timeout | null>(null);

  // Payment Type selection states
  const [isPaymentTypeModalOpen, setIsPaymentTypeModalOpen] =
    React.useState(false);
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<PaymentType | null>(null);
  const [paymentTypes, setPaymentTypes] = React.useState<PaymentType[]>([]);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  // Receipt search state
  const [receiptSearchNumber, setReceiptSearchNumber] = React.useState("");

  const getReceipts = (
    date: string = "",
    date2: string = "",
    page: number = 1,
    pageSize: number = 50,
    append: boolean = false,
    receiptNumber: string = ""
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
      receipt_number: receiptNumber || null,
      from_date: date || null,
      to_date: date2 || null,
      payment_type_id: selectedPaymentType ? selectedPaymentType.id : null,
      product_id: selectedProduct ? selectedProduct.id : null,
      card_number: selectedCompany ? selectedCompany.card_number : null,
      page: page,
      page_size: pageSize,
    };

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
          e?.response?.data?.message || e?.message || t("toast.network_error");
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
    append: boolean = false
  ) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(searchData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/products/search?page=${page}&page_size=20`,
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

      console.log(result);

      // Update pagination state
      const paginationData = {
        currentPage: result.current_page || result.page || page,
        totalPages:
          result.total_pages ||
          result.totalPages ||
          Math.ceil(
            (result.total || result.count || 0) /
              (result.page_size || result.pageSize || 20)
          ) ||
          1,
        totalItems: result.total_items || result.total || result.count || 0,
        pageSize: result.page_size || result.pageSize || 20,
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

  console.log(productsPagination);

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

  const handleProductSearchInputChange = (value: string) => {
    setProductSearchQuery(value);

    // Clear existing timer
    if (productSearchTimer) {
      clearTimeout(productSearchTimer);
    }

    // Set new timer for debounce (500ms delay)
    const newTimer = setTimeout(() => {
      handleProductSearch(value, 1);
    }, 500);

    setProductSearchTimer(newTimer);
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (companySearchTimer) {
        clearTimeout(companySearchTimer);
      }
      if (productSearchTimer) {
        clearTimeout(productSearchTimer);
      }
    };
  }, [companySearchTimer, productSearchTimer]);

  const getCompanies = async (searchTerm: string = "", page: number = 1) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      // Prepare search data
      const searchData = {
        search: searchTerm,
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        body: JSON.stringify(searchData),
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/companies/search?page=${page}&page_size=20`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("app.pos.companies_load_error"));
      }

      setCompanies(result.results || result || []);

      console.log(result);

      // Update pagination for companies
      setCompaniesPagination({
        currentPage: result.current_page || result.page || page,
        totalPages:
          result.total_pages ||
          result.totalPages ||
          Math.ceil((result.total || result.count || 0) / 20) ||
          1,
        totalItems: result.total_items || result.total || result.count || 0,
        pageSize: result.page_size || result.pageSize || 20,
        hasNext:
          result.has_next ||
          result.hasNext ||
          (result.current_page || result.page || page) <
            (result.total_pages || result.totalPages || 1),
        hasPrevious:
          result.has_previous ||
          result.hasPrevious ||
          (result.current_page || result.page || page) > 1,
      });

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
    setReceipts([]);
    getReceipts(date, date2, 1, 50, false, receiptSearchNumber);
    setIsFilterModalOpen(false);
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

  // Mobile calendar states
  const [mobileCalendarOpen, setMobileCalendarOpen] = React.useState(false);
  const [mobileCalendarOpen2, setMobileCalendarOpen2] = React.useState(false);

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
                <div className="bg-bgColor flex flex-col md:flex-row justify-between gap-2">
                  {/* search receipts */}
                  <div className="text-sm md:text-base font-medium text-black rounded-sm p-2 px-3 w-full">
                    <form
                      className="flex gap-3 w-full"
                      role="search"
                      aria-label={t("app.search")}
                      onSubmit={(e) => {
                        e.preventDefault();
                        setReceipts([]);
                        getReceipts(
                          date,
                          date2,
                          1,
                          50,
                          false,
                          receiptSearchNumber
                        );
                      }}
                    >
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background w-215">
                        <Search size={16} className="text-muted-foreground" />
                        <input
                          type="search"
                          className="w-full bg-transparent outline-none"
                          aria-label={t("app.search")}
                          value={receiptSearchNumber}
                          onChange={(e) =>
                            setReceiptSearchNumber(e.target.value)
                          }
                          placeholder={t("app.pos.search_receipt_number")}
                        />
                      </div>
                      <Button type="submit" className="px-3 py-2 text-sm h-10">
                        {t("app.pos.search")}
                      </Button>
                    </form>
                  </div>
                  {/* Mobile Filter Button */}
                  <div className="md:hidden flex justify-center items-center w-full md:w-auto">
                    <Button
                      onClick={() => setIsFilterModalOpen(true)}
                      variant="outline"
                      className="cursor-pointer text-[12px] px-3 py-2 flex items-center gap-2 w-full justify-center"
                    >
                      <Filter className="h-4 w-4 " />
                      {t("app.pos.filter")}
                    </Button>
                  </div>
                </div>

                {/* Desktop Filters - responsive */}
                <div className="hidden md:flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {/* select company */}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCompanyModalOpen(true);
                          if (companies.length === 0) {
                            getCompanies("", 1);
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
                          : selectedPaymentType === null
                          ? t("app.pos.all")
                          : t("app.pos.select_payment_type")}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Desktop Calendar */}
                    <div className="hidden md:contents">
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
                            className="w-[49%] sm:w-30 justify-between font-normal text-sm"
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
                    <div className="md:hidden flex gap-2">
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
                        setReceipts([]);
                        getReceipts(
                          date,
                          date2,
                          1,
                          50,
                          false,
                          receiptSearchNumber
                        );
                      }}
                      className="cursor-pointer text-sm px-3 py-2"
                    >
                      {t("app.pos.generate_receipts")}
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
                          {t("app.pos.operation")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.receipt_number")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.date_time")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.payment_type")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.cash")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.card")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border border-gray-300 border-l-0">
                          {t("app.pos.amount")}
                        </th>
                        <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300 border border-l-0 rounded-r-lg">
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
                          <td className="border border-border border-r-0 rounded-l-lg">
                            <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                              {(receiptsPagination.currentPage - 1) *
                                receiptsPagination.pageSize +
                                index +
                                1}
                            </div>
                          </td>
                          <td className="border border-border px-4 py-2">
                            <h2 className="text-green-500">
                              {t("app.pos.sale")}
                            </h2>{" "}
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
                          <td className="border border-border px-4 py-4">
                            <h2>{org?.receipt_seq}</h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            <h2> {formatDate(org?.close_time)}</h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            {" "}
                            <h2>
                              {org?.payments?.map((type: any, index: number) => {
                                 if (index > 0) {
                                   return " / " + type.payment_type.name;
                                 } else {
                                   return type.payment_type.name;
                                 }
                              })}
                            </h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            {/* <h2>
                            {org?.payments.map((item) => {
                              if (item.payment_type.name === "Cash") {

                                return item.price.toLocaleString("ru-RU");
                              } else {
                                return 0;
                              }
                            })}{" "}
                            сум
                          </h2> */}
                            <h2>
                              {Number(
                                org?.received_cash.toString().slice(0, -2)
                              ).toLocaleString("ru-RU")}{" "}
                              {t("app.pos.sum")}
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
                              {Number(
                                org?.received_card.toString().slice(0, -2)
                              ).toLocaleString("ru-RU")}{" "}
                              {t("app.pos.sum")}
                            </h2>
                          </td>
                          <td className="border border-border px-4 py-4">
                            <h2>
                              {(
                                Number(
                                  org?.received_cash.toString().slice(0, -2)
                                ) +
                                Number(
                                  org?.received_card.toString().slice(0, -2)
                                )
                              ).toLocaleString("ru-RU")}{" "}
                              {t("app.pos.sum")}
                              {/* {org?.received_cash +
                              org?.received_card.toLocaleString("ru-RU")}
                            сум */}
                            </h2>
                          </td>
                          <td className="border border-border border-l-0 rounded-r-lg px-4 py-4">
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

                {/* Pagination */}
                {!loading &&
                  receipts?.length > 0 &&
                  receiptsPagination.totalPages > 1 && (
                    <Pagination
                      currentPage={receiptsPagination.currentPage}
                      totalPages={receiptsPagination.totalPages}
                      onPageChange={(page) => {
                        getReceipts(
                          date,
                          date2,
                          page,
                          receiptsPagination.pageSize,
                          false,
                          receiptSearchNumber
                        );
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
                          receiptsPagination.currentPage <
                            receiptsPagination.totalPages ||
                          (receiptsPagination.totalPages === 1 &&
                            receiptsPagination.totalItems >
                              receiptsPagination.pageSize) ||
                          receiptsPagination.totalItems > receipts.length
                        ) {
                          getReceipts(
                            date,
                            date2,
                            receiptsPagination.currentPage + 1,
                            receiptsPagination.pageSize,
                            true, // append = true for "Show More" functionality
                            receiptSearchNumber
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
                  <div className="bg-bgColor rounded-lg shadow-2xl max-w-md w-[80%] sm:w-full h-full  overflow-auto">
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
                            <div className="text-lg font-bold">
                              {t("app.pos.sale")}
                            </div>
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
                                            {item.quantity}.0 {t("app.pos.pcs")}{" "}
                                            х{" "}
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
                                          <span>
                                            {t("app.pos.vat")}: (
                                            {item.vat_percent})
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
                                }
                              )}
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
                                <span>0</span>
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
                                <span>{t("app.pos.receipt_number")} №:</span>{" "}
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
                  <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-red-600">
                        {t("app.pos.sync_error")}
                      </h2>
                      <button
                        onClick={() => setIsErrorModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    {/* Error Content */}
                    <div className="p-6">
                      <div className="text-center">
                        <div className="text-red-500 mb-4">
                          <Info className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedReceipt?.error_1c ||
                            t("app.pos.sync_error_message")}
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

              {/* Product Selection Modal */}
              {isProductModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsProductModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh]  flex flex-col modal-container relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gray-50 flex-shrink-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                        {t("app.pos.select_product")}
                      </h2>
                      <button
                        onClick={() => setIsProductModalOpen(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Search Section */}
                    <div className="p-4 md:p-6 border-b bg-white flex-shrink-0">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder={t("app.pos.enter_product_name")}
                          value={productSearchQuery}
                          onChange={(e) =>
                            handleProductSearchInputChange(e.target.value)
                          }
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        />
                        {productSearchQuery && (
                          <button
                            onClick={() => {
                              setProductSearchQuery("");
                              handleProductSearch("", 1);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Products Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 modal-scroll-container modal-content-scrollable">
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loading />
                        </div>
                      ) : products.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-lg mb-2">
                            {t("app.pos.no_products_found")}
                          </div>
                          <div className="text-sm">
                            {t("app.pos.try_different_search")}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden md:block px-5">
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
                                {products.map(
                                  (product: Product, index: number) => (
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
                                          {(productsPagination.currentPage -
                                            1) *
                                            productsPagination.pageSize +
                                            index +
                                            1}
                                        </div>
                                      </td>
                                      <td className="border border-border px-4 py-3">
                                        <div className="font-medium text-sm">
                                          {product.title}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {t("app.pos.article")}: {product.id}
                                        </div>
                                      </td>
                                      <td className="border border-border px-4 py-3">
                                        <div className="text-sm">
                                          {product.classifier_title}
                                        </div>
                                      </td>
                                      <td className="border border-border px-4 py-3">
                                        <div className="text-sm">
                                          {product.remaining || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {t("app.pos.own")}:{" "}
                                          {product.quantity || 0}
                                        </div>
                                      </td>
                                      <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                                        <div className="font-semibold text-sm">
                                          {product.price?.toLocaleString(
                                            "ru-RU"
                                          ) || 0}{" "}
                                          {t("app.pos.currency")}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="md:hidden">
                            <div className="space-y-3 p-4">
                              {products.map(
                                (product: Product, index: number) => (
                                  <div
                                    key={product.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <h3 className="font-medium text-base text-gray-900 mb-1">
                                          {product.classifier_title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-1">
                                          {product.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {t("app.pos.article")}: {product.id}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-lg text-gray-900">
                                          {product.price?.toLocaleString(
                                            "ru-RU"
                                          ) || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {t("app.pos.currency")}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                      <div className="text-sm">
                                        <span className="text-gray-600">
                                          {t("app.pos.remaining_reserve")}:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {product.remaining || 0}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-gray-600">
                                          {t("app.pos.own")}:{" "}
                                        </span>
                                        <span className="font-medium">
                                          {product.quantity || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {/* Product Pagination */}
                      {!loading &&
                        products.length > 0 &&
                        productsPagination.totalPages > 1 && (
                          <div className="p-4 border-t">
                            <Pagination
                              currentPage={productsPagination.currentPage}
                              totalPages={productsPagination.totalPages}
                              onPageChange={(page) => {
                                handleProductSearch(productSearchQuery, page);
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
                                  productsPagination.totalItems >
                                    products.length
                                ) {
                                  getSearchProducts(
                                    { title: productSearchQuery },
                                    productsPagination.currentPage + 1,
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
                </div>
              )}

              {/* Company Selection Modal */}
              {isCompanyModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsCompanyModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col modal-container overflow-hidden relative">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gray-50 flex-shrink-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                        {t("app.pos.select_company")}
                      </h2>
                      <button
                        onClick={() => setIsCompanyModalOpen(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="p-4 md:p-6 border-b bg-white flex-shrink-0">
                      <div className="relative">
                        <input
                          type="text"
                          value={companySearchQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCompanySearchQuery(value);

                            // Clear previous timer
                            if (companySearchTimer) {
                              clearTimeout(companySearchTimer);
                            }

                            // Set new timer for debounced search
                            const newTimer = setTimeout(() => {
                              getCompanies(value, 1);
                            }, 500);

                            setCompanySearchTimer(newTimer);
                          }}
                          placeholder={t("app.pos.enter_company_name")}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        />
                        {companySearchQuery && (
                          <button
                            onClick={() => {
                              setCompanySearchQuery("");
                              getCompanies("", 1);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Companies Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 modal-scroll-container modal-content-scrollable">
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loading />
                        </div>
                      ) : companies.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-lg mb-2">
                            {t("app.pos.no_companies_found")}
                          </div>
                          <div className="text-sm">
                            {t("app.pos.try_different_search")}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden md:block px-5">
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
                                          `${company.name} ${t(
                                            "app.pos.selected"
                                          )}`
                                        );
                                      }}
                                    >
                                      <td className="border border-border border-r-0 rounded-l-lg">
                                        <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                                          {(companiesPagination.currentPage -
                                            1) *
                                            20 +
                                            index +
                                            1}
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
                                          {company?.card_numbers[0]
                                            ?.card_number || "-"}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="md:hidden">
                            <div className="space-y-3 p-4">
                              {companies.map(
                                (company: Company, index: number) => (
                                  <div
                                    key={company.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                      setSelectedCompany(company);
                                      setIsCompanyModalOpen(false);
                                      toast.success(
                                        `${company.name} ${t(
                                          "app.pos.selected"
                                        )}`
                                      );
                                    }}
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <h3 className="font-medium text-base text-gray-900 mb-2">
                                          {company.name}
                                        </h3>
                                        <div className="space-y-1">
                                          <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium mr-2">
                                              {t("app.pos.phone_number")}:
                                            </span>
                                            <span>
                                              {company.phone_number || "-"}
                                            </span>
                                          </div>
                                          <div className="flex items-center text-sm text-gray-600">
                                            <span className="font-medium mr-2">
                                              {t("app.pos.card_number")}:
                                            </span>
                                            <span>
                                              {company?.card_numbers[0]
                                                ?.card_number || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-400 ml-4">
                                        #
                                        {(companiesPagination.currentPage - 1) *
                                          20 +
                                          index +
                                          1}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Pagination for Companies */}
                      {!loading &&
                        companies.length > 0 &&
                        companiesPagination.totalPages > 1 && (
                          <div className="p-4 border-t">
                            <Pagination
                              currentPage={companiesPagination.currentPage}
                              totalPages={companiesPagination.totalPages}
                              onPageChange={(page) => {
                                getCompanies(companySearchQuery, page);
                              }}
                              showMoreItems={
                                companiesPagination.currentPage <
                                  companiesPagination.totalPages ||
                                (companiesPagination.totalPages === 1 &&
                                  companiesPagination.totalItems >
                                    companiesPagination.pageSize) ||
                                companiesPagination.totalItems >
                                  companies.length
                                  ? companiesPagination.pageSize
                                  : 0
                              }
                              onShowMore={() => {
                                if (
                                  companiesPagination.currentPage <
                                    companiesPagination.totalPages ||
                                  (companiesPagination.totalPages === 1 &&
                                    companiesPagination.totalItems >
                                      companiesPagination.pageSize) ||
                                  companiesPagination.totalItems >
                                    companies.length
                                ) {
                                  getCompanies(
                                    companySearchQuery,
                                    companiesPagination.currentPage + 1
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
                </div>
              )}

              {/* Payment Type Selection Modal */}
              {isPaymentTypeModalOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 "
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsPaymentTypeModalOpen(false);
                    }
                  }}
                >
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col modal-container overflow-hidden relative">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gray-50 flex-shrink-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                        {t("app.pos.select_payment_type")}
                      </h2>
                      <button
                        onClick={() => setIsPaymentTypeModalOpen(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Payment Types Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 modal-scroll-container modal-content-scrollable">
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loading />
                        </div>
                      ) : paymentTypes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-lg mb-2">
                            {t("app.pos.no_payment_types_found")}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden md:block px-5">
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
                                {/* All option */}
                                <tr
                                  className="hover:bg-accent/50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedPaymentType(null);
                                    setIsPaymentTypeModalOpen(false);
                                    toast.success(
                                      `${t("app.pos.all")} ${t(
                                        "app.pos.selected"
                                      )}`
                                    );
                                  }}
                                >
                                  <td className="border border-border border-r-0 rounded-l-lg">
                                    <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                                      1
                                    </div>
                                  </td>
                                  <td className="border border-border px-4 py-3">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-500">
                                          ALL
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                                    <div className="font-medium text-sm">
                                      {t("app.pos.all")}
                                    </div>
                                  </td>
                                </tr>
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
                                          {index + 2}
                                        </div>
                                      </td>
                                      <td className="border border-border px-4 py-3">
                                        <div className="flex items-center">
                                          <Image
                                            src={
                                              paymentType.image_url
                                                ? `${BASE_URL}${paymentType.image_url}`
                                                : "/images/nophoto.png"
                                            }
                                            width={28}
                                            height={28}
                                            alt={paymentType.name || "image"}
                                            className="w-8 h-8 object-contain"
                                          />
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
                          </div>

                          {/* Mobile Cards */}
                          <div className="md:hidden">
                            <div className="space-y-3 p-4">
                              {/* All option */}
                              <div
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                  setSelectedPaymentType(null);
                                  setIsPaymentTypeModalOpen(false);
                                  toast.success(
                                    `${t("app.pos.all")} ${t(
                                      "app.pos.selected"
                                    )}`
                                  );
                                }}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-500 font-medium">
                                        ALL
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-base text-gray-900">
                                      {t("app.pos.all")}
                                    </h3>
                                  </div>
                                </div>
                              </div>
                              {paymentTypes.map(
                                (paymentType: PaymentType, index: number) => (
                                  <div
                                    key={paymentType.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                                    <div className="flex items-center space-x-4">
                                      <div className="flex-shrink-0">
                                        <Image
                                          src={
                                            paymentType.image_url
                                              ? `${BASE_URL}${paymentType.image_url}`
                                              : "/images/nophoto.png"
                                          }
                                          width={40}
                                          height={40}
                                          alt={paymentType.name || "image"}
                                          className="w-10 h-10 object-contain rounded-lg border border-gray-200"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-medium text-base text-gray-900">
                                          {paymentType.name}
                                        </h3>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </>
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
                  <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden mx-4 relative">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("app.pos.filter_receipts")}
                      </h2>
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
                      >
                        <X className="h-4 w-4 " />
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
                            {/* Desktop Calendar */}
                            <div className="hidden md:contents">
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-[48%] sm:w-full justify-between font-normal text-sm "
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
                                    className="w-[48%] sm:w-full justify-between font-normal text-sm"
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
                                    selected={
                                      date2 ? new Date(date2) : undefined
                                    }
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
                            <div className="md:hidden flex gap-3 w-full">
                              <Button
                                variant="outline"
                                onClick={() => setMobileCalendarOpen(true)}
                                className="w-[48%] justify-between font-normal text-sm"
                              >
                                {date ? date : t("app.pos.from")}
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setMobileCalendarOpen2(true)}
                                className="w-[48%] justify-between font-normal text-sm"
                              >
                                {date2 ? date2 : t("app.pos.to")}
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </div>
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
                                getCompanies("", 1);
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
                              : selectedPaymentType === null
                              ? t("app.pos.all")
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
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Calendar Modal for From Date */}
              {mobileCalendarOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                  <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {t("app.pos.from")}
                      </h3>
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
                          ).padStart(2, "0")}-${String(
                            selectedDate.getDate()
                          ).padStart(2, "0")}`;

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
                      <h3 className="text-lg font-semibold">
                        {t("app.pos.to")}
                      </h3>
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
                          ).padStart(2, "0")}-${String(
                            selectedDate.getDate()
                          ).padStart(2, "0")}`;

                          setDate2(formatted);
                          setMobileCalendarOpen2(false);
                        }
                      }}
                    />
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
