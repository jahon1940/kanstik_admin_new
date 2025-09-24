"use client";
import { Navbar, Sidebar, MobileNav } from "@/components/navigation";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-dvh">
      <Navbar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Sidebar collapsed={collapsed} />
      <main
        className={
          collapsed
            ? "pt-14 md:pl-16 pb-14 md:pb-0 px-4"
            : "pt-14 md:pl-60 pb-14 md:pb-0 px-4"
        }
      >
        <div className="max-w-8xl mx-auto py-6 px-4">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
