"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(data);

  return (
    <div className="w-full md:w-1/2 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Birinchi ramka - asosiy ma'lumotlar */}
      <div className=" rounded-t-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h3 className="stock-report-title">
              {t("app.reports.store")}: {data.stock || ""}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className=" bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("app.reports.receipt_count")}:
              </span>
              <span className="font-semibold text-gray-900">
                {data.stock_receipt_count || 267}
              </span>
            </div>
          </div>
          <div className=" bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("app.reports.average_receipt")} ({t("app.pos.sum")}):
              </span>
              <span className="font-semibold text-gray-900">
                {(
                  Number(data.stock_receipt_sum) /
                  Number(data.stock_receipt_count)
                )?.toLocaleString("ru-RU") || "10 355 550"}
              </span>
            </div>
          </div>

          <div className=" bg-gray-50 rounded-lg p-3 border border-gray-200">
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
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 cursor-pointer">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <span>{t("app.reports.details")}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 relative">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("app.reports.details")} - {data.stock || ""}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-[#ed6b3c68] text-[#ff4400] p-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* To'lov turlari */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {t("app.reports.by_payment_types")}:
                </h4>
                <div className="space-y-3">
                  {data?.payment_types?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {item.payment_type_name}:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item?.sum?.toLocaleString("ru-RU") || "4 978 340"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kassa ma'lumotlari */}
              {data?.pos?.map((pos: any, index: number) => (
                <div key={index} className=" pt-4  first:pt-0">
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockReport;
