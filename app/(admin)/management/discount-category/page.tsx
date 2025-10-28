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

  // Responsive state
  const [isDesktop, setIsDesktop] = useState(true);

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
      toast.error(t("discount_modal.please_select_start_date"));
      return;
    }

    if (!date2) {
      toast.error(t("discount_modal.please_select_end_date"));
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error(t("discount_modal.please_select_category"));
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
      toast.error(t("discount_modal.please_select_start_date"));
      return;
    }

    if (!date2) {
      toast.error(t("discount_modal.please_select_end_date"));
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error(t("discount_modal.please_select_category"));
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
            {t("app.management.discounts")}
          </h1>
        </div>
      </div>

      {isDesktop ? (
        <div className="rounded-lg bg-card shadow-lg">
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
                      <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
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
                                      console.log(
                                        "Discount deletion cancelled"
                                      );
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
      ) : (
        <DesktopOnlyMessage />
      )}

      {/* Add/Edit Discount Modal */}
      {isAddDiscountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isEditMode
                  ? t("discount.form.edit_discount")
                  : t("discount.form.add_discount")}
              </h2>
              <button
                onClick={() => {
                  setIsAddDiscountModalOpen(false);
                  setIsEditMode(false);
                  setSelectedDiscount(null);
                  setFormData({ name: "", percent: "", barcode: "" });
                  setSelectedCategories([]);
                  setDate(undefined);
                  setDate2(undefined);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.name")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  placeholder={t("discount.form.enter_name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.percent")}
                </label>
                <input
                  type="number"
                  value={formData.percent}
                  onChange={(e) =>
                    setFormData({ ...formData, percent: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  placeholder={t("discount.form.enter_percent")}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.barcode")}
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  placeholder={t("discount.form.enter_barcode")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.start_date")}
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {date ? date : t("discount.form.select_start_date")}
                      <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date ? new Date(date) : undefined}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate(selectedDate.toISOString().split("T")[0]);
                        }
                        setOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.end_date")}
                </label>
                <Popover open={open2} onOpenChange={setOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {date2 ? date2 : t("discount.form.select_end_date")}
                      <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date2 ? new Date(date2) : undefined}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate2(selectedDate.toISOString().split("T")[0]);
                        }
                        setOpen2(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("discount.form.categories")}
                </label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {categories?.map((category: any) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                        className="rounded"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  setIsAddDiscountModalOpen(false);
                  setIsEditMode(false);
                  setSelectedDiscount(null);
                  setFormData({ name: "", percent: "", barcode: "" });
                  setSelectedCategories([]);
                  setDate(undefined);
                  setDate2(undefined);
                }}
                variant="outline"
                className="flex-1"
              >
                {t("alert.cancel")}
              </Button>
              <Button
                onClick={isEditMode ? updateDiscount : createDiscount}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading
                  ? t("loading")
                  : isEditMode
                  ? t("discount.form.update")
                  : t("discount.form.add")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
