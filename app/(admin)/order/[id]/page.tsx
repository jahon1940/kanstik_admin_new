"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
// import { api } from "@/lib/api";
import Loading from "@/components/Loading";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getDeviceToken } from "@/lib/token";
import Image from "next/image";

type Organization = {
  id: number;
  name: string;
  products: any[];
  head_company?: {
    full_name?: string;
    phone_number?: string;
    // boshqa fieldlar bo‘lsa shu yerda yoziladi
  };
  created_at: string;
  status: string;
  price: number;
  stock: {
    name?: string;
  };
  payment_type: string;
  delivery_type: string;
};

export default function OrderPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [orders, setOrders] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const params = useParams();

  const getOrder = () => {
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

    //kanstik.retailer.hoomo.uz/v1/admins/orders/129/order
    console.log(orders);

    fetch(`${BASE_URL}/v1/admins/orders/${params.id}/order`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);

        if (!cancelled) setOrders(result ?? []);
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
    getOrder();
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  const router = useRouter();

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
        <h1 className="text-xl font-semibold">
          Заказ #{params.id}{" "}
          {orders?.head_company &&
            "| " +
              orders?.head_company?.full_name +
              " | " +
              orders?.head_company?.phone_number}
        </h1>
      </div>
      <div className="rounded-lg border bg-card h-[calc(100vh-6rem)] ">
        {/* Jadval: sticky sarlavha, 2 ustun */}

        {loading ? (
          <Loading />
        ) : error ? (
          <h2>error</h2>
        ) : orders?.products?.length === 0 ? (
          <h2>{t("toast.no_data")}</h2>
        ) : (
          <div className="overflow-auto h-full px-4 relative">
            <table className="w-full mb-3 text-sm ">
              <thead className="sticky -top-[1px] z-10 bg-bgColor ">
                <tr>
                  <th className="text-left font-semibold px-2 py-3 border-b w-12 border-r border-gray-300">
                    №
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                    Название / Артикул
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                    Бренд
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                    Количество
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                    Цена
                  </th>
                  <th className="text-left font-semibold px-4 py-3 border-b border-r border-gray-300">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <Loading />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-4 py-6 text-red-600" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                ) : orders?.products?.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      {t("toast.no_data")}
                    </td>
                  </tr>
                ) : (
                  orders?.products?.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-accent/50 cursor-pointer"
                    >
                      <td className="px-2 py-3 w-12 text-center text-sm text-gray-600 border-r border-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 max-w-80 border-r border-gray-300">
                        <div className="flex gap-2 items-center">
                          <span>
                            <Image
                              src={
                                org.product.image_url
                                  ? `${BASE_URL}${org.product.image_url}`
                                  : "/images/nophoto.png" // yoki default rasm
                              }
                              width={28}
                              height={28}
                              alt={org.name || "image"}
                              className="w-8 h-8 object-contain"
                            />
                          </span>
                          <div>
                            <span className="text-[10px] text-muted">
                              Артикул: {org?.product?.vendor_code}
                            </span>
                            <h2>{org?.name}</h2>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        {org?.product?.brand?.name}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        {org?.quantity} штук
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        {" "}
                        {org?.product?.price?.toLocaleString("ru-RU")} сум
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        {org?.price?.toLocaleString("ru-RU")} сум
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {orders?.products && (
              <div className="flex justify-between text-xs bg-bgColor rounded-xl p-3 mb-4 sticky bottom-0 w-full left-0 z-40 ">
                <div className="flex flex-col gap-2 ">
                  <h2>Дата: {formatDate(orders.created_at)} </h2>
                  <h2>Статус: {orders.status}</h2>
                  <h2>Магазин получение: {orders.stock.name}</h2>
                </div>
                <div className="flex flex-col gap-2 ">
                  <h2>Сумма: {orders?.price?.toLocaleString("ru-RU")} сум</h2>
                  <h2>
                    Тип оплаты:{" "}
                    {orders.payment_type == "byCash" ? "Наличными" : "Картой"}{" "}
                  </h2>
                  <h2>
                    Тип получение:{" "}
                    {orders.delivery_type == "pickup"
                      ? "Самовывоз"
                      : "Доставка"}{" "}
                  </h2>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------- */}
      </div>
    </div>
  );
}
