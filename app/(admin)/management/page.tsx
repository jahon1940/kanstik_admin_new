"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import Link from "next/link";
import ArrowIcon from "@/components/icons/arrow";
import { Package, Users, UserCheck, Percent, Tag, Gift } from "lucide-react";

export default function ReportsPage() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const managementLinks = [
    {
      id: "products",
      href: `${pathname}/products`,
      label: t("menu.link1"),
      icon: Package,
    },
    {
      id: "clients",
      href: `${pathname}/clients`,
      label: t("menu.link2"),
      icon: Users,
    },
    {
      id: "managers",
      href: `${pathname}/managers`,
      label: t("menu.link3"),
      icon: UserCheck,
    },
    {
      id: "discount",
      href: `${pathname}/discount`,
      label: t("menu.link4"),
      icon: Percent,
    },
    {
      id: "discount-category",
      href: `${pathname}/discount-category`,
      label: t("menu.link6"),
      icon: Tag,
    },
    {
      id: "kvi_discount",
      href: `${pathname}/kvi_discount`,
      label: t("menu.link5"),
      icon: Gift,
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

      <div className="rounded-lg bg-card shadow-lg p-3 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="space-y-4 w-full md:w-1/2">
          {managementLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.id}
                href={{
                  pathname: link.href,
                  // query: { name: data?.name },
                }}
                className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
                <ArrowIcon />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
