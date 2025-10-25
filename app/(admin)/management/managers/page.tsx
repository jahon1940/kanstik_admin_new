"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Search } from "lucide-react";

import Loading from "@/components/Loading";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname, useRouter } from "next/navigation";
import { getDeviceToken } from "@/lib/token";
import { Pagination } from "@/components/ui/pagination";

type Organization = {
  id: number;
  name: string;
  phone_number: string;
  username: string;
  role: string;
};

export default function ManagersPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [query, setQuery] = useState("");
  const [managers, setManagers] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();

  const pathname = usePathname();
    const router = useRouter();

  const requestData = {
    search: "",
  };

  const fetchManagers = async (searchQuery: string = "", page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...requestData,
        search: searchQuery,
      };

      const response = await fetch(
        `${BASE_URL}/v1/admins/managers/search?page=${page}&page_size=50`,
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

      setManagers(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 50));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setManagers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load data when page loads for the first ttlarni olish
  useEffect(() => {
    fetchManagers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchManagers(value, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchManagers(query, page);
  };
  
  console.log(managers);
  

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-3 md:px-4 min-h-14 md:min-h-16 shadow-[0px_0px_20px_4px_rgba(0,_0,_0,_0.1)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {/* Qidiruv paneli - responsive */}

        <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-background w-full">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="search"
            placeholder={t("app.search")}
            className="w-full bg-transparent outline-none text-sm md:text-base"
            aria-label={t("app.search")}
            value={query}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-lg bg-card shadow-lg h-[calc(100vh-10rem)] md:h-[calc(100vh-6.5rem)] flex flex-col">
        {/* Jadval container - responsive height */}
        <div className="flex-1 overflow-y-auto  px-3 md:px-4 pb-4">
          {/* Desktop table */}
          <div className="hidden md:block">
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
                    {t("app.stock.role")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className=" rounded-lg px-4 py-6">
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
                ) : managers.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground  rounded-lg"
                      colSpan={3}
                    >
                      {t("app.company.not_found")}
                    </td>
                  </tr>
                ) : (
                  managers.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td className="border border-border border-r-0 rounded-l-lg">
                        <div className="px-2 py-3 w-12 text-center text-sm text-gray-600">
                          {(currentPage - 1) * 50 + index + 1}
                        </div>
                      </td>
                      <td className="border border-border px-4 py-3">
                        <h2 className="leading-[20px]">{org.name}</h2>
                        {org.username ? (
                          <span className="text-[10px] text-primary">
                            username: {org.username}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-500">
                            {t("client.account_not_created")}
                          </span>
                        )}
                      </td>
                      <td className="border border-border border-l-0 rounded-r-lg px-4 py-3">
                        
                          {org.role == "admin" ? (
                            <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                              {org.role}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                              {org.role}
                            </span>
                          )}
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
            ) : managers.length === 0 ? (
              <div className="p-4 text-muted-foreground border border-border rounded-lg text-sm">
                {t("app.company.not_found")}
              </div>
            ) : (
              managers.map((org) => (
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
        </div>
        {/* Pagination */}
        {!loading && !error && managers.length > 0 && totalPages > 1 && (
          <div className="p-2 border-t">
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
  );
}
