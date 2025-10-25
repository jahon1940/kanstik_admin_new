"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import {  usePathname, useRouter } from "next/navigation";

import Link from "next/link";
import ArrowIcon from "@/components/icons/arrow";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { clearDeviceToken } from "@/lib/token";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SiteIcon from "@/components/icons/site";
import SettingIcon from "@/components/icons/logout";
import LogOutIcon from "@/components/icons/logout";
import SettingsIcon from "@/components/icons/setting";



export default function MenuPage() {
    const pathname = usePathname();
    const router = useRouter();
      const { t } = useTranslation();
      const { showAlert } = useAlertDialog();

       const handleLogout = () => {
         clearDeviceToken();
         toast.success(t("app.logged_out"));
         router.replace("/login");
       };
      
  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <h1 className="text-lg md:text-xl font-semibold">{t("nav.menu")}</h1>
      </div>

      <div className="rounded-lg bg-card shadow-lg p-4 md:p-6 overflow-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)]">
        <div className="space-y-4 w-full md:w-1/2 ">
          <Link
            href={{
              pathname: `/webapp`,
              // query: { name: data?.name },
            }}
            className="bg-primary text-white px-4 py-3 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
          >
            <div className="flex items-center gap-2">
              <SiteIcon className="[&_path]:stroke-[#FFFFFF]" />
              {t("nav.webapp")}
            </div>
            <ArrowIcon />
          </Link>
          <Link
            href={{
              pathname: `/settings`,
              // query: { name: data?.name },
            }}
            className="bg-primary text-white px-4 py-3 rounded-md cursor-pointer hover:bg-primary/90 w-full flex items-center justify-between "
          >
            <div className="flex items-center gap-2">
              <SettingsIcon className="[&_path]:stroke-[#FFFFFF]" />
              {t("nav.setting")}
            </div>

            <ArrowIcon />
          </Link>
          {/* Logout button */}
          <button
            type="button"
            onClick={() => {
              showAlert({
                title: t("logout.confirm_title"),
                description: t("logout.confirm_message"),
                confirmText: t("logout.confirm_yes"),
                cancelText: t("logout.confirm_cancel"),
                onConfirm: () => {
                  handleLogout();
                },
                onCancel: () => {
                  console.log("Payment addition cancelled");
                },
              });
            }}
            className=" text-white px-4 py-3 rounded-md cursor-pointer  w-full flex items-center  gap-2 bg-[#ED6C3C] "
          >
            <LogOutIcon className="[&_path]:stroke-[#FFFFFF]" />
            <span
              className={cn("whitespace-nowrap transition-all duration-300")}
            >
              {t("nav.logout")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
