"use client";
import { Sidebar, MobileNav } from "@/components/navigation";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main
        className={
          collapsed
            ? "md:pl-16 pb-16 md:pb-0 px-2 md:px-4"
            : "md:pl-60 pb-16 md:pb-0 px-2 md:px-4"
        }
      >
        <div className="max-w-8xl mx-auto py-2 px-2 md:px-4">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
