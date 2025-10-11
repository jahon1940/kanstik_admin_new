"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  BarChart3,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import * as Select from "@radix-ui/react-select";
import LanguageSelect from "./LanguageSelect";
import Image from "next/image";
import { clearDeviceToken } from "@/lib/token";
import { toast } from "sonner";
import LogOutIcon from "./icons/logout";
import SettingIcon from "./icons/setting";
import SiteIcon from "./icons/site";
import ClientIcon from "./icons/client";
import ReportIcon from "./icons/report";
import CompanyIcon from "./icons/company";
import { useAlertDialog } from "@/contexts/AlertDialogContext";

export type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

export const navItems: NavItem[] = [
  {
    label: "nav.companies",
    href: "/companies",

    icon: (p) => <CompanyIcon className={p.className} />,
  },
  {
    label: "nav.reports",
    href: "/reports",
    icon: (p) => <ReportIcon className={p.className} />,
  },
  {
    label: "nav.clients",
    href: "/clients",
    icon: (p) => <ClientIcon className={p.className} />,
  },
  {
    label: "nav.webapp",
    href: "/webapp",
    icon: (p) => <SiteIcon className={p.className} />,
  },
];

// export function Navbar({ collapsed }: { collapsed?: boolean }) {
//   return (

//   );
// }

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
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
    <aside
      className={cn(
        "hidden md:block fixed left-0 top-0 bottom-0 border-r z-30 bg-secondary transition-[width] duration-300 overflow-x-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <header className=" h-14  border-b border-muted/20 flex items-center px-2">
        <div className="font-semibold text-muted flex items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/images/logo.png" alt="home" width={20} height={20} />
          </div>
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300 text-base",
              collapsed ? "hidden" : "opacity-100 w-auto"
            )}
          >
            Retailer
          </span>
        </div>
      </header>
      <nav
        className={cn(
          "flex-1 space-y-2",
          collapsed ? "p-2 pt-0 overflow-y-hidden" : "p-2 pt-0"
        )}
      >
        <div
          onClick={onToggle}
          className="border-b p-2  flex items-center gap-2 cursor-pointer justify-between"
        >
          {!collapsed && <h2 className="text-muted">MENU</h2>}
          <button
            type="button"
            className="hidden md:inline-flex h-9 w-12 items-center justify-center rounded-md  border-primary/40 text-muted hover:bg-primary/20 transition-colors cursor-pointer "
            aria-label="Sidebarni almashtirish"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <Image
                src="/icons/onmenu.svg"
                alt="home"
                width={20}
                height={20}
              />
            ) : (
              <Image
                src="/icons/offmenu.svg"
                alt="home"
                width={20}
                height={20}
              />
            )}
          </button>
        </div>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-muted flex items-center rounded-md py-2 transition-colors min-w-0 h-10 group text-base",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/70 hover:text-secondary",
                collapsed ? "justify-center px-3" : " px-4"
              )}
            >
              {item.icon({
                className: active
                  ? "[&_path]:stroke-[#FFFFFF]"
                  : "group-hover:[&_path]:stroke-[#FFFFFF]",
              })}
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  collapsed ? "hidden" : "opacity-100 w-auto ml-3"
                )}
              >
                {t(item.label)}
              </span>
            </Link>
          );
        })}

        <hr />

        <Link
          href="/settings"
          className={cn(
            "text-muted flex items-center rounded-md py-2 text-base transition-colors min-w-0 h-10 group",
            pathname?.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary/70 hover:text-secondary",

            collapsed ? "gap-0 justify-center px-3" : "gap-3 px-4"
          )}
        >
          <SettingIcon
            className={cn(
              "group-hover:[&_path]:stroke-[#FFFFFF] ",
              pathname?.startsWith("/settings")
                ? "[&_path]:stroke-[#FFFFFF]"
                : "group-hover:[&_path]:stroke-[#FFFFFF] "
            )}
          />
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300",
              collapsed ? "hidden" : "opacity-100 w-auto ml-3"
            )}
          >
            {t("nav.setting")}
          </span>
        </Link>

        {/* Logout button */}
        <button
          type="button"
          onClick={() => {
            showAlert({
              title: "Подтверждение",
              description: "Вы уверены, что хотите выйти?",
              confirmText: "Да, Выход",
              cancelText: "Отмена",
              onConfirm: () => {
                handleLogout();
              },
              onCancel: () => {
                console.log("Payment addition cancelled");
              },
            });
          }}
          className={cn(
            "w-full text-left text-muted flex items-center rounded-md py-2 text-base transition-colors min-w-0 h-10 hover:bg-[#ED6C3C] hover:text-white group",
            "cursor-pointer",
            collapsed ? "gap-0 justify-center px-3" : "gap-3 px-4"
          )}
        >
          <LogOutIcon className="group-hover:[&_path]:stroke-[#FFFFFF]" />
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-300",
              collapsed ? "hidden" : "opacity-100 w-auto ml-3"
            )}
          >
            {t("nav.logout")}
          </span>
        </button>
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-secondary border-t grid grid-cols-4 z-40 safe-area-pb">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-xs gap-1 p-2",
              active
                ? "bg-primary text-white rounded-lg mx-1 my-1"
                : "text-muted hover:bg-accent/50 rounded-lg mx-1 my-1"
            )}
            aria-label={t(item.label)}
          >
            {item.icon({
              className: cn(
                "w-5 h-5",
                active ? "[&_path]:stroke-[#FFFFFF]" : "[&_path]:stroke-current"
              ),
            })}
            <span
              className={cn(
                "text-[10px] font-medium truncate max-w-full",
                active ? "text-white" : "text-muted-foreground"
              )}
            >
              {t(item.label).replace("nav.", "")}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
