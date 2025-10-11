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
    <div className="space-y-4 ">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16 shadow-lg shadow-black/10 dark:shadow-black/30">
        <h1 className="text-xl font-semibold">{t("app.company.title")}</h1>
      </div>

      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        {/* Qidiruv paneli */}
        <div className="p-4">
          <form
            className="flex items-center gap-3"
            role="search"
            aria-label={t("app.search")}
          >
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background w-full">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="search"
                placeholder={t("app.search")}
                className="w-full bg-transparent outline-none"
                aria-label={t("app.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Jadval: sticky sarlavha, 2 ustun */}
        <div className="overflow-auto h-[calc(100vh-11rem)] px-4 pb-4">
          <table className="w-full text-sm relative border-separate border-spacing-y-2">
            <thead className="sticky -top-[1px] z-10 bg-bgColor">
              <tr>
                <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                  {t("app.company.name")}
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                  {t("app.company.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="border border-border rounded-lg px-4 py-6"
                  >
                    <Loading />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    className="px-4 py-6 text-red-600 border border-border rounded-lg"
                    colSpan={2}
                  >
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-muted-foreground border border-border rounded-lg"
                    colSpan={2}
                  >
                    {t("app.company.not_found")}
                  </td>
                </tr>
              ) : (
                filtered.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-accent/50 cursor-pointer"
                  >
                    <td className=" border border-border border-r-0 rounded-l-lg">
                      <Link className="block px-4 py-3" href={`/company/${org.id}`}>
                        {org.name}
                      </Link>
                    </td>
                    <td className=" border border-border border-l-0 rounded-r-lg">
                      <Link className="block px-4 py-3" href={`/company/${org.id}`}>
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
      </div>
    </div>
  );
}
