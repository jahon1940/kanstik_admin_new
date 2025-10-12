"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeft, Info, Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { X } from "lucide-react";

import { getDeviceToken } from "@/lib/token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

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
  last_active: string;
  last_synchronize: string;
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
  fiscal_sign: string;
  staff_name: string;
  products?: any[];
};

export default function Pos() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<any>(null);
  const [allManagers, setAllManagers] = useState<any>(null);
  const [paymentTypes, setPaymentTypes] = useState<any>(null);
  const [posPaymentTypes, setPosPaymentTypes] = useState<any>(null);
  const [selectType, setSelectType] = useState<number | null>(null);
  const [ordersSite, setOrdersSite] = useState<any>(null);

  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

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
      `${BASE_URL}/v1/admins/pos/${params.id}/orders?from_date=${date}&to_date=${date2}&page=1&page_size=200`,
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
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  const getManagers = () => {
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

    fetch(`${BASE_URL}/v1/admins/pos/${params.id}/managers`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setManagers(result ?? null);
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

  const getAllManagers = () => {
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

    fetch(`${BASE_URL}/v1/admins/managers?page=1&page_size=150`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setAllManagers(result.results ?? null);
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

  const getPaymentTypes = () => {
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

    fetch(`${BASE_URL}/v1/admins/payment-types`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setPaymentTypes(result.results ?? null);
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

  const getPosPaymentTypes = () => {
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
      `${BASE_URL}/v1/admins/pos/${params.id}/payment-types`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setPosPaymentTypes(result.results ?? null);
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

  const set_PaymentTypes = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    const raw = JSON.stringify({
      payment_type_id: selectType,
    });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/pos/${params.id}/set-payment-types`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          getPosPaymentTypes();
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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

  const set_TypesImage = (base64: string) => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    const raw = JSON.stringify({
      image: base64,
    });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/payment-types/${selectedPaymentType.id}`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          toast.success("Изображение успешно загружено!");
          getPosPaymentTypes();
          setIsImageModalOpen(false);
          setSelectedImage(null);
          setSelectedImageFile(null);
          setSelectedPaymentType(null);
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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

  const deletePaymentType = (id: number) => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }
    // const raw = JSON.stringify({
    //   payment_type_id: selectType,
    // });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: null,
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/pos/${params.id}/unset-payment-types/${id}`,
      requestOptions
    )
      .then((response) => {
        if (response.status == 204) {
          setLoading(false);
          setError(null);
          getPosPaymentTypes();
        }
        // return response.json();
      })
      .then((result) => {
        // if (!cancelled) setPosPaymentTypes(result.results ?? null);
        // setLoading(false);
        // setError(null);
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

  const handleAddManager = async () => {
    // Validatsiya
    if (!selectedCashier) {
      toast.error(t("app.pos.select_cashier_error"));
      return;
    }
    if (!selectedRole) {
      toast.error(t("app.pos.select_role_error"));
      return;
    }
    if (!username.trim()) {
      toast.error(t("app.pos.username_required"));
      return;
    }
    if (!password.trim()) {
      toast.error(t("app.pos.password_required"));
      return;
    }

    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestData = {
        manager_id: parseInt(selectedCashier),
        username: username.trim(),
        password: password.trim(),
        role: selectedRole === "cashier" ? "casher" : selectedRole,
      };

      const requestOptions: RequestInit = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/pos/${params.id}/set-managers`,
        requestOptions
      );

      if (response.ok || response.status === 204) {
        toast.success(t("app.pos.manager_added_success"));
        setIsAddManagerModalOpen(false);
        // Form-ni tozalash
        setSelectedCashier("");
        setSelectedRole("");
        setUsername("");
        setPassword("");
        // Managerlar ro'yxatini yangilash
        getManagers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || t("app.pos.manager_add_error");
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const msg = error?.message || t("app.pos.manager_add_error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSubmit = async () => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestData = {
        enable_discount: enableDiscount,
        discount: discountValue,
      };



      const requestOptions: RequestInit = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/pos/${params.id}/discount`,
        requestOptions
      );

      if (response.ok || response.status === 204) {
        toast.success(t("app.pos.discount_updated_success"));
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || t("app.pos.discount_update_error");
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const msg = error?.message || t("app.pos.discount_update_error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrganization();
    getManagers();
    getAllManagers();
    getPaymentTypes();
    getPosPaymentTypes();
  }, []);

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<string | undefined>(undefined);

  const [open2, setOpen2] = React.useState(false);
  const [date2, setDate2] = React.useState<string | undefined>(undefined);
  const [ordersDate, setOrdersDate] = React.useState<string | undefined>(
    undefined
  );
  const [ordersDate2, setOrdersDate2] = React.useState<string | undefined>(
    undefined
  );

  // Modal state for receipt details
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(
    null
  );

  // Modal state for adding manager
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] =
    React.useState(false);
  const [selectedCashier, setSelectedCashier] = React.useState<string>("");
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  // Modal state for image upload
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(
    null
  );
  const [selectedPaymentType, setSelectedPaymentType] =
    React.useState<any>(null);

  // Discount state
  const [enableDiscount, setEnableDiscount] = React.useState<boolean>(false);
  const [discountValue, setDiscountValue] = React.useState<number>(0);

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
    <Tabs defaultValue="info" className="space-y-2">
      {/* Header - responsive */}
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
            {t("app.pos.title")}({data?.name})
          </h1>
        </div>

        {/* Tabs - responsive */}
        <div className="w-full md:w-auto overflow-x-auto">
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
      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4">
          {/* content */}
          <div className=" w-full pt-4">
            {/* info */}
            <TabsContent value="info" className="w-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.info")}{" "}
              </h1>
              <div className="overflow-auto col-span-6 md:col-span-2  rounded-2xl p-4 flex flex-col gap-2 max-h-[75vh] text-sm">
                <h1 className="text-xl -2 border-secondary py-2 mb-2 font-extrabold">
                  {t("app.pos.shop")}
                </h1>
                <table className="md:w-[400px]">
                  <tbody>
                    <tr>
                      <td className="py-1">{t("app.stock.name")} :</td>
                      <td className="py-1">{data?.name} </td>
                    </tr>
                    <tr>
                      <td className="py-1">{t("app.pos.app_version")} :</td>
                      <td className="py-1">{data?.app_version} </td>
                    </tr>
                    <tr>
                      <td className="py-1">gnk_id :</td>
                      <td className="py-1">{data?.gnk_id} </td>
                    </tr>
                    <tr>
                      <td className="py-1">{t("app.pos.status")} :</td>
                      <td className="py-1">
                        {data?.status ? (
                          <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.active")}
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.inactive")}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">
                        {t("app.pos.work_without_module")} :
                      </td>
                      <td className="py-1">
                        {data?.enable_delay ? (
                          <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.active")}
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.inactive")}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">
                        {t("app.pos.orders_from_site")} :
                      </td>
                      <td className="py-1">
                        {data?.order_from_site ? (
                          <span className="bg-green-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.active")}
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white text-[13px] p-1.5 py-1 rounded-sm">
                            {t("app.pos.inactive")}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">{t("app.pos.last_activity")} :</td>
                      <td className="py-1">
                        {data?.last_active
                          ? formatDate(data.last_active)
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1">{t("app.pos.last_sync")} :</td>
                      <td className="py-1">
                        {" "}
                        {data?.last_synchronize
                          ? formatDate(data.last_synchronize)
                          : "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            {/* cashiers */}
            <TabsContent value="cashiers" className="w-full">
              <h1 className="text-md mb-3 bg-bgColor text-black rounded-sm p-2 px-3">
                {t("app.pos.cashiers")}{" "}
              </h1>
              <Button
                className="mb-4 cursor-pointer"
                onClick={() => setIsAddManagerModalOpen(true)}
              >
                {t("app.pos.add_cashier")}
              </Button>

              <table className="w-full  text-sm">
                <thead className="sticky -top-[1px] z-10 bg-bgColor">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3  w-[60%]">
                      {t("app.company.name")}
                    </th>
                    <th className="text-left font-semibold px-4 py-3  w-[40%]">
                      {t("app.company.role")}
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
                  ) : !managers?.results.length ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground"
                        colSpan={2}
                      >
                        {t("app.company.not_found")}
                      </td>
                    </tr>
                  ) : (
                    managers?.results.map((org: any) => (
                      <tr
                        key={org.id}
                        className="hover:bg-accent/50 cursor-pointer "
                      >
                        <td className="px-4 py-3 ">{org.name}</td>
                        <td className="py-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
                              org.role === "admin" &&
                                "bg-red-600/20 text-red-600/90"
                            )}
                          >
                            {t(`app.company.${org.role}`)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TabsContent>
            {/* Receipts Tab */}
            <TabsContent value="receipts" className="w-full mt-0">
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
            </TabsContent>
            {/* Payments Tab */}
            <TabsContent value="payments" className="w-full mt-0">
              <div className="space-y-4">
                <h2 className="text-sm md:text-base font-medium bg-bgColor text-black rounded-sm p-2 px-3">
                  {t("app.pos.payments")}
                </h2>

                {/* Payment type selector - responsive */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Select
                    onValueChange={(value: any) => {
                      setSelectType(value);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Выберите Платеж" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Выберите</SelectLabel>
                        {paymentTypes?.map((item: any) => {
                          return (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => {
                      if (selectType) {
                        showAlert({
                          title: "Подтверждение",
                          description:
                            "Вы уверены, что хотите добавить этот способ оплаты?",
                          confirmText: "Да, добавить",
                          cancelText: "Отмена",
                          onConfirm: () => {
                            set_PaymentTypes();
                          },
                          onCancel: () => {
                            console.log("Payment addition cancelled");
                          },
                        });
                      } else {
                        toast.error("выберите тип оплаты");
                      }
                    }}
                    className="cursor-pointer text-sm px-3 py-2"
                  >
                    {t("app.pos.add_payment")}
                  </Button>
                </div>

                <table className="w-full  text-sm">
                  <thead className="sticky -top-[1px] z-10 bg-bgColor">
                    <tr>
                      <th className="text-left font-semibold px-4 py-3  w-[60%]">
                        {t("app.company.name")}
                      </th>
                      <th className="text-left font-semibold px-4 py-3  w-[40%]">
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
                    ) : !posPaymentTypes?.length ? (
                      <tr>
                        <td
                          className="px-4 py-6 text-muted-foreground"
                          colSpan={2}
                        >
                          {t("app.company.not_found")}
                        </td>
                      </tr>
                    ) : (
                      posPaymentTypes?.map((org: any) => (
                        <tr key={org.id} className="hover:bg-accent/50 ">
                          <td className="px-4 py-3 flex items-center gap-2">
                            <span className="border border-primary rounded-sm p-1">
                              <Image
                                src={
                                  org.image_url
                                    ? `${BASE_URL}${org.image_url}`
                                    : "/images/nophoto.png" // yoki default rasm
                                }
                                width={28}
                                height={28}
                                alt={org.name || "image"}
                                className="w-8 h-8 object-contain"
                              />
                            </span>
                            {org.name}
                          </td>
                          <td className="px-4 py-3 ">
                            <div className="flex gap-2">
                              <span
                                onClick={() => {
                                  setSelectedPaymentType(org);
                                  setIsImageModalOpen(true);
                                }}
                                className="bg-[#6EC8F7] inline-block p-2 rounded-lg cursor-pointer  "
                              >
                                <Image
                                  src="/icons/edit.svg"
                                  alt="home"
                                  width={20}
                                  height={20}
                                />
                              </span>
                              <span
                                onClick={() => {
                                  showAlert({
                                    title: "Подтверждение",
                                    description:
                                      "Вы уверены, что хотите добавить этот способ оплаты?",
                                    confirmText: "Да, добавить",
                                    cancelText: "Отмена",
                                    onConfirm: () => {
                                      deletePaymentType(org.id);
                                    },
                                    onCancel: () => {
                                      console.log("Payment addition cancelled");
                                    },
                                  });
                                }}
                                className="bg-[#ED6C3C] inline-block p-2 rounded-lg cursor-pointer  "
                              >
                                <Image
                                  src="/icons/trash.svg"
                                  alt="home"
                                  width={20}
                                  height={20}
                                />
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            {/* Orders Tab */}
            <TabsContent value="orders" className="w-full mt-0">
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
                          selected={
                            ordersDate ? new Date(ordersDate) : undefined
                          }
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
                          selected={
                            ordersDate ? new Date(ordersDate) : undefined
                          }
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
                  <table className="w-full  text-sm">
                    <thead className="sticky -top-[1px] z-10 bg-bgColor">
                      <tr>
                        <th className="text-left font-semibold px-4 py-3 ">
                          ID заказы
                        </th>
                        <th className="text-left font-semibold px-4 py-3 ">
                          Дата и время
                        </th>

                        <th className="text-left font-semibold px-4 py-3 ">
                          Сумма
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {ordersSite?.map((org: any) => (
                        <tr
                          key={org?.id}
                          className="hover:bg-accent/50 cursor-pointer"
                        >
                          <td className="px-4 py-2">
                            <Link href={`/order/${org.id}`}>
                              <h2 className="text-green-500">#{org.id}</h2>
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <Link href={`/order/${org.id}`}>
                              <h2> {formatDate(org?.created_at)}</h2>
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <Link href={`/order/${org.id}`}>
                              <h2>
                                {org?.price?.toLocaleString("ru-RU")} сум{" "}
                              </h2>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
            {/* Discounts Tab */}
            <TabsContent value="discounts" className="w-full mt-0">
              <div className="space-y-4">
                <h2 className="text-sm md:text-base font-medium bg-bgColor text-black rounded-sm p-2 px-3">
                  {t("app.pos.discounts")}
                </h2>

                <div className="max-w-full md:max-w-md space-y-4 md:space-y-6">
                  {/* Discount Status Toggle */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          {t("app.pos.discount_status")}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          {enableDiscount
                            ? t("app.pos.discount_enabled")
                            : t("app.pos.discount_disabled")}{" "}
                          0%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableDiscount(!enableDiscount)}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                          enableDiscount ? "bg-blue-600" : "bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            enableDiscount ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Discount Percentage Input */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("app.pos.discount_percentage")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountValue === 0 ? "" : discountValue}
                        onChange={(e) =>
                          setDiscountValue(
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Changes Button */}
                  <button
                    onClick={handleDiscountSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 md:py-3 px-4 rounded-md font-medium transition-colors cursor-pointer text-sm md:text-base"
                  >
                    {loading
                      ? t("app.pos.applying")
                      : t("app.pos.apply_changes")}
                  </button>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
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
                    <div className="text-center font-semibold mb-2">Товары</div>
                    <div className="space-y-2">
                      {selectedReceipt?.products?.map((item: any, index) => {
                        return (
                          <div
                            key={index}
                            className="flex justify-between items-start"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {item.product.classifier_title}
                              </div>
                              <div className="text-xs text-gray-600">
                                {item.product.quantity}.0 шт. х{" "}
                                {selectedReceipt.received_cash?.toLocaleString(
                                  "ru-RU"
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-semibold">
                                {selectedReceipt.received_cash?.toLocaleString(
                                  "ru-RU"
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tax Info */}
                  <div className=" pt-3 mb-4">
                    <div className="flex justify-between text-xs">
                      <span>НДС: (12)</span>
                      <span>
                        {Math.round(
                          (selectedReceipt.received_cash || 0) * 0.12
                        ).toLocaleString("ru-RU")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>ИКПУ:</span>
                      <span>03407001001000000</span>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className=" pt-3 mb-4">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Сумма:</span>
                        <span>
                          {selectedReceipt.received_cash?.toLocaleString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Оплачено:</span>
                        <span>
                          {selectedReceipt.received_cash?.toLocaleString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Наличные:</span>
                        <span>
                          {selectedReceipt.received_cash?.toLocaleString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Картой:</span>
                        <span>0</span>
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
                        <span>ФМ:</span> <span>LG420230640562</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ФП:</span> <span>414675046328</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Чек №:</span>{" "}
                        <span>{selectedReceipt.receipt_seq}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>S/N:</span> <span>LG420230640562</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Link */}
                  {/* {selectedReceipt.qr_code_url && (
                    <div className=" pt-3 mb-4 text-center">
                      <a
                        href={selectedReceipt.qr_code_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Просмотреть QR код
                      </a>
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {isAddManagerModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddManagerModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4  flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("app.pos.cashier_login_data")}
              </h2>
              <button
                onClick={() => setIsAddManagerModalOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4 " />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Cashier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("app.pos.select_cashier")}
                </label>
                <SearchableSelect
                  options={
                    allManagers?.map((item: any, index: number) => ({
                      value: item.id ? item.id.toString() : index.toString(), // value faqat string
                      label: item.name,
                    })) || []
                  }
                  value={selectedCashier?.toString() || ""} // bu ham string bo‘lishi shart
                  onValueChange={(val) => setSelectedCashier(val)} // val string bo‘lib keladi
                  placeholder={t("app.pos.select_cashier")}
                  searchPlaceholder={t("app.search")}
                  emptyText={t("app.company.not_found")}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("app.pos.select_role")}
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("app.pos.select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("app.pos.roles")}</SelectLabel>
                      <SelectItem value="cashier">
                        {t("app.pos.cashier")}
                      </SelectItem>
                      <SelectItem value="admin">
                        {t("app.pos.admin")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ransparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ransparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gray-50 px-6 py-4 ">
              <button
                onClick={handleAddManager}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {loading ? t("app.pos.adding") : t("app.pos.add_cashier")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsImageModalOpen(false);
              setSelectedImage(null);
              setSelectedImageFile(null);
              setSelectedPaymentType(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4  flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Обновить фото для {selectedPaymentType?.name || "CLICK"}
              </h2>
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedImage(null);
                  setSelectedImageFile(null);
                  setSelectedPaymentType(null);
                }}
                className="text-orange-500 hover:text-orange-700 text-2xl cursor-pointer w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Image Upload Area */}
            <div className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:lue-400 transition-colors relative"
                onClick={() => {
                  const input = document.getElementById(
                    "image-upload"
                  ) as HTMLInputElement;
                  input?.click();
                }}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSelectedImage(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-48 object-contain mx-auto rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 hover:opacity-100 transition-opacity">
                      <Image
                        src="/icons/edit.svg"
                        alt="Edit"
                        width={32}
                        height={32}
                        className="w-8 h-8 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Нажмите для выбора изображения
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-gray-50 px-6 py-4 ">
              <button
                onClick={() => {
                  if (selectedImageFile) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      set_TypesImage(base64);
                    };
                    reader.readAsDataURL(selectedImageFile);
                  } else {
                    toast.error("Пожалуйста, выберите изображение");
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                Обновить фото
              </button>
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}
