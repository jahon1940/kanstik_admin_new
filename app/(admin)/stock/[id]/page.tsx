"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { BASE_URL } from "@/lib/api";
import { getDeviceToken } from "@/lib/token";

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
  const [data, setData] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className=" bg-card">
        <div className="grid gap-6  md:grid-cols-6 ">
          {/* Chap panel */}
          <div className="overflow-auto max-h-[70vh] col-span-6 md:col-span-2 border rounded-2xl p-4">
            <h1 className="text-xl ">Аккаунт магазина</h1>
            <hr />
            <h1>Организация : {data?.organization}</h1>
            <h1>Название : {data?.name}</h1>
            <h1>Телефон :</h1>
            <h1>Адрес :</h1>
            <h1>Регион : {data?.region}</h1>

            <h1>Продукты по складам : 29928</h1>
            <hr />
          </div>

          {/* O‘ng panel */}
          <div className="overflow-auto max-h-[70vh] col-span-6 md:col-span-4 border rounded-2xl p-4">
            <h1 className="text-xl mb-3">Кассы ({data?.name}) </h1>
            <button className="bg-secondary text-white px-4 py-2 rounded-md mb-4">
              Добавить кассу
            </button>
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
                ) : !data?.poses?.length ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={2}>
                      Ma&apos;lumot topilmadi
                    </td>
                  </tr>
                ) : (
                  data.poses.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                      onClick={() => router.push(`/pos/${org.id}`)}
                    >
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
    </div>
  );
}
