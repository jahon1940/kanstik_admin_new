"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

import Loading from "@/components/Loading";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";
import { getDeviceToken } from "@/lib/token";
import { Pagination } from "@/components/ui/pagination";

type Organization = {
  id: number;
  name: string;
  phone_number: string;
  username: string;
};

export default function ClientsPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();

  const pathname = usePathname();

  const requestData = {
    url: null,
    search: "",
    organization_id: null,
    brands: null,
    categories: null,
    price_from: null,
    price_to: null,
    order_by: null,
  };

  const fetchClients = async (searchQuery: string = "", page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...requestData,
        search: searchQuery,
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/companies/search?page=${page}&page_size=50`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Device-Token": `Kanstik ${getDeviceToken()}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setClients(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 50));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setClients([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Sahifa yuklanganda birinchi marta ma'lumotlarni olish
  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchClients(value, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClients(query, page);
  };

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
                onChange={handleSearchChange}
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
                  <th className="text-left font-semibold px-4 py-2 border-b w-[60%] border-r border-gray-300">
                    {t("app.company.name")}
                  </th>
                  <th className="text-left font-semibold px-4 py-2 border-b w-[40%] border-r border-gray-300">
                    {t("app.stock.phone")}
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
                ) : clients.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground border border-border rounded-lg"
                      colSpan={3}
                    >
                      {t("app.company.not_found")}
                    </td>
                  </tr>
                ) : (
                  clients.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td className="border border-border border-r-0 rounded-l-lg">
                        <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                          {(currentPage - 1) * 50 + index + 1}
                        </div>
                      </td>
                      <td className="border border-border border-r-0">
                        <Link
                          className="block px-4 py-2"
                          href={{
                            pathname: `${pathname}/client/${org.id}`,
                            query: { name: org.name },
                          }}
                        >
                          <h2 className="leading-[20px]">{org.name}</h2>
                          {org.username ? (
                            <span className="text-[10px] text-primary">
                              username: {org.username}
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-500">
                              Аккаунт несоздан
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="border border-border border-l-0 rounded-r-lg">
                        <Link
                          className="block px-4 py-2"
                          href={{
                            pathname: `${pathname}/client/${org.id}`,
                            query: { name: org.name },
                          }}
                        >
                          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {org.phone_number}
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
            ) : clients.length === 0 ? (
              <div className="p-4 text-muted-foreground border border-border rounded-lg text-sm">
                {t("app.company.not_found")}
              </div>
            ) : (
              clients.map((org) => (
                <Link
                  key={org.id}
                  href={{
                    pathname: `${pathname}/client/${org.id}`,
                    query: { name: org.name },
                  }}
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
          {/* Pagination */}
          {!loading && !error && clients.length > 0 && totalPages > 1 && (
            <div className="p-3 md:p-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
