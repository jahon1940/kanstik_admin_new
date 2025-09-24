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
} from "lucide-react";
import { log } from "console";

export type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

export const navItems: NavItem[] = [
  {
    label: "Kompaniya",
    href: "/companies",
    icon: (p) => <Building2 className={p.className} />,
  },
  {
    label: "Hisobotlar",
    href: "/reports",
    icon: (p) => <BarChart3 className={p.className} />,
  },
  {
    label: "Mijozlar",
    href: "/clients",
    icon: (p) => <Users className={p.className} />,
  },
  {
    label: "Veb-sayt va ilova",
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
  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-secondary border-b border-primary flex items-center gap-2 px-4 z-40 ">
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
    </header>
  );
}

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  
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
                {item.label}
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
