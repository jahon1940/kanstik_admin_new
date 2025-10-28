"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { ChevronLeft, X } from "lucide-react";
import PlusIcon from "@/components/icons/plus";
import DesktopOnlyMessage from "@/components/DesktopOnlyMessage";

export default function KviDiscountPage() {
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

  const [kviProducts, setKviProducts] = useState<any>(null);

  // Products state for left section
  const [products, setProducts] = useState<any>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchTimer, setProductSearchTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Products pagination state
  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  });

  // KVI Products pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Discount Modal state
  const [isAddDiscountModalOpen, setIsAddDiscountModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    percent: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Responsive state
  const [isDesktop, setIsDesktop] = useState(true);

  const addDiscount = async () => {
    if (!formData.name.trim() || !formData.percent.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    const percentValue = parseFloat(formData.percent);
    if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
      toast.error(t("discount.form.invalid_percent"));
      return;
    }

    setFormLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          name: formData.name.trim(),
          percent: percentValue,
        }),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/discount-types`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_added_success"));
        setIsAddDiscountModalOpen(false);
        setFormData({ name: "", percent: "" });
        getKviDiscounts(1);
      } else {
        throw new Error(t("toast.error_occurred"));
      }
    } catch (error: any) {
      const msg = error?.message || t("toast.network_error");
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const updateDiscount = async () => {
    if (!formData.name.trim() || !formData.percent.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    const percentValue = parseFloat(formData.percent);
    if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
      toast.error(t("discount.form.invalid_percent"));
      return;
    }

    if (!selectedDiscount?.id) {
      toast.error(t("toast.error_occurred"));
      return;
    }

    setFormLoading(true);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify({
          name: formData.name.trim(),
          percent: percentValue,
        }),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/discount-types/${selectedDiscount.id}`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_updated_success"));
        setIsAddDiscountModalOpen(false);
        setIsEditMode(false);
        setSelectedDiscount(null);
        setFormData({ name: "", percent: "" });
        getKviDiscounts(1); // Refresh the list
      } else {
        throw new Error(t("toast.error_occurred"));
      }
    } catch (error: any) {
      const msg = error?.message || t("toast.network_error");
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteDiscount = async (id: number) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/discount-types/${id}`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_deleted_success"));
        getKviDiscounts(1); // Refresh the list
      } else {
        const result = await response.json();
        throw new Error(result.message || t("toast.error_occurred"));
      }
    } catch (error: any) {
      const msg = error?.message || t("toast.network_error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async (
    searchTerm: string = "",
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setProductsLoading(true);
      setProductsError(null);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      if (getDeviceToken()) {
        myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          title: searchTerm,
        }),
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
        setProducts((prevProducts: any) => [
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
      };
      setProductsPagination(paginationData);

      return result;
    } catch (error: any) {
      const msg = error?.message || t("app.pos.product_search_error");
      setProductsError(msg);
      toast.error(msg);
      throw error;
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductSearchInputChange = (value: string) => {
    setProductSearchQuery(value);

    // Clear existing timer
    if (productSearchTimer) {
      clearTimeout(productSearchTimer);
    }

    // Set new timer for debounce (500ms delay)
    const newTimer = setTimeout(() => {
      getProducts(value, 1);
    }, 500);

    setProductSearchTimer(newTimer);
  };

  const getKviDiscounts = (page: number = 1, append: boolean = false) => {
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
      `${BASE_URL}/v1/admins/product-kvi-discounts?page=${page}&page_size=20`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);

        if (!cancelled) {
          if (append && page > 1) {
            // Append new results to existing ones for "Show More" functionality
            setKviProducts((prevProducts: any) => [
              ...prevProducts,
              ...(result.results || result || []),
            ]);
          } else {
            // Replace results for normal pagination
            setKviProducts(result.results ?? null);
          }

          // Update pagination state
          const paginationData = {
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
          };
          setPagination(paginationData);
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

  useEffect(() => {
    getKviDiscounts(1);
    getProducts("", 1); // Load initial products
  }, []);

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint (1024px)
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (productSearchTimer) {
        clearTimeout(productSearchTimer);
      }
    };
  }, [productSearchTimer]);


  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <h1 className="text-base md:text-xl font-semibold truncate">
            {t("menu.link5")}
          </h1>
        </div>
      </div>

      {isDesktop ? (
        /* KVI elements*/
        <div className="rounded-lg shadow-lg">
          <div className="overflow-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] ">
            {/* Two Section Layout */}
            <div className="flex gap-4 h-full">
              {/* Left Section - Products */}
              <div className="w-1/2 space-y-4 bg-card p-3 md:p-4 rounded-lg shadow-lg">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={t("kvi_discount.search_products")}
                      value={productSearchQuery}
                      onChange={(e) =>
                        handleProductSearchInputChange(e.target.value)
                      }
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 font-semibold text-sm text-gray-700">
                  <div className="w-8 text-center flex-shrink-0">
                    {t("kvi_discount.number_column")}
                  </div>
                  <div className="flex-1">
                    {t("kvi_discount.product_column")}
                  </div>
                  <div className="w-20 text-center flex-shrink-0">
                    {t("kvi_discount.actions_column")}
                  </div>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                  {productsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loading />
                    </div>
                  ) : productsError ? (
                    <div className="text-center py-12 text-red-600">
                      {productsError}
                    </div>
                  ) : !products?.length ? (
                    <div className="text-center py-12 text-gray-500">
                      {t("app.company.not_found")}
                    </div>
                  ) : (
                    products?.map((org: any, index: number) => (
                      <div
                        key={org.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                      >
                        {/* Row Number */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                          {(productsPagination.currentPage - 1) *
                            productsPagination.pageSize +
                            index +
                            1}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            {t("kvi_discount.article")}:{" "}
                            {org.vendor_code || "-"}
                          </div>
                          <div className="font-medium text-sm">{org.title}</div>
                        </div>

                        {/* Action Buttons */}

                        <button
                          onClick={() => {
                            toast("add");
                          }}
                          className="bg-primary text-white p-2 rounded hover:bg-primary/80 cursor-pointer"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Products Pagination */}
                {!productsLoading &&
                  products &&
                  products.length > 0 &&
                  productsPagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={productsPagination.currentPage}
                        totalPages={productsPagination.totalPages}
                        onPageChange={(page) => {
                          getProducts(productSearchQuery, page);
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
                            getProducts(
                              productSearchQuery,
                              productsPagination.currentPage + 1,
                              true
                            );
                          }
                        }}
                        disabled={productsLoading}
                        className=""
                      />
                    </div>
                  )}
              </div>

              {/* Right Section - KVI Products */}
              <div className="w-1/2 space-y-4 bg-card p-3 md:p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-center px-3 py-1.5">
                  <h3 className="text-lg font-semibold">
                    {t("kvi_discount.added_products")}
                  </h3>
                </div>

                {/* Table Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 font-semibold text-sm text-gray-700">
                  <div className="w-8 text-center flex-shrink-0">
                    {t("kvi_discount.number_column")}
                  </div>
                  <div className="flex-1">
                    {t("kvi_discount.product_column")}
                  </div>
                  <div className="w-20 text-center flex-shrink-0">
                    {t("kvi_discount.actions_column")}
                  </div>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loading />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 text-red-600">
                      {error}
                    </div>
                  ) : !kviProducts?.length ? (
                    <div className="text-center py-12 text-gray-500">
                      {t("app.company.not_found")}
                    </div>
                  ) : (
                    kviProducts?.map((org: any, index: number) => (
                      <div
                        key={org.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                      >
                        {/* Row Number */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            index +
                            1}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            {t("kvi_discount.article")}:{" "}
                            {org.product.vendor_code || "-"}
                          </div>
                          <div className="font-medium text-sm">
                            {org.product.title}
                          </div>
                        </div>

                        {/* Action Buttons */}

                        <button
                          onClick={() => {
                            toast("delete");
                          }}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {!loading &&
                  kviProducts &&
                  kviProducts.length > 0 &&
                  pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => {
                          getKviDiscounts(page);
                        }}
                        showMoreItems={
                          pagination.currentPage < pagination.totalPages ||
                          (pagination.totalPages === 1 &&
                            pagination.totalItems > pagination.pageSize) ||
                          pagination.totalItems > kviProducts.length
                            ? pagination.pageSize
                            : 0
                        }
                        onShowMore={() => {
                          if (
                            pagination.currentPage < pagination.totalPages ||
                            (pagination.totalPages === 1 &&
                              pagination.totalItems > pagination.pageSize) ||
                            pagination.totalItems > kviProducts.length
                          ) {
                            getKviDiscounts(pagination.currentPage + 1, true);
                          }
                        }}
                        disabled={loading}
                        className=""
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* mobile and tablet */
        <DesktopOnlyMessage />
      )}

      {/* Add Discount Modal */}
      {isAddDiscountModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddDiscountModalOpen(false);
              setIsEditMode(false);
              setSelectedDiscount(null);
              setFormData({ name: "", percent: "" });
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode
                  ? t("discount.form.edit_discount_title")
                  : t("discount.form.add_discount_title")}
              </h2>
              <button
                onClick={() => {
                  setIsAddDiscountModalOpen(false);
                  setIsEditMode(false);
                  setSelectedDiscount(null);
                  setFormData({ name: "", percent: "" });
                }}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isEditMode) {
                    updateDiscount();
                  } else {
                    addDiscount();
                  }
                }}
                className="space-y-4"
              >
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("discount.form.discount_name")}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("discount.form.discount_name_placeholder")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formLoading}
                  />
                </div>

                {/* Percent Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("discount.form.discount_percent")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.percent}
                    onChange={(e) =>
                      setFormData({ ...formData, percent: e.target.value })
                    }
                    placeholder={t(
                      "discount.form.discount_percent_placeholder"
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formLoading}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDiscountModalOpen(false);
                      setIsEditMode(false);
                      setSelectedDiscount(null);
                      setFormData({ name: "", percent: "" });
                    }}
                    className="flex-1"
                    disabled={formLoading}
                  >
                    {t("alert.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={formLoading}
                  >
                    {formLoading
                      ? isEditMode
                        ? t("discount.form.updating")
                        : t("discount.form.adding")
                      : isEditMode
                      ? t("discount.form.update_discount")
                      : t("discount.form.add_discount")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
