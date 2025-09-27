"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
// import { api } from "@/lib/api";
import Loading from "@/components/Loading";
import { BASE_URL } from "@/lib/api";
import Link from "next/link";

type Organization = { id: number; name: string };

export default function CompanyPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();

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

  console.log(filtered);

  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-white hover:bg-primary transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">Kompaniya</h1>
      </div>
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
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full border-t text-sm">
            <thead className="sticky -top-[1px] z-10 bg-muted">
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
                  <tr
                    key={org.id}
                    className="hover:bg-accent/50 cursor-pointer"
                  >
                    <td>
                      <Link
                        className="px-4 py-3 block"
                        href={`/stock/${org.id}`}
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td>
                      <Link
                        className="px-4 py-3 block"
                        href={`/stock/${org.id}`}
                      >
                        <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Aktiv
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
