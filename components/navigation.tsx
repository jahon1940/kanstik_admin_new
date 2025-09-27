"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  BarChart3,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getI18n, supportedLanguages } from "@/lib/i18n";
import * as Select from "@radix-ui/react-select";

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

export function Navbar({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-secondary border-b border-primary flex items-center px-4 z-40 justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-white hover:bg-primary/20 transition-colors cursor-pointer"
          aria-label="Sidebarni almashtirish"
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <div className="font-semibold text-white">hoomo Admin Retailer</div>
      </div>
      <div className="text-white">
        <Select.Root
          value={i18n.language}
          onValueChange={(v) => i18n.changeLanguage(v)}
        >
          <Select.Trigger
            aria-label="Language"
            className="inline-flex items-center justify-between gap-2 rounded-md border border-primary/40 bg-secondary px-3 py-1.5 text-sm text-white shadow-sm hover:bg-primary/20 focus:outline-none"
          >
            <Select.Value placeholder={t(`lang.${i18n.language}`)} />
            <Select.Icon>
              <ChevronDown className="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Content className="z-50 rounded-md border border-primary/40 bg-secondary text-white shadow-lg">
            <Select.Viewport className="p-1">
              {supportedLanguages.map((lng) => (
                <Select.Item
                  key={lng}
                  value={lng}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-primary/20 focus:bg-primary/20"
                >
                  <Select.ItemText>{t(`lang.${lng}`)}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </div>
    </header>
  );
}

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();

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
          collapsed ? "p-2 overflow-y-hidden" : "p-2 overflow-y-auto"
        )}
      >
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-white flex items-center rounded-md py-2 text-sm transition-colors min-w-0 h-10",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted hover:text-primary",
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
              "flex rounded-2xl flex-col items-center justify-center text-xs text-white gap-1",
              active ? "bg-primary text-white" : "text-white"
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
