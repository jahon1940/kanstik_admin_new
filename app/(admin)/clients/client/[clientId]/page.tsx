"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

import Loading from "@/components/Loading";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { getDeviceToken } from "@/lib/token";

type ClientData = {
  id: number;
  name: string;
  phone_number: string;
  username: string;
  card_numbers: any;
  bonus: number;
};

export default function ClientPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const clientId = params.clientId as string;

  const fetchClientData = async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/v1/admins/companies/${clientId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Device-Token": `Kanstik ${getDeviceToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClientData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  return (
    <div className="space-y-4">
      {/* Header - responsive */}
      <div className="flex items-center gap-4 bg-secondary rounded-md p-2 pl-4 min-h-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 text-muted hover:bg-primary hover:text-white transition-colors cursor-pointer bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold">{name}</h1>
      </div>

      <div className="rounded-lg bg-card shadow-xl shadow-black/10 dark:shadow-black/30">
        {/* Client ma'lumotlari container - responsive height */}
        <div className="overflow-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-6rem)] px-3 md:px-4 pb-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loading />
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 text-center">{error}</div>
          ) : clientData ? (
            <div className="space-y-6 pt-4">
              {/* Информация о клиенте */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {t("client.info.title")}
                </h2>

                <div className="space-y-3">
                  <div className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    {clientData.name}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 dark:text-gray-400 min-w-[100px]">
                        {t("client.info.phone")}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {clientData.phone_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 dark:text-blue-400 min-w-[100px]">
                        username
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {clientData.username}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Карты */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {t("client.cards.title")}
                </h2>
                {clientData.card_numbers.map((item:any) => {
                  return (
                    <div className="space-y-2 bg-bgColor p-2 rounded shadow">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-400 min-w-[140px]">
                          {t("client.cards.number")}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {item.card_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 dark:text-gray-400 min-w-[140px]">
                          {t("client.cards.bonus")}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {item.bonus} сум
                        </span>
                      </div>
                    </div>
                  );
                })}
               
              </div>
            </div>
          ) : (
            <div className="p-4 text-muted-foreground text-center">
              {t("client.not_found")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
