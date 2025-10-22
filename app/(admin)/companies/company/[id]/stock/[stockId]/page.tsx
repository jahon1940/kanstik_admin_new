"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";

import { getDeviceToken } from "@/lib/token";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ArrowIcon from "@/components/icons/arrow";
import ReceiptsIcon from "@/components/icons/receipts";
import PlusIcon from "@/components/icons/plus";
import Image from "next/image";

// Pose (kassa) type
type Pose = {
  id: number;
  name: string;
};

// Count  type
type Count = {
  product_in_warehouses: string;
};

// Stock (obyekt) type
type Stock = {
  id: number;
  name: string;
  organization?: string;
  region?: string;
  poses: Pose[];
  phone_number: string;
  address: string;
};

export default function StockPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Count | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    appVersion: "",
    gnkId: "",
    enableNoFiscalSale: false,
    enableDelay: false,
    orderFromSite: false,
    integrationWith1c: false,
    managerSale: false,
    paymentDollar: false,
    showPurchasePrice: false,
    editPrice: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

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

    fetch(`${BASE_URL}/v1/admins/stocks/${params.stockId}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setData(result ?? null);
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
  const getCounts = () => {
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

    fetch(`${BASE_URL}/v1/admins/counts/${params.stockId}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setCounts(result ?? null);
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

  const createPos = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error(t("toast.cash_register_name_required"));
      return;
    }

    if (!formData.appVersion.trim()) {
      toast.error(t("toast.app_version_required"));
      return;
    }

    if (!formData.gnkId.trim()) {
      toast.error(t("toast.gnk_id_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);

      const requestData = {
        name: formData.name,
        stock_id: Number(params.stockId),
        gnk_id: formData.gnkId,
        enable_no_fiscal_sale: formData.enableNoFiscalSale,
        enable_delay: formData.enableDelay,
        order_from_site: formData.orderFromSite,
        integration_with_1c: formData.integrationWith1c,
        manager_sale: formData.managerSale,
        payment_dollar: formData.paymentDollar,
        show_purchase_price: formData.showPurchasePrice,
        edit_price: formData.editPrice,
        app_version: formData.appVersion,
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(`${BASE_URL}/v1/admins/pos`, requestOptions);

      // Check if response is ok first
      if (response.ok) {
        // Try to parse JSON, but handle cases where response might be empty
        let result;
        try {
          const text = await response.text();
          result = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If JSON parsing fails, treat as success with empty result
          result = {};
        }

        toast.success(t("toast.pos_created_successfully"));
        setIsModalOpen(false);
        // Reset form
        setFormData({
          name: "",
          appVersion: "",
          gnkId: "",
          enableNoFiscalSale: false,
          enableDelay: false,
          orderFromSite: false,
          integrationWith1c: false,
          managerSale: false,
          paymentDollar: false,
          showPurchasePrice: false,
          editPrice: false,
        });
        // Refresh the data
        getOrganization();
      } else {
        // Handle error response
        let errorMessage = t("toast.error_occurred");
        try {
          const text = await response.text();
          if (text) {
            const errorResult = JSON.parse(text);
            errorMessage = errorResult?.message || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse error response, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = t("toast.error_occurred");

      if (error?.message) {
        // Check if it's a network error
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage = t("toast.network_error");
        } else if (error.message.includes("401")) {
          errorMessage = t("toast.auth_error");
        } else if (error.message.includes("403")) {
          errorMessage = t("toast.permission_error");
        } else if (error.message.includes("404")) {
          errorMessage = t("toast.not_found_error");
        } else if (error.message.includes("500")) {
          errorMessage = t("toast.server_error");
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getOrganization();
    getCounts();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">{t("app.company.title")}</h1>
      </div>
      <div className="">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Chap panel */}
          <div>
            <div className="w-full flex-shrink-0 md:w-[450px]  rounded-2xl p-4 bg-secondary shadow-lg shadow-black/10 dark:shadow-black/30 mb-6">
              <h1 className="text-xl  pb-1 mb-1">
                {t("app.stock.account_title")}
              </h1>
              <table className="text-sm border-separate border-spacing-x-2 mb-4">
                <tbody>
                  <tr>
                    <td className="py-1">{t("app.stock.organization")}:</td>
                    <td>
                      <h1>{data?.organization}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">{t("app.stock.name")}:</td>
                    <td>{data?.name}</td>
                  </tr>
                  <tr>
                    <td className="py-1">{t("app.stock.phone")}:</td>
                    <td>{data?.phone_number}</td>
                  </tr>
                  <tr>
                    <td className="py-1">{t("app.stock.address")}:</td>
                    <td>{data?.address}</td>
                  </tr>
                  <tr>
                    <td className="py-1">{t("app.stock.region")}:</td>
                    <td>{data?.region}</td>
                  </tr>
                  <tr>
                    <td className="py-1 w-[40%]">
                      {t("app.stock.products_by_stocks")}:
                    </td>
                    <td>{counts?.product_in_warehouses}</td>
                  </tr>
                </tbody>
              </table>
              <Link
                href={{
                  pathname: `${pathname}/receipts`,
                  query: { name: data?.name },
                }}
                className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
              >
                <div className="flex gap-2 items-center">
                  <ReceiptsIcon />
                  {t("app.stock.all_receipts")}
                </div>
                <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* O‘ng panel */}
          <div className="flex-1  rounded-2xl p-4 bg-secondary overflow-auto h-[calc(100vh-6rem)] w-full shadow-lg shadow-black/10 dark:shadow-black/30">
            <h1 className="text-xl mb-3">
              {t("app.stock.cashiers")} ({data?.name}){" "}
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-md mb-4 cursor-pointer hover:bg-primary/90 flex items-center gap-2"
            >
              <PlusIcon />
              {t("app.stock.add_cashier")}
            </button>
            <table className="w-full text-sm relative border-separate border-spacing-y-2">
              <thead className="sticky top-[0px] z-10 bg-bgColor">
                <tr>
                  <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                    №
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b w-[60%] border border-gray-300 border-l-0">
                    {t("app.company.name")}
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b w-[30%] border border-gray-300 border-l-0">
                    {t("app.company.status")}
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b w-[20%] border-r border-gray-300 border border-l-0 rounded-r-lg">
                    {t("ui.update")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className=" rounded-lg px-4 py-6">
                      <Loading />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-red-600  rounded-lg"
                      colSpan={4}
                    >
                      {error}
                    </td>
                  </tr>
                ) : !data?.poses?.length ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground border border-border rounded-lg"
                      colSpan={4}
                    >
                      {t("app.company.not_found")}
                    </td>
                  </tr>
                ) : (
                  data.poses.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td className="border border-border border-r-0 rounded-l-lg">
                        <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                          {index + 1}
                        </div>
                      </td>
                      <td className="border border-border">
                        <Link
                          className="block px-4 py-3"
                          href={{
                            pathname: `${pathname}/pos/${org.id}`,
                            query: { name: org.name },
                          }}
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="border border-border border-l-0">
                        <Link
                          className="block px-4 py-3"
                          href={`${pathname}/pos/${org.id}`}
                        >
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {t("app.company.active")}
                          </span>
                        </Link>
                      </td>
                      <td className="border border-border border-l-0 rounded-r-lg">
                        <div className="px-4 py-3">
                          <span
                            onClick={() => {
                              console.log("update");
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for adding cash register */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("app.stock.cash_register_data")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("app.stock.cash_register_name")}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("app.stock.cash_register_name")}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("app.stock.app_version")}
                </label>
                <Input
                  value={formData.appVersion}
                  onChange={(e) =>
                    setFormData({ ...formData, appVersion: e.target.value })
                  }
                  placeholder={t("app.stock.app_version")}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("app.stock.gnk_id")}
                </label>
                <Input
                  value={formData.gnkId}
                  onChange={(e) =>
                    setFormData({ ...formData, gnkId: e.target.value })
                  }
                  placeholder={t("app.stock.gnk_id")}
                  className="w-full"
                />
              </div>
            </div>

            {/* Toggle switches */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.allow_without_module")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      enableNoFiscalSale: !formData.enableNoFiscalSale,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableNoFiscalSale ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableNoFiscalSale
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.allow_credit_sales")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      enableDelay: !formData.enableDelay,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableDelay ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableDelay ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.orders_from_site")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      orderFromSite: !formData.orderFromSite,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.orderFromSite ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.orderFromSite ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.integration_with_1c")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      integrationWith1c: !formData.integrationWith1c,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.integrationWith1c ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.integrationWith1c
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.manager_sale")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      managerSale: !formData.managerSale,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.managerSale ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.managerSale ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.payment_dollar")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      paymentDollar: !formData.paymentDollar,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.paymentDollar ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.paymentDollar ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.show_purchase_price")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      showPurchasePrice: !formData.showPurchasePrice,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.showPurchasePrice ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.showPurchasePrice
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t("app.stock.edit_price")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      editPrice: !formData.editPrice,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.editPrice ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.editPrice ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Create button */}
            <div className="pt-4">
              <Button
                onClick={createPos}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? t("app.stock.creating") : t("app.stock.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
