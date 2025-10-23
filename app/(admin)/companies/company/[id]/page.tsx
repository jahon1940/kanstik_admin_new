"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";

import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
// import { api } from "@/lib/api";
import Loading from "@/components/Loading";

import Link from "next/link";
import { useTranslation } from "react-i18next";

type Organization = { id: number; name: string };

export default function CompanyPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const params = useParams();
  const pathname = usePathname();

  const getOrganization = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      `${BASE_URL}/v1/admins/organizations/${params.id}/stocks`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setItems(result.results ?? []);
        setLoading(false);
        setError(null);
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.message || e?.message || t("toast.network_error");
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

  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">{t("app.company.title")}</h1>
      </div>
      <div className="rounded-lg bg-card shadow-lg">
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
        <div className="overflow-auto h-[calc(100vh-15rem)] px-4">
          <table className="w-full text-sm relative border-separate border-spacing-y-2">
            <thead className="sticky top-[0px] z-10 bg-bgColor">
              <tr>
                <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300 border rounded-l-lg">
                  №
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b w-[60%] border border-gray-300 border-l-0">
                  {t("app.company.name")}
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b w-[40%] border-r border-gray-300 border border-l-0 rounded-r-lg">
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
                    {t("toast.no_data")}
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
                    <td className="border border-border">
                      <Link
                        className="block px-4 py-3"
                        href={`${pathname}/stock/${org.id}`}
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td className="border border-border border-l-0 rounded-r-lg">
                      <Link
                        className="block px-4 py-3"
                        href={`${pathname}/stock/${org.id}`}
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
      </div>
    </div>
  );
}
