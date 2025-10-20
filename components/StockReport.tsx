"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StockReportProps {
  data: {
    id: string | number;
    created_at: string;
    stock_receipt_sum: number;
    // Qo'shimcha ma'lumotlar
    store_name?: string;
    stock_receipt_count?: number;
    total_amount?: number;
    cashier_info?: {
      receipt_count?: number;
      total_amount?: number;
    };
    pos: any;
    stock: any;
    payment_types: any;
  };
  formatDate: (date: string) => string;
}

const StockReport: React.FC<StockReportProps> = ({ data, formatDate }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  console.log(data);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Birinchi ramka - asosiy ma'lumotlar */}
      <div className=" rounded-t-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h3 className="stock-report-title">
              {t("app.reports.store")}: {data.stock || ""}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("app.reports.receipt_count")}:
              </span>
              <span className="font-semibold text-gray-900">
                {data.stock_receipt_count || 267}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("app.reports.turnover")} ({t("app.pos.sum")}):
              </span>
              <span className="font-semibold text-gray-900">
                {data.stock_receipt_sum?.toLocaleString("ru-RU") ||
                  "10 355 550"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>{t("app.reports.details")}:</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Ikkinchi ramka - to'lov turlari (dropdown content) */}
      {isExpanded && (
        <div className=" rounded-b-lg p-4 bg-white">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t("app.reports.by_payment_types")}:
            </h4>
            <div className="space-y-3">
              {data?.payment_types?.map((item: any) => {
                return (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {item.payment_type_name}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {item?.sum.toLocaleString("ru-RU") || "4 978 340"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kassa ma'lumotlari */}
          {data?.pos?.map((pos: any) => {
            return (
              <div className=" pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-700">
                    {t("app.reports.cashier")}:
                  </span>
                  <span className="text-blue-600 font-medium">
                    {pos?.pos_name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("app.reports.receipt_count")}:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {pos.pos_receipt_count}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("app.reports.turnover")} ({t("app.pos.sum")}):
                      </span>
                      <span className="font-semibold text-gray-900">
                        {pos?.pos_receipt_sum?.toLocaleString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockReport;
