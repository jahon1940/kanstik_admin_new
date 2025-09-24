"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { toast } from "sonner";
// import { api } from "@/lib/api";
import Loading from "@/components/Loading";

type Organization = { id: number; name: string };

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrganization = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://kanstik.retailer.hoomo.uz/v1/admins/organizations",
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
          e?.response?.data?.message || e?.message || "Yuklashda xatolik";
        if (!cancelled) setError(msg);
        toast.error(msg);
      });
    return () => {
      cancelled = true;
    };

    //   try {
    //     const res = await api.get<{ results: Organization[] }>(
    //       "/v1/admins/organizations"
    //     );
    //
    //   } catch (e: any) {
    //     const msg =
    //       e?.response?.data?.message || e?.message || "Yuklashda xatolik";
    //     if (!cancelled) setError(msg);
    //     toast.error(msg);
    //   } finally {
    //     if (!cancelled) setLoading(false);
    //   }
    // })();
    // return () => {
    //   cancelled = true;
    // };
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
      <h1 className="text-xl font-semibold">Kompaniya</h1>
      <div className="rounded-lg border bg-card">
        {/* Qidiruv paneli */}
        <div className="p-4">
          <form
            className="flex items-center gap-3"
            role="search"
            aria-label="Qidiruv"
          >
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background w-full">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="search"
                placeholder="Qidirish..."
                className="w-full bg-transparent outline-none"
                aria-label="Qidirish"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Jadval: sticky sarlavha, 2 ustun */}
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full border-t text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="text-left font-semibold px-4 py-3 border-b w-[60%]">
                  Nomi
                </th>
                <th className="text-left font-semibold px-4 py-3 border-b w-[40%]">
                  Holati
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={2}>
                    <Loading />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-6 text-red-600" colSpan={2}>
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                    Ma&apos;lumot topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3">{org.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Aktiv
                      </span>
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
