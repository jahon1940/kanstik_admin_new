"use client";

import { getDeviceToken } from "@/lib/token";
import { cn } from "@/lib/utils";
import { useParams, useSearchParams, useRouter } from "next/navigation";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
const DiscountContent = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);


    const params = useParams();
    

    // Discount state
    const [enableDiscount, setEnableDiscount] = React.useState<boolean>(false);
    const [discountValue, setDiscountValue] = React.useState<number>(0);

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


  return (
    <div className="w-full mt-0">
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
            {loading ? t("app.pos.applying") : t("app.pos.apply_changes")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountContent;
