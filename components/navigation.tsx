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

export type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

export const navItems: NavItem[] = [
  {
    label: "nav.companies",
    href: "/companies",
    icon: (p) => <Building2 className={p.className} />,
  },
  {
    label: "nav.reports",
    href: "/reports",
    icon: (p) => <BarChart3 className={p.className} />,
  },
  {
    label: "nav.clients",
    href: "/clients",
    icon: (p) => <Users className={p.className} />,
  },
  {
    label: "nav.webapp",
    href: "/webapp",
    icon: (p) => <Globe className={p.className} />,
  },
];

export function Navbar({ collapsed }: { collapsed?: boolean }) {
  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-secondary border-b border-muted/20 flex items-center px-4 z-40 justify-between">
      <div className="flex items-center gap-3">
        <div className="font-semibold text-muted">Hoomo Admin Retailer</div>
      </div>
      <div className="text-muted">
        <LanguageSelect />
      </div>
    </header>
  );
}

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

  const handleLogout = () => {
    clearDeviceToken();
    toast.success(t("app.logged_out"));
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex fixed left-0 top-14 bottom-0 border-r z-30 bg-secondary transition-[width] duration-300 overflow-x-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <nav
        className={cn(
          "flex-1 space-y-2",
          collapsed ? "p-2 pt-0 overflow-y-hidden" : "p-2 pt-0 overflow-y-auto"
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
                "text-muted flex items-center rounded-md py-2 text-sm transition-colors min-w-0 h-10",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/70 hover:text-secondary",
                collapsed ? "gap-0 justify-center px-3" : "gap-3 px-4"
              )}
            >
              {item.icon({ className: "h-4 w-4 flex-shrink-0" })}
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

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "w-full text-left text-muted flex items-center rounded-md py-2 text-sm transition-colors min-w-0 h-10",
            "hover:bg-primary/70 hover:text-secondary",
            collapsed ? "gap-0 justify-center px-3" : "gap-3 px-4"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
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
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-secondary border-t grid grid-cols-4 z-40">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex rounded-2xl flex-col items-center justify-center text-xs text-muted gap-1",
              active ? "bg-primary text-muted" : "text-muted"
            )}
            aria-label={item.label}
          >
            {item.icon({ className: "h-5 w-5" })}
          </Link>
        );
      })}
    </nav>
  );
}
