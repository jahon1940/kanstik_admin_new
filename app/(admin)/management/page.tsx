"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import Link from "next/link";
import { Package, Users, UserCheck, Percent, Tag, Gift } from "lucide-react";

export default function ManagementPage() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const managementLinks = [
    {
      id: "products",
      href: `${pathname}/products`,
      title: t("menu.link1"),
      icon: Package,
      description: t("menu.link1_desc"),
    },
    {
      id: "clients",
      href: `${pathname}/clients`,
      title: t("menu.link2"),
      icon: Users,
      description: t("menu.link2_desc"),
    },
    {
      id: "managers",
      href: `${pathname}/managers`,
      title: t("menu.link3"),
      icon: UserCheck,
      description: t("menu.link3_desc"),
    },
    {
      id: "discount",
      href: `${pathname}/discount`,
      title: t("menu.link4"),
      icon: Percent,
      description: t("menu.link4_desc"),
    },
    {
      id: "discount-category",
      href: `${pathname}/discount-category`,
      title: t("menu.link6"),
      icon: Tag,
      description: t("menu.link6_desc"),
    },
    {
      id: "kvi_discount",
      href: `${pathname}/kvi_discount`,
      title: t("menu.link5"),
      icon: Gift,
      description: t("menu.link5_desc"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <h1 className="text-base md:text-xl font-semibold truncate">
          {t("nav.management")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
            {t("nav.management")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {managementLinks.map((link) => {
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
