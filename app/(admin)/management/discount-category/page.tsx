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

export default function DiscountCategoryPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { t } = useTranslation();
  const { showAlert } = useAlertDialog();

  const [posPaymentTypes, setPosPaymentTypes] = useState<any>(null);

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

  // State for managing expanded lists
  const [expandedList, setExpandedList] = useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<string | undefined>(undefined);

  const [open2, setOpen2] = React.useState(false);
  const [date2, setDate2] = React.useState<string | undefined>(undefined);

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
        `${BASE_URL}/v1/admins/discount-campaigns`,
        requestOptions
      );

      if (response.ok) {
        toast.success(t("discount.form.discount_added_success"));
        setIsAddDiscountModalOpen(false);
        setFormData({ name: "", percent: "" });
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
        `${BASE_URL}/v1/admins/discount-types/${id}`,
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

  useEffect(() => {
    getDiscountTypes();
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
                    setFormData({ name: "", percent: "" });
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
                                });
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
                                    console.log("Discount deletion cancelled");
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
              setFormData({ name: "", percent: "" });
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section - Category Selection */}
                <div className="space-y-4 col-span-2">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {t("discount_modal.select_region")}
                    </h3>
                    {/* Category List */}
                    <div className="space-y-2 relative">
                      {/* category 1 */}
                      <div
                        className={`bg-gray-50 rounded border relative ${
                          expandedList === "list1" ? "z-[100]" : "z-10"
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <span className="text-sm">Category 1</span>
                          <div className="flex gap-2">
                            <button className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                              {t("discount_modal.select")}
                            </button>
                            <button
                              onClick={() => {
                                setExpandedList(
                                  expandedList === "list1" ? null : "list1"
                                );
                              }}
                              className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              {t("discount_modal.show")}
                            </button>
                          </div>
                        </div>

                        {/* District List - Overlay */}
                        {expandedList === "list1" && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-[101] max-h-60 overflow-y-auto">
                            {[
                              {
                                id: 0,
                                name: "test 1",
                              },
                              {
                                id: 1,
                                name: "test 1",
                              },
                              {
                                id: 2,
                                name: "test 1",
                              },
                              {
                                id: 3,
                                name: "test 1",
                              },
                              {
                                id: 4,
                                name: "test 1",
                              },
                            ].map((district) => (
                              <div
                                key={district.id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-sm">{district.name}</span>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                  {t("discount_modal.select")}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* category 2 */}
                      <div
                        className={`bg-gray-50 rounded border relative ${
                          expandedList === "list2" ? "z-[100]" : "z-10"
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                          <span className="text-sm">Category 2</span>
                          <div className="flex gap-2">
                            <button className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                              {t("discount_modal.select")}
                            </button>
                            <button
                              onClick={() => {
                                setExpandedList(
                                  expandedList === "list2" ? null : "list2"
                                );
                              }}
                              className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              {t("discount_modal.show")}
                            </button>
                          </div>
                        </div>

                        {/* District List - Overlay */}
                        {expandedList === "list2" && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-[101] max-h-60 overflow-y-auto">
                            {[
                              {
                                id: 5,
                                name: "test 1",
                              },
                              {
                                id: 6,
                                name: "test 1",
                              },
                              {
                                id: 7,
                                name: "test 1",
                              },
                              {
                                id: 8,
                                name: "test 1",
                              },
                              {
                                id: 9,
                                name: "test 1",
                              },
                            ].map((district) => (
                              <div
                                key={district.id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="text-sm">{district.name}</span>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                  {t("discount_modal.select")}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Title Input */}
                  <div>
                    <input
                      type="text"
                      placeholder={t("discount_modal.enter_title")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      disabled={formLoading}
                    />
                  </div>

                  {/* Percent Input */}
                  <div>
                    <input
                      type="number"
                      placeholder={t("discount_modal.enter_title")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      disabled={formLoading}
                    />
                  </div>

                  {/* Barcode Input */}
                  <div>
                    <input
                      type="number"
                      placeholder={t("discount_modal.enter_title")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
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

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDiscountModalOpen(false);
                    setIsEditMode(false);
                    setSelectedDiscount(null);
                    setFormData({ name: "", percent: "" });
                  }}
                  disabled={formLoading}
                  className="px-6"
                >
                  {t("discount_modal.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Handle form submission here
                    console.log("Form submitted");
                  }}
                  disabled={formLoading}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {t("discount_modal.add")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
