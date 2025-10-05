"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";

import { getDeviceToken } from "@/lib/token";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Pose (kassa) type
type Pose = {
  id: number;
  name: string;
};

// Stock (obyekt) type
type Stock = {
  id: number;
  name: string;
  organization?: string;
  region?: string;
  poses: Pose[];
};

export default function StockPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const params = useParams();
  const router = useRouter();

  const getOrganization = () => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (getDeviceToken()) {
      myHeaders.append("Device-Token", `Kanstik ${getDeviceToken()}`);
    }

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${BASE_URL}/v1/admins/stocks/${params.id}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setData(result ?? null);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">{t("app.company.title")}</h1>
      </div>
      <div className="">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Chap panel */}
          <div className="w-full md:w-1/3 border rounded-2xl p-4 bg-secondary">
            <h1 className="text-xl border-b border-secondary pb-1 mb-1">
              {t("app.stock.account_title")}
            </h1>

            <h1>
              {t("app.stock.organization")}: {data?.organization}
            </h1>
            <h1>
              {t("app.stock.name")}: {data?.name}
            </h1>
            <h1>{t("app.stock.phone")}:</h1>
            <h1>{t("app.stock.address")}:</h1>
            <h1>
              {t("app.stock.region")}: {data?.region}
            </h1>

            <h1 className="border-b border-secondary pb-1 mb-1">
              {t("app.stock.products_by_stocks")}: 29928
            </h1>
          </div>

          {/* O‘ng panel */}
          <div className="flex-1 border rounded-2xl p-4 bg-secondary overflow-auto h-[calc(100vh-6rem)] w-full">
            <h1 className="text-xl mb-3">
              {t("app.stock.cashiers")} ({data?.name}){" "}
            </h1>
            <button className="bg-primary text-white px-4 py-2 rounded-md mb-4 cursor-pointer hover:bg-primary/90">
              {t("app.stock.add_cashier")}
            </button>
            <table className="w-full border-t text-sm">
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
                ) : !data?.poses?.length ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                      {t("app.company.not_found")}
                    </td>
                  </tr>
                ) : (
                  data.poses.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td>
                        <Link
                          className="px-4 py-3 block"
                          href={`/pos/${org.id}`}
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td>
                        <Link
                          className="px-4 py-3 block"
                          href={`/pos/${org.id}`}
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
    </div>
  );
}
