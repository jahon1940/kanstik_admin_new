"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeft, Info, Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { BASE_URL } from "@/lib/api";
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
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { useAlertDialog } from "@/contexts/AlertDialogContext";

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
  fiscal_sign: string;
  staff_name: string;
};

export default function Pos() {
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<any>(null);
  const [allManagers, setAllManagers] = useState<any>(null);
  const [paymentTypes, setPaymentTypes] = useState<any>(null);
  const [posPaymentTypes, setPosPaymentTypes] = useState<any>(null);
  const [selectType, setSelectType] = useState<number | null>(null);

  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

  console.log(selectType);

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
        console.log(response);

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
              <Button
                className="mb-4 cursor-pointer"
                onClick={() => setIsAddManagerModalOpen(true)}
              >
                {t("app.pos.add_cashier")}
              </Button>

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
                        <td>
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
                        Операция
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Номер чека
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Дата и время
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Тип оплаты
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Наличные
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Картой
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Сумма
                      </th>
                      <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                        Статус 1С
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {receipts?.map((org: any) => (
                      <tr
                        key={org?.id}
                        className="hover:bg-accent/50 cursor-pointer border-b border-gray-300"
                        onClick={() => {
                          setSelectedReceipt(org);
                          setIsModalOpen(true);
                        }}
                      >
                        <td className="px-4 py-2 border-r border-gray-300">
                          <h2 className="text-green-500">Продажа</h2>
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
                          <h2>{org?.payments[0]?.payment_type?.name}</h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2>
                            {org?.received_cash.toLocaleString("ru-RU")} сум
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2>
                            {org?.received_cash.toLocaleString("ru-RU")}сум
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          <h2>
                            {org?.received_cash.toLocaleString("ru-RU")} сум
                          </h2>
                        </td>
                        <td className="px-4 py-4 border-r border-gray-300">
                          {org?.sent_to_1c ? (
                            <span className="text-green-500">Отправлено</span>
                          ) : (
                            <span className="text-red-500">Не Отправлено</span>
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
                <Select
                  onValueChange={(value:any) => {
                    setSelectType(value);
                  }}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Выберите Платеж" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Выберите</SelectLabel>
                      {paymentTypes?.map((item:any) => {
                        return (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                    {/* <SelectGroup>
                      <SelectLabel>Выберите 2</SelectLabel>
                      <SelectItem value="gmt">humo</SelectItem>
                      <SelectItem value="cet">Uzcard</SelectItem>
                    </SelectGroup> */}
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
                  className="cursor-pointer"
                >
                  {t("app.pos.add_payment")}
                </Button>
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
                    posPaymentTypes?.map((org:any) => (
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
                        <td className="px-4 py-3">
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
                            className="bg-[#ED6C3C] inline-block p-2 rounded-sm cursor-pointer  "
                          >
                            <Image
                              src="/icons/trash.svg"
                              alt="home"
                              width={20}
                              height={20}
                            />
                          </span>
                          {/* <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {t("app.company.active")}
                          </span> */}
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
                    data.poses.map((org:any) => (
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
                  <div className="text-center mb-4 border-b pb-3">
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
                  <div className="border-t pt-3 mb-4">
                    <div className="text-center font-semibold mb-2">Товары</div>
                    <div className="space-y-2">
                      {selectedReceipt.products.map((item:any, index) => {
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
                  <div className="border-t pt-3 mb-4">
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
                  <div className="border-t pt-3 mb-4">
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
                  <div className="border-t pt-3 mb-4">
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
                    <div className="border-t pt-3 mb-4 text-center">
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
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Данные входа в кассу
              </h2>
              <button
                onClick={() => setIsAddManagerModalOpen(false)}
                className="text-orange-500 hover:text-orange-700 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Cashier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите Кассира
                </label>
                <Select
                  value={selectedCashier}
                  onValueChange={setSelectedCashier}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите кассира" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Кассиры</SelectLabel>
                      {allManagers?.map((item:any, index:any) => {
                        return (
                          <SelectItem key={index} value="cashier1">
                            {item.name}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите Роль
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Роли</SelectLabel>
                      <SelectItem value="cashier">Кассир</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={() => {
                  // Handle add manager functionality
                  if (
                    !selectedCashier ||
                    !selectedRole ||
                    !username ||
                    !password
                  ) {
                    toast.error("Пожалуйста, заполните все поля");
                    return;
                  }

                  // Here you would typically make an API call to add the manager
                  toast.success("Кассир успешно добавлен");
                  setIsAddManagerModalOpen(false);

                  // Reset form
                  setSelectedCashier("");
                  setSelectedRole("");
                  setUsername("");
                  setPassword("");
                  setShowPassword(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Добавить Кассира
              </button>
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}
