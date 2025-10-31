"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import {
  Package,
  Tag,
  Boxes,
  Calendar,
  CalendarDays,
  CalendarRange,
  RotateCcw,
  Users,
  DollarSign,
  UserCheck,
  Receipt,
} from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const reportTypes = [
    {
      id: "average_receipt",
      title: t("app.reports.average_receipt_report"),
      icon: Receipt,
      description: t("app.reports.average_receipt_report_desc"),
      href: `${pathname}/receipts`,
    },
    {
      id: "products",
      title: t("app.reports.sales_by_products"),
      icon: Package,
      description: t("app.reports.sales_by_products_desc"),
      href: `${pathname}/products`,
    },
    {
      id: "categories",
      title: t("app.reports.sales_by_categories"),
      icon: Tag,
      description: t("app.reports.sales_by_categories_desc"),
      href: `${pathname}/categories`,
    },
    {
      id: "bundles",
      title: t("app.reports.sales_by_bundles"),
      icon: Boxes,
      description: t("app.reports.sales_by_bundles_desc"),
      href: `${pathname}/bundles`,
    },
    {
      id: "days",
      title: t("app.reports.sales_by_days"),
      icon: Calendar,
      description: t("app.reports.sales_by_days_desc"),
      href: `${pathname}/days`,
    },
    {
      id: "weeks",
      title: t("app.reports.sales_by_weeks"),
      icon: CalendarDays,
      description: t("app.reports.sales_by_weeks_desc"),
      href: `${pathname}/weeks`,
    },
    {
      id: "months",
      title: t("app.reports.sales_by_months"),
      icon: CalendarRange,
      description: t("app.reports.sales_by_months_desc"),
      href: `${pathname}/months`,
    },
    {
      id: "movement",
      title: t("app.reports.movement_report"),
      icon: RotateCcw,
      description: t("app.reports.movement_report_desc"),
      href: `${pathname}/movement`,
    },
    {
      id: "agents",
      title: t("app.reports.agents_report"),
      icon: Users,
      description: t("app.reports.agents_report_desc"),
      href: `${pathname}/agents`,
    },
    {
      id: "financial",
      title: t("app.reports.financial_report"),
      icon: DollarSign,
      description: t("app.reports.financial_report_desc"),
      href: `${pathname}/financial`,
    },
    {
      id: "employees",
      title: t("app.reports.employees_report"),
      icon: UserCheck,
      description: t("app.reports.employees_report_desc"),
      href: `${pathname}/employees`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <h1 className="text-base md:text-xl font-semibold truncate">
          {t("app.reports.title")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
       

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {reportTypes.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.id}
                href={{
                  pathname: link.href,
                  // query: { name: data?.name },
                }}
                className="group bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-row sm:flex-col gap-3 sm:gap-0 items-center text-left sm:text-center sm:space-y-4">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors flex-shrink-0">
                    <IconComponent className="w-6 sm:w-8 h-6 sm:h-8 text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1 text-sm md:text-base">
                      {link.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
