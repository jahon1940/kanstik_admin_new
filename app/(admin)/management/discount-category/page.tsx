"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Image from "next/image";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { ChevronDownIcon, ChevronLeft, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import DesktopOnlyMessage from "@/components/DesktopOnlyMessage";

export default function DiscountCategoryPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

  const [posPaymentTypes, setPosPaymentTypes] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [childrenCategories, setChildrenCategories] = useState<any>(null);
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState<string | null>(null);

  // Add/Edit Discount Modal state
  const [isAddDiscountModalOpen, setIsAddDiscountModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    percent: "",
    barcode: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<string | undefined>(undefined);

  const [open2, setOpen2] = React.useState(false);
  const [date2, setDate2] = React.useState<string | undefined>(undefined);

  const createDiscount = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!formData.percent.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!formData.barcode.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!date) {
      toast.error(t("discount.form.please_select_start_date"));
      return;
    }

    if (!date2) {
      toast.error(t("discount.form.please_select_end_date"));
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error(t("discount.form.please_select_category"));
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

      const requestData = {
        name: formData.name.trim(),
        percent: percentValue,
        barcode: formData.barcode.trim(),
        categories: selectedCategories,
        start_date: date,
        end_date: date2,
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/discount-campaigns`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_added_success"));
        setIsAddDiscountModalOpen(false);
        setFormData({
          name: "",
          percent: "",
          barcode: "",
        });
        setSelectedCategories([]);
        setDate(undefined);
        setDate2(undefined);
        getDiscountTypes(); // Refresh the list
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
        `${BASE_URL}/v1/admins/discount-campaigns/${id}`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_deleted_success"));
        getDiscountTypes(); // Refresh the list
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

  const getDiscountTypes = () => {
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

    fetch(`${BASE_URL}/v1/admins/discount-campaigns`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setPosPaymentTypes(result.results ?? null);
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

  const getCategories = () => {
    let cancelled = false;

    setCategoriesLoading(true);
    setCategoriesError(null);

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

    fetch(`${BASE_URL}/v1/admins/categories`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setCategories(result.results ?? null);
        setCategoriesLoading(false);
        setCategoriesError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || t("toast.network_error");
        if (!cancelled) setCategoriesError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  const getChildrenCategories = (categoryId: number) => {
    let cancelled = false;

    setChildrenLoading(true);
    setChildrenError(null);

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
      `${BASE_URL}/v1/admins/categories/${categoryId}/children`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) {
          setChildrenCategories(result.results ?? null);
          // Find and set the selected parent category
          const parentCategory = categories?.find(
            (cat: any) => cat.id === categoryId
          );
          setSelectedParentCategory(parentCategory);
        }
        setChildrenLoading(false);
        setChildrenError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || t("toast.network_error");
        if (!cancelled) setChildrenError(msg);
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // Remove from selection
        return prev.filter((id) => id !== categoryId);
      } else {
        // Add to selection
        return [...prev, categoryId];
      }
    });
  };

  const updateDiscount = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!formData.percent.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!formData.barcode.trim()) {
      toast.error(t("discount.form.all_fields_required"));
      return;
    }

    if (!date) {
      toast.error(t("discount.form.please_select_start_date"));
      return;
    }

    if (!date2) {
      toast.error(t("discount.form.please_select_end_date"));
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error(t("discount.form.please_select_category"));
      return;
    }

    if (!selectedDiscount?.id) {
      toast.error(t("toast.error_occurred"));
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

      const requestData = {
        name: formData.name.trim(),
        percent: percentValue,
        barcode: formData.barcode.trim(),
        categories: selectedCategories,
        start_date: date,
        end_date: date2,
      };

      const requestOptions: RequestInit = {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify(requestData),
        redirect: "follow",
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/discount-campaigns/${selectedDiscount.id}`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_updated_success"));
        setIsAddDiscountModalOpen(false);
        setIsEditMode(false);
        setSelectedDiscount(null);
        setFormData({
          name: "",
          percent: "",
          barcode: "",
        });
        setSelectedCategories([]);
        setDate(undefined);
        setDate2(undefined);
        getDiscountTypes(); // Refresh the list
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

  useEffect(() => {
    getDiscountTypes();
    getCategories();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary flex-shrink-0"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <h1 className="text-base md:text-xl font-semibold truncate">
            {t("menu.link6")}
          </h1>
        </div>
      </div>

      {/* Desktop version */}
      <div className="hidden lg:block rounded-lg bg-card shadow-lg">
        <div className="overflow-auto h-[calc(100vh-9.5rem)] md:h-[calc(100vh-6rem)] p-3 md:p-4">
          {/* Payments Tab */}
          <div className="w-full mt-0">
            <div className="space-y-4">
              {/* Payment type selector - responsive */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => {
                    setIsEditMode(false);
                    setSelectedDiscount(null);
                    setFormData({
                      name: "",
                      percent: "",
                      barcode: "",
                    });
                    setSelectedCategories([]);
                    setDate(undefined);
                    setDate2(undefined);
                    setIsAddDiscountModalOpen(true);
                  }}
                  className="cursor-pointer text-sm px-3 py-2"
                >
                  {t("app.management.add_discount")}
                </Button>
              </div>

              <table className="w-full text-sm relative border-separate border-spacing-y-2">
                <thead className="sticky top-[0px] z-10 bg-bgColor">
                  <tr>
                    <th className="text-center font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                      №
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[60%] border border-gray-300 border-l-0">
                      {t("app.company.name")}
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[60%] border border-gray-300 border-l-0">
                      {t("app.company.barcode")}
                    </th>
                    <th className="text-left font-semibold px-4 py-3 border-b w-[40%] border-r border-gray-300 border border-l-0 rounded-r-lg">
                      {t("app.company.status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-border rounded-lg px-4 py-6"
                      >
                        <Loading />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-red-600 border border-border rounded-lg"
                        colSpan={3}
                      >
                        {error}
                      </td>
                    </tr>
                  ) : !posPaymentTypes?.length ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground border border-border rounded-lg"
                        colSpan={3}
                      >
                        {t("app.company.not_found")}
                      </td>
                    </tr>
                  ) : (
                    posPaymentTypes?.map((org: any, index: number) => (
                      <tr key={org.id} className="hover:bg-accent/50">
                        <td className="border border-border border-r-0 rounded-l-lg">
                          <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                            {index + 1}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-3 ">
                          {org.name} ({org.percent}%)
                        </td>
                        <td className="border border-border px-4 py-3 ">
                          {org.barcode}
                        </td>
                        <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                          <div className="flex gap-2">
                            <span
                              onClick={() => {
                                setSelectedDiscount(org);
                                setIsEditMode(true);
                                setFormData({
                                  name: org.name,
                                  percent: org.percent.toString(),
                                  barcode: org.barcode || "",
                                });
                                // Set selected categories if they exist
                                if (
                                  org.categories &&
                                  Array.isArray(org.categories)
                                ) {
                                  setSelectedCategories(
                                    org.categories.map(
                                      (cat: any) => cat.id || cat
                                    )
                                  );
                                } else {
                                  setSelectedCategories([]);
                                }
                                // Set dates if they exist
                                if (org.start_date) {
                                  setDate(org.start_date);
                                }
                                if (org.end_date) {
                                  setDate2(org.end_date);
                                }
                                setIsAddDiscountModalOpen(true);
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
                                  title: t(
                                    "discount.form.delete_confirmation_title"
                                  ),
                                  description: t(
                                    "discount.form.delete_confirmation_message"
                                  ),
                                  confirmText: t("discount.form.yes_delete"),
                                  cancelText: t("alert.cancel"),
                                  onConfirm: () => {
                                    deleteDiscount(org.id);
                                  },
                                  onCancel: () => {
                                    // Discount deletion cancelled
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
          </div>
        </div>
      </div>

      {/* Add Discount Modal */}
      {isAddDiscountModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddDiscountModalOpen(false);
              setIsEditMode(false);
              setSelectedDiscount(null);
              setFormData({
                name: "",
                percent: "",
                barcode: "",
              });
              setSelectedCategories([]);
              setDate(undefined);
              setDate2(undefined);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
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
                  setFormData({
                    name: "",
                    percent: "",
                    barcode: "",
                  });
                  setSelectedCategories([]);
                  setDate(undefined);
                  setDate2(undefined);
                }}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-hidden">
              <h3 className="text-base font-medium text-gray-900 mb-5">
                {t("discount_modal.select_region")}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Left Section - Category Selection */}

                {/* Parent Category List */}
                <div className="space-y-4 col-span-3">
                  <div className="space-y-2 relative max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {categoriesLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loading />
                      </div>
                    ) : categoriesError ? (
                      <div className="text-center py-12 text-red-600">
                        {categoriesError}
                      </div>
                    ) : !categories?.length ? (
                      <div className="text-center py-12 text-gray-500">
                        {t("app.company.not_found")}
                      </div>
                    ) : (
                      categories?.map((category: any, index: number) => (
                        <div key={category.id} className="space-y-2 relative">
                          <div
                            className={`bg-gray-50 rounded border relative px-3 py-2 flex items-center justify-between`}
                          >
                            <div className="text-sm">{category.name}</div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  toggleCategorySelection(category.id)
                                }
                                className={`cursor-pointer px-3 py-1 rounded text-xs transition-colors ${
                                  selectedCategories.includes(category.id)
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {selectedCategories.includes(category.id)
                                  ? t("discount_modal.selected")
                                  : t("discount_modal.select")}
                              </button>
                              <button
                                onClick={() =>
                                  getChildrenCategories(category.id)
                                }
                                className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              >
                                {t("discount_modal.show")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Children Category List */}
                <div className="space-y-4 col-span-2">
                  <div className="space-y-2 relative max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {childrenLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loading />
                      </div>
                    ) : childrenError ? (
                      <div className="text-center py-12 text-red-600">
                        {childrenError}
                      </div>
                    ) : !childrenCategories?.length ? (
                      <div className="text-center py-12 text-gray-500 overflow-hidden">
                        {selectedParentCategory
                          ? t("app.company.not_found")
                          : t("discount_modal.select_parent_category")}
                      </div>
                    ) : (
                      childrenCategories?.map((childCategory: any) => (
                        <div
                          key={childCategory.id}
                          className="space-y-2 relative"
                        >
                          <div className="bg-gray-50 rounded border relative px-3 py-2 flex items-center justify-between">
                            <div className="text-sm">{childCategory.name}</div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  toggleCategorySelection(childCategory.id)
                                }
                                className={`cursor-pointer px-3 py-1 rounded text-xs transition-colors ${
                                  selectedCategories.includes(childCategory.id)
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {selectedCategories.includes(childCategory.id)
                                  ? t("discount_modal.selected")
                                  : t("discount_modal.select")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 col-span-2">
                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={t("discount.form.discount_name")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={formLoading}
                    />
                  </div>

                  {/* Percent Input */}
                  <div>
                    <input
                      type="number"
                      value={formData.percent}
                      onChange={(e) =>
                        setFormData({ ...formData, percent: e.target.value })
                      }
                      placeholder={t("discount.form.discount_percent")}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={formLoading}
                    />
                  </div>

                  {/* Barcode Input */}
                  <div>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      placeholder={t("discount.form.barcode")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={formLoading}
                    />
                  </div>

                  {/* start date */}

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal text-sm"
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

                  {/* end date */}
                  <Popover open={open2} onOpenChange={setOpen2}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal text-sm"
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
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDiscountModalOpen(false);
                  setIsEditMode(false);
                  setSelectedDiscount(null);
                  setFormData({
                    name: "",
                    percent: "",
                    barcode: "",
                  });
                  setSelectedCategories([]);
                  setDate(undefined);
                  setDate2(undefined);
                }}
                disabled={formLoading}
                className="px-6"
              >
                {t("discount_modal.cancel")}
              </Button>
              <Button
                type="button"
                onClick={isEditMode ? updateDiscount : createDiscount}
                disabled={formLoading}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {formLoading
                  ? isEditMode
                    ? t("discount.form.updating")
                    : t("discount.form.creating")
                  : isEditMode
                  ? t("discount.form.update_discount")
                  : t("discount_modal.add")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile version - show DesktopOnlyMessage */}
      <div className="lg:hidden">
        <DesktopOnlyMessage />
      </div>
    </div>
  );
}
