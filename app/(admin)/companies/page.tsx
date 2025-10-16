"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { toast } from "sonner";
// import { api } from "@/lib/api";
import Loading from "@/components/Loading";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Organization = { id: number; name: string };

export default function CompaniesPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const getOrganization = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    fetch(`${BASE_URL}/v1/admins/organizations`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setItems(result.results ?? []);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    getOrganization();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:p-4 min-h-14 md:min-h-16 shadow-lg shadow-black/10 dark:shadow-black/30">
        <h1 className="text-lg md:text-xl font-semibold">
          {t("app.company.title")}
        </h1>
      </div>

      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        {/* Qidiruv paneli - responsive */}
        <div className="p-3 md:p-4">
          <form
            className="flex items-center gap-3"
            role="search"
            aria-label={t("app.search")}
          >
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background w-full">
              <Search
                size={16}
                className="text-muted-foreground flex-shrink-0"
              />
              <input
                type="search"
                placeholder={t("app.search")}
                className="w-full bg-transparent outline-none text-sm md:text-base"
                aria-label={t("app.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Jadval container - responsive height */}
        <div className="overflow-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-11rem)] px-3 md:px-4 pb-4">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm relative border-separate border-spacing-y-2">
              <thead className="sticky -top-[1px] z-10 bg-bgColor">
                <tr>
                  <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300">
                    №
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b w-[60%] border-r border-gray-300">
                    {t("app.company.name")}
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b w-[40%] border-r border-gray-300">
                    {t("app.company.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-border rounded-lg px-4 py-6"
                    >
                      <Loading />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-red-600 border border-border rounded-lg"
                      colSpan={3}
                    >
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground border border-border rounded-lg"
                      colSpan={3}
                    >
                      {t("app.company.not_found")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td className="border border-border border-r-0 rounded-l-lg">
                        <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                          {index + 1}
                        </div>
                      </td>
                      <td className="border border-border border-r-0">
                        <Link
                          className="block px-4 py-3"
                          href={`/company/${org.id}`}
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="border border-border border-l-0 rounded-r-lg">
                        <Link
                          className="block px-4 py-3"
                          href={`/company/${org.id}`}
                        >
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {t("app.company.active")}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="border border-border rounded-lg p-4">
                <Loading />
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 border border-border rounded-lg text-sm">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-muted-foreground border border-border rounded-lg text-sm">
                {t("app.company.not_found")}
              </div>
            ) : (
              filtered.map((org) => (
                <Link
                  key={org.id}
                  href={`/company/${org.id}`}
                  className="block border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {org.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 ml-3 flex-shrink-0">
                      {t("app.company.active")}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
